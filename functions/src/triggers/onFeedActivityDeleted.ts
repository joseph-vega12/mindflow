import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { get, set } from 'lodash';

const firestore = admin.firestore();

const activityTypeCounterKeysDictionary = {
  diagnostic: 'diagnostics',
  video: 'videos',
  'brain-eye-coordination': 'brainEyeCoordination',
  'speed-read': 'speedRead',
  practice: 'practices'
};

// This function handles the counters(both user and business) and any kind of special treatment that we need to have in some special cases

export const onFeedActivityDeleted = functions.firestore.document('/feed/{feedActivityId}').onDelete(async (snap, context) => {
  const feedActivity = snap.data();
  const feedActivityId = context.params.feedActivityId;

  functions.logger.info('Removing feed activity counters: ', {
    ...feedActivity,
    id: feedActivityId
  });

  try {
    const feedAcitivityType = feedActivity.type;

    const userSnap = await firestore.collection('users').doc(feedActivity.user.id).get();
    const user = userSnap.data();

    if (!user) {
      functions.logger.error('User not found: ', feedActivity.user.id);
      throw new Error('User not found');
    }

    functions.logger.log('User found: ', user);

    // @ts-ignore
    const counterKey = activityTypeCounterKeysDictionary[feedAcitivityType];

    // Decrease
    const currentTestCount = get(user, ['activity', 'counters', counterKey], 0);

    functions.logger.log('Updating user counter key: ', currentTestCount, counterKey);
    set(user, ['activity', 'counters', counterKey], currentTestCount - 1);

    await firestore.collection('users').doc(feedActivity.user.id).update(user);

    if (user.businessId) {
      functions.logger.info('Business user: ', user.businessId);

      const businessSnap = await firestore.collection('business').doc(user.businessId).get();
      const business = businessSnap.data();

      functions.logger.info('Business request result: ', business);

      // Decrease
      if (business) {
        // Updating counter
        const currentTestCount = get(business, ['activity', 'counters', counterKey], 0);
        set(business, ['activity', 'counters', counterKey], currentTestCount - 1);

        await firestore.collection('business').doc(user.businessId).update(business);

        functions.logger.info('Updating business counters: ', business);
      }
    }

    functions.logger.info('Finished processing the erase of a feed activity: ', feedActivity);
  } catch (error) {
    functions.logger.error('Critical error: ', error);
  }
});
