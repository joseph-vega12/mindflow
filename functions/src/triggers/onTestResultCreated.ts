import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { get, set } from 'lodash';
import { FeedActivity, UserActivityStatsReportItem } from 'types';

const firestore = admin.firestore();

const getNewAverage = (oldAverage: number, oldReports: number, newEntry: number) => {
  const newReports = oldReports + 1;
  const averageDiff = (newEntry - oldAverage) / newReports;

  return oldAverage + averageDiff;
};

export const onTestResultCreated = functions.firestore.document('/testResults/{testResultId}').onCreate(async (snap, context) => {
  const testResult = snap.data();
  const testResultId = context.params.testResultId;

  functions.logger.info('New testResult: ', {
    ...testResult,
    id: testResultId
  });

  const userSnap = await firestore.collection('users').doc(testResult.userId).get();
  const user = userSnap.data();

  if (!user) {
    functions.logger.error('User not found: ', testResult.userId);
    throw new Error('User not found');
  }

  functions.logger.log('User found: ', user);

  const testResultFeedActivity: FeedActivity = {
    businessId: user.businessId ?? null,
    relatedKey: testResult.essayId,
    type: testResult.type,
    user: {
      id: testResult.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture
    },
    userId: testResult.userId,
    timestamp: +new Date()
  };

  // Add the result to the feed
  const feedResponse = await firestore.collection('feed').add(testResultFeedActivity);
  functions.logger.info('Feed activity created: ', (await feedResponse.get()).data());

  if (testResult.comprehensionAnswers?.length) {
    functions.logger.info('Comprehension result found!', { testResult });
    const oldComprehensionStatus = get(user, ['activity', 'stats', 'comprehension']);

    const oldComprehensionAverage = oldComprehensionStatus.averageComprehension;
    const totalComprehensionReports = oldComprehensionStatus.totalComprehensionReports;

    const newComprehensionAverage = getNewAverage(oldComprehensionAverage, totalComprehensionReports, testResult.comprehension);

    const newComprehensionData = {
      lastComprehension: testResult.comprehension,
      averageComprehension: newComprehensionAverage,
      totalComprehensionReports: totalComprehensionReports + 1
    };

    set(user, ['activity', 'stats', 'comprehension'], newComprehensionData);

    functions.logger.info('New comprehension data: ', {
      newComprehensionData,
      oldComprehensionStatus: oldComprehensionStatus
    });
  }

  // Handling speedRead testResult
  if (testResult.type === 'speed-read') {
    functions.logger.info('Speed read test type');
    const currentWordSpeedStats = get(user, ['activity', 'stats', 'wordSpeed']);

    // Setting this result as the last one
    set(currentWordSpeedStats, 'lastWordSpeed', testResult.wordSpeed);

    if (!currentWordSpeedStats.firstWordSpeed) {
      set(currentWordSpeedStats, 'firstWordSpeed', testResult.wordSpeed);
    }

    if (!currentWordSpeedStats.bestWordSpeed < testResult.wordSpeed) {
      set(currentWordSpeedStats, 'bestWordSpeed', testResult.wordSpeed);
    }

    const oldAverage = currentWordSpeedStats.averageWordSpeed;
    const totalWordSpeedReports = currentWordSpeedStats.totalWordSpeedReports;

    const newAverage = getNewAverage(oldAverage, totalWordSpeedReports, testResult.wordSpeed);
    set(currentWordSpeedStats, 'averageWordSpeed', newAverage);
    set(currentWordSpeedStats, 'totalWordSpeedReports', totalWordSpeedReports + 1);

    // Setting the updated value
    set(user, ['activity', 'stats', 'wordSpeed'], currentWordSpeedStats);

    functions.logger.info('Speed read user stats: ', user);
  }

  const oldTestResults = get(user, ['activity', 'stats', 'testResults'], []);

  const newUserResumedTestResult: UserActivityStatsReportItem = {
    type: testResult.type,

    essayId: testResult.essayId,
    resultId: testResultId,

    category: testResult.category,

    wordSpeed: testResult.wordSpeed ?? null,
    comprehension: testResult.comprehension ?? null,

    numberOfRounds: testResult.numberOfRounds ?? null,
    numberOfColumns: testResult.numberOfColumns ?? null,

    practiceType: testResult.practiceType ?? null,

    timestamp: +new Date()
  };

  oldTestResults.push(newUserResumedTestResult);

  set(user, ['activity', 'stats', 'testResults'], oldTestResults);

  await firestore.collection('users').doc(testResult.userId).update(user);

  functions.logger.info('Updated user successfully: ', user);

  if (user.businessId) {
    functions.logger.info('Business user: ', user.businessId);

    const businessSnap = await firestore.collection('business').doc(user.businessId).get();
    const business = businessSnap.data();

    functions.logger.info('Business request result: ', business);

    if (business) {
      if (testResult.type === 'speed-read' || testResult.type === 'brain-eye-coordination') {
        const currentBusinessStats = get(business, ['activity', 'stats']);

        const oldAverage = currentBusinessStats?.averageWordSpeed;
        const totalWordSpeedReports = currentBusinessStats?.totalWordSpeedReports;

        const newAverage = getNewAverage(oldAverage, totalWordSpeedReports, testResult.wordSpeed);
        set(business, ['activity', 'stats', 'averageWordSpeed'], newAverage);
        set(business, ['activity', 'stats', 'totalWordSpeedReports'], totalWordSpeedReports + 1);

        if (testResult.comprehensionAnswers?.length) {
          const oldComprehensionAverage = get(business, ['activity', 'stats', 'averageComprehension'], 0);
          const totalComprehensionReports = get(business, ['activity', 'stats', 'totalComprehensionReports'], 0);

          const newComprehensionAverage = getNewAverage(oldComprehensionAverage, totalComprehensionReports, testResult.comprehension);

          set(business, ['activity', 'stats', 'totalComprehensionReports'], totalComprehensionReports + 1);
          set(business, ['activity', 'stats', 'averageComprehension'], newComprehensionAverage);
        }
      }
      await firestore.collection('business').doc(user.businessId).update(business);
    }
  }

  functions.logger.info('Finished processing testResult: ', testResultId);
});
