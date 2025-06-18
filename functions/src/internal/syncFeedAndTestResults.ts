import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { FeedActivity, FeedActivityWithId, TestResult, TestResultWithId, UserDetails } from 'types';

export const syncFeedAndTestResults = async () => {
  try {
    const firestore = admin.firestore();

    const usersSnap = await firestore.collection('users').get();
    const users = usersSnap.docs.reduce((prev, snap) => {
      return {
        ...prev,
        [snap.id]: snap.data() as UserDetails
      };
    }, {}) as Record<string, UserDetails>;

    const feedActivitiesSnap = await firestore.collection('feed').get();
    const feedActivities = feedActivitiesSnap.docs.map((snap) => {
      return {
        ...snap.data(),
        id: snap.id
      } as FeedActivityWithId;
    });

    const testResultsSnap = await firestore.collection('testResults').get();
    const testResults = testResultsSnap.docs.map((snap) => {
      return {
        ...snap.data(),
        id: snap.id
      } as TestResultWithId;
    });

    const feed = [];
    const results = [];

    for (const feedActivity of feedActivities) {
      // @ts-ignore
      const { userId } = feedActivity;
      if (!userId) continue;

      const user = users[userId];
      if (!user) continue;

      const updatedFeedActivity: FeedActivity = {
        ...feedActivity,
        user: {
          id: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.picture
        }
      };

      await firestore.collection('feed').doc(feedActivity.id).update(updatedFeedActivity);
      feed.push({ ...updatedFeedActivity, id: feedActivity.id });
    }

    for (const testResult of testResults) {
      // @ts-ignore
      const { userId } = testResult;
      if (!userId) continue;

      const user = users[userId];
      if (!user) continue;

      const updatedTestResult: TestResult = {
        ...testResult,
        user: {
          id: userId,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.picture
        }
      };

      await firestore.collection('testResults').doc(testResult.id).update(updatedTestResult);
      results.push({ ...updatedTestResult, id: testResult.id });
    }

    return {
      feed,
      results
    };

    // return result;
  } catch (error) {
    functions.logger.error('Critical error: ', error);

    return {
      error
    };
  }
};
