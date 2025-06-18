import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { get } from 'lodash';

import onWriteHelper, { FirestoreWriteEventType } from '../utils/firestore/onWriteHelper';

import { sendTemplateEmail } from '../utils/email';

const firestore = admin.firestore();

export const onUserWrite = functions.firestore.document('/users/{userId}').onWrite(async (change, context) => {
  try {
    const userId = context.params.userId;

    const operation = onWriteHelper(change);

    const oldUser = change.before.data() as Record<string, any>;
    const currentUser = change.after.data() as Record<string, any>;

    if (operation === FirestoreWriteEventType.Create) {
      await onNewUser(userId, currentUser);
    }

    if (operation === FirestoreWriteEventType.Update) {
      await onUpdateUser(userId, oldUser, currentUser);
    }

    if (operation === FirestoreWriteEventType.Delete) {
      functions.logger.info('[onUserWrite]: user deleted', { userId, user: oldUser });
    }
  } catch (error) {
    functions.logger.error('[onUserWrite] critical error: ', error);
  }
});

const onNewUser = async (userId: string, oldUser: Record<string, any>) => {
  functions.logger.info('[onNewUser]: new user ', { userId });

  const newUser = {
    ...oldUser,
    firstName: get(oldUser, 'firstName'),
    lastName: get(oldUser, 'lastName'),
    email: get(oldUser, 'email'),
    profilePhotoUrl: get(oldUser, 'profilePhotoUrl'),
    level: get(oldUser, 'level'),
    testType: get(oldUser, 'testType'),
    difficultLevel: get(oldUser, 'difficultLevel'),
    activity: {
      tutorial: {
        diagnosticTest: false,
        speedReadingTest: false,
        tutorialVideo: false,
        welcomeVideo: false
      },
      counters: {
        brainEyeCoordination: 0,
        diagnostics: 0,
        practices: 0,
        speedRead: 0,
        videos: 0
      },
      stats: {
        comprehension: {
          averageComprehension: 0,
          lastComprehension: 0,
          totalComprehensionReports: 0
        },
        diagnostics: {},
        videos: {},
        wordSpeed: {
          averageWordSpeed: 0,
          bestWordSpeed: 0,
          firstWordSpeed: 0,
          lastWordSpeed: 0,
          totalWordSpeedReports: 0
        }
      }
    }
  };

  sendTemplateEmail({
    to: newUser.email,
    subject: 'Welcome to MindFlow…You can do this!',
    template: '1-welcome',
    data: {
      user: newUser
    }
  });

  await firestore.doc(`users/${userId}`).set(newUser);
};

const onUpdateUser = async (userId: string, oldUser: Record<string, any>, currentUser: Record<string, any>) => {
  const checkTutorialFinished = (user: Record<string, any>) => {
    const tutorial = get(user, ['activity', 'tutorial'], {});
    const tasks: boolean[] = Object.values(tutorial);
    return tasks.every((task) => task);
  };

  const oldUserFinishedTutorial = checkTutorialFinished(oldUser);
  const currentUserFinishedTutorial = checkTutorialFinished(currentUser);

  functions.logger.info('[onUpdateUser]:', { oldUser, currentUser, oldUserFinishedTutorial, currentUserFinishedTutorial });
  if (oldUserFinishedTutorial) return null;
  if (!currentUserFinishedTutorial) return null;

  functions.logger.info('[onUpdateUser]: user finished the tutorial', { userId });

  sendTemplateEmail({
    to: currentUser.email,
    subject: 'Planning for Success Leads to Success',
    template: '2-post-onboarding',
    data: {
      user: currentUser
    }
  });
};
