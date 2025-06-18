import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { UserDetails } from 'types';

const Bluebird = require('bluebird');

const usersToPurge: string[] = [
  // CAUTION: This is a list of users to purge.
  '9ebuafmIY7akRSINJtLq4iHcxPo2'
];

const firestore = admin.firestore();
export const purgeUsers = async () => {
  try {
    const users = await getUsersToPurge();
    const usersEntries: [string, UserDetails][] = Object.entries(users);

    functions.logger.info(`[syncFeedAndTestResults]: ${usersEntries.length} users to purge: ${Object.keys(users).join(', ')}`);

    await Bluebird.map(
      usersEntries,
      async ([userId, user]: [string, UserDetails]) => {
        await purgeUser(userId, user);
      },
      { concurrency: 1 }
    );

    return {
      status: 'success'
    };
  } catch (error) {
    functions.logger.error(`[syncFeedAndTestResults]: critical error: ${error}`);

    return {
      error
    };
  }
};

// TODO: business logic, what to purge from trere?
// This function deletes the following resources that are associated with a user:
// - customEssay
// - diagnosticResult
// - feedActivities
// - license
// - testResult
// - user
const purgeUser = async (userId: string, user: UserDetails) => {
  try {
    // Deleting custom essays
    const customEssaysSnap = await firestore.collection('customEssays').where('userId', '==', userId).get();
    await Bluebird.map(customEssaysSnap.docs, (doc: any) => {
      return doc.ref.delete();
    });

    // Deleting diagnostic results
    const diagnosticResultsSnap = await firestore.collection('diagnosticResults').where('userId', '==', userId).get();
    await Bluebird.map(diagnosticResultsSnap.docs, (doc: any) => {
      return doc.ref.delete();
    });

    // Deleting feed activities
    const feedSnap = await firestore.collection('feed').where('user.id', '==', userId).get();
    await Bluebird.map(feedSnap.docs, (doc: any) => {
      return doc.ref.delete();
    });

    if (!user.license?.id) {
      functions.logger.warn(`[purgeUser]: user ${userId} has no license`);
    } else {
      // Deleting license
      await firestore.collection('licenses').doc(user.license.id).delete();
    }

    // Deleting test Results
    const testResultsSnap = await firestore.collection('testResults').where('user.id', '==', userId).get();
    await Bluebird.map(testResultsSnap.docs, (doc: any) => {
      return doc.ref.delete();
    });

    // Deleting user
    await firestore.collection('users').doc(userId).delete();
    await admin.auth().deleteUser(userId);

    functions.logger.info(`[syncFeedAndTestResults]: purged user ${userId}`);
  } catch (error) {
    functions.logger.error(`[syncFeedAndTestResults]: error purging user ${userId}: ${error}`);
  }
};

const getUsersToPurge = async () => {
  const usersSnap = await firestore.collection('users').get();

  return usersSnap.docs.reduce((prev, snap) => {
    if (!usersToPurge.includes(snap.id)) return prev;

    return {
      ...prev,
      [snap.id]: snap.data() as UserDetails
    };
  }, {}) as Record<string, UserDetails>;
};
