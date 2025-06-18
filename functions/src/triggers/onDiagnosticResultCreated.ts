import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { findIndex, get, set } from 'lodash';

import onWriteHelper, { FirestoreWriteEventType } from '../utils/firestore/onWriteHelper';
import { getPercentage } from '../utils/utils';
import { sendTemplateEmail } from '../utils/email';

import { DiagnosticFeedActivity, UserDetails } from 'types';

const firestore = admin.firestore();

export const onDiagnosticResultCreated = functions.firestore.document('/diagnosticResults/{id}').onWrite(async (change, context) => {
  const diagnosticResultId = context.params.id;

  const operation = onWriteHelper(change);

  const newDiagnosticResult = change.after.data();
  const oldDiagnosticResult = change.before.data();

  functions.logger.info('Diagnostic result operation: ', {
    operation,
    newDiagnosticResult,
    oldDiagnosticResult
  });

  if (!newDiagnosticResult || operation === FirestoreWriteEventType.Delete) {
    functions.logger.info('Diagnostic result deleted!', {
      oldDiagnosticResult,
      diagnosticResultId,
      authType: context.authType,
      auth: context.auth
    });

    return;
  }

  const userId = newDiagnosticResult.userId;

  const userSnap = await firestore.collection('users').doc(userId).get();
  const user = userSnap.data() as UserDetails;

  functions.logger.info('Retrieved user details: ', { user });

  if (!user) {
    throw new Error('User details were not found');
  }

  try {
    const diagnosticId = newDiagnosticResult?.diagnosticId;
    const diagnosticSnap = await firestore.collection('diagnostics').doc(diagnosticId).get();

    const diagnostic = diagnosticSnap.data();

    if (!diagnostic) {
      functions.logger.error('Diagnostic not found!', {
        diagnostic,
        diagnosticId
      });

      return;
    }

    if (operation === FirestoreWriteEventType.Create) {
      functions.logger.info('New Diagnostic result: ', { newDiagnosticResult });

      const diagnosticFeedAcitivity: DiagnosticFeedActivity = {
        businessId: user.businessId ?? undefined,
        relatedKey: diagnosticSnap.id,
        timestamp: +new Date(),
        type: 'diagnostic',
        userId,
        user: {
          id: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.picture
        }
      };

      // Add the result to the feed
      const feedResponse = await firestore.collection('feed').add(diagnosticFeedAcitivity);

      functions.logger.info('Feed activity created: ', (await feedResponse.get()).data());

      return;
    }

    const createCorrectResult = () => {
      const answersTime = get(newDiagnosticResult, 'answersTime', []);

      const answers = get(newDiagnosticResult, 'answers', []);

      const questions = get(diagnostic, 'questions', []);
      const totalScore = questions.reduce((prev: number, current: Record<string, any>, idx: number) => {
        const answer = answers[idx] ?? '';

        if (answer === current?.correctAnswer) {
          return prev + 1;
        }

        return prev;
      }, 0);

      const totalOfQuestions = get(diagnostic, ['questions', 'length'], 0);

      const scorePercentage = getPercentage(totalScore, totalOfQuestions);
      const totalTime = answersTime.reduce((prev: number, time = 0) => prev + time, 0);

      return {
        totalTime,

        totalScore,
        totalOfQuestions,
        scorePercentage
      };
    };

    set(newDiagnosticResult, 'result', createCorrectResult());

    functions.logger.info('New Diagnostic result: ', {
      newDiagnosticResult
    });

    if (newDiagnosticResult.finished && !newDiagnosticResult.notified) {
      await sendTemplateEmail({
        to: user.email,
        subject: `Diagnostic ${newDiagnosticResult.name} Result`,
        template: '13-diagnostic-result',
        data: {
          user,
          diagnosticResult: {
            ...newDiagnosticResult,
            result: {
              ...newDiagnosticResult.result,
              totalTime: getFormattedTime(newDiagnosticResult.result.totalTime)
            }
          }
        }
      });

      set(newDiagnosticResult, 'notified', true);

      functions.logger.info('[onDiagnosticResultFinished] Diagnostic results e-mail sent');
    }

    await firestore.collection('diagnosticResults').doc(diagnosticResultId).update(newDiagnosticResult);

    set(user, 'level', diagnostic.order + 1);
    functions.logger.info('Updated user level: ', diagnostic.order + 1);

    const userResumedDiagnosticResult = {
      diagnosticId,
      diagnosticResultId,

      name: diagnostic.name,
      order: diagnostic.order,

      totalTime: newDiagnosticResult.result.totalTime,

      totalScore: newDiagnosticResult.result.totalScore,
      totalOfQuestions: newDiagnosticResult.result.totalOfQuestions,
      scorePercentage: newDiagnosticResult.result.scorePercentage
    };

    const resumedDiagnostics = get(user, ['activity', 'stats', 'diagnostics', newDiagnosticResult.category], []);
    const foundDiagnosticResultIndex = findIndex(resumedDiagnostics, { diagnosticResultId });

    if (foundDiagnosticResultIndex >= 0) {
      resumedDiagnostics[foundDiagnosticResultIndex] = userResumedDiagnosticResult;
    } else {
      resumedDiagnostics.push(userResumedDiagnosticResult);
    }

    set(user, ['activity', 'stats', 'diagnostics', newDiagnosticResult.category], resumedDiagnostics);

    await firestore.collection('users').doc(userSnap.id).update(user);
    functions.logger.info('Updated user ', user);

    return;
  } catch (error) {
    functions.logger.error('Critical error', error);
  }
});

const getFormattedTime = (time: number) => {
  if (!time) return '00:00';

  let min: string | number = Math.floor(time / (1000 * 60));
  let sec: string | number = Math.floor((time % (1000 * 60)) / 1000);

  if (min < 10) min = `0${min}`;
  if (sec < 10) sec = `0${sec}`;

  return `${min}:${sec}`;
};
