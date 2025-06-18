import * as moment from 'moment';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { get } from 'lodash';

import { createAnaylyticDateSnapshot, incrementAnalyticsKey, setAverageReportAnalyticsKey } from './helpers';

import {
  AnalyticSnapshot,
  DiagnosticResultDocumentWithId,
  FirestoreDocumentWithId,
  AnalyticDateSnapshot,
  TestResultWithId,
  UserTestType,
  UserDetails,
  VideoFeedActivity
} from 'types';

const analyticsCounterKeyMap: Record<UserTestType, keyof AnalyticSnapshot['counters']> = {
  'speed-read': 'speedRead',
  'brain-eye-coordination': 'brainEyeCoordination',
  practice: 'practices'
};

export const dailyAnalyticsSnapshot = functions.pubsub.schedule('1 0 * * *').onRun(async (context) => {
  const startTimestamp = moment().subtract(1, 'day').startOf('day').unix() * 1000;
  const endTimestamp = moment().subtract(1, 'day').endOf('day').unix() * 1000;

  try {
    const date = moment(startTimestamp, 'x').format('YYYY-MM-DD');
    const checkExistingAnalyticsSnapshot = await admin.firestore().collection('analytics').where('timestampPeriod.date', '==', date).limit(1).get();

    if (!checkExistingAnalyticsSnapshot.empty) {
      const [existingAnalyticsSnapshot] = checkExistingAnalyticsSnapshot.docs;

      functions.logger.error(`[dailyAnalyticsSnapshot] Analytics already exists on this date: ${JSON.stringify(existingAnalyticsSnapshot.data())}`);

      return;
    }

    const usersSnap = await admin.firestore().collection('users').get();
    const usersMap: Record<string, UserDetails> = usersSnap.docs.reduce((prev, snap) => {
      return {
        ...prev,
        [snap.id]: snap.data() as UserDetails
      };
    }, {});

    const analyticDateSnapshot = createAnaylyticDateSnapshot(startTimestamp, endTimestamp);

    await handleUsersAndLicensesAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);
    await handleTestResultsAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);
    await handleDiagnosticResultsAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);
    await handleVideosCounterAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);

    await admin.firestore().collection('analytics').add(analyticDateSnapshot);

    functions.logger.info(`[dailyAnalyticsSnapshot] Successfully created daily analytics snapshot: ${JSON.stringify(analyticDateSnapshot)}`);
  } catch (error) {
    functions.logger.error('[dailyAnalyticsSnapshot] Critical error: ', error);
  }
});

const handleUsersAndLicensesAnalytics = async (
  analyticsObj: AnalyticDateSnapshot,
  usersMap: Record<string, UserDetails>,
  startTimestamp: number,
  endTimestamp: number
) => {
  const users = Object.values(usersMap);

  for (const user of users) {
    if (!user) continue;
    const { difficultLevel, timestamp, lastSeen, level, license, testType } = user;

    // Its seems ugly, but it works
    // Also, it's pretty legible, read one line at a time
    const analtyicsConfig = { difficultLevel, testType };
    incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['users', 'total'], 1);

    if (timestamp > startTimestamp && timestamp < endTimestamp) {
      incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['users', 'createdToday'], 1);
    }

    if (lastSeen && lastSeen > startTimestamp && lastSeen < endTimestamp) {
      incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['users', 'loggedIn'], 1);
    }

    if (level && level > 0) {
      const averageLevelPath = ['stats', 'averageLevel'];
      const levelCounterPath = ['stats', 'totalLevelReports'];

      setAverageReportAnalyticsKey(analyticsObj, analtyicsConfig, averageLevelPath, levelCounterPath, level);
    }

    // User improvement
    const firstWordSpeed = get(user, ['activity', 'stats', 'wordSpeed', 'firstWordSpeed'], 0);
    const bestWordSpeed = get(user, ['activity', 'stats', 'wordSpeed', 'bestWordSpeed'], 0);

    const improvement = Math.floor(((bestWordSpeed - firstWordSpeed) / bestWordSpeed || 1) * 100);
    const averageImprovementPath = ['stats', 'averageImprovement'];
    const improvementCounterPath = ['stats', 'totalImprovementReports'];

    setAverageReportAnalyticsKey(analyticsObj, analtyicsConfig, averageImprovementPath, improvementCounterPath, improvement);

    // License analytics
    if (license?.activationDate && license?.activationDate > startTimestamp && license?.activationDate < endTimestamp) {
      incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['licenses', 'activatedToday'], 1);
    }

    if (license?.expirationDate && license?.expirationDate > startTimestamp && license?.expirationDate < endTimestamp) {
      incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['licenses', 'expiredToday'], 1);
    }

    if (license?.status === 'ACTIVE') {
      incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['licenses', 'active'], 1);
    } else {
      incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['licenses', 'expired'], 1);
    }
  }
};

const handleTestResultsAnalytics = async (
  analyticsObj: AnalyticDateSnapshot,
  usersMap: Record<string, UserDetails>,
  startTimestamp: number,
  endTimestamp: number
) => {
  const testResultsSnap = await admin
    .firestore()
    .collection('testResults')
    .where('timestamp', '>', startTimestamp)
    .where('timestamp', '<=', endTimestamp)
    .get();
  const testResults = testResultsSnap.docs.map((snap) => {
    return {
      id: snap.id,
      ...snap.data()
    };
  }) as TestResultWithId[];

  for (const testResult of testResults) {
    const { comprehension, comprehensionAnswers, type } = testResult;

    if (!testResult.userId && !testResult.user) continue;
    const userId = testResult.userId || testResult.user?.id;

    const user = get(usersMap, [userId]);
    if (!user) continue;

    const { difficultLevel, testType } = user;
    const analtyicsConfig = { difficultLevel, testType };

    // @ts-ignore
    const counterKey = analyticsCounterKeyMap[type];
    if (!counterKey) continue;

    if (comprehensionAnswers?.length) {
      const comprehensionAveragePath = ['stats', 'averageComprehension'];
      const comprehensionCounterPath = ['stats', 'totalComprehensionReports'];

      setAverageReportAnalyticsKey(analyticsObj, analtyicsConfig, comprehensionAveragePath, comprehensionCounterPath, comprehension);
    }

    if (type === 'speed-read') {
      const wordSpeed = get(testResult, 'wordSpeed', 1);
      const comprehensionAveragePath = ['stats', 'averageWordSpeed'];
      const comprehensionCounterPath = ['stats', 'totalWordSpeedReports'];

      setAverageReportAnalyticsKey(analyticsObj, analtyicsConfig, comprehensionAveragePath, comprehensionCounterPath, wordSpeed);
    }

    incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['counters', counterKey], 1);
  }
};

const handleDiagnosticResultsAnalytics = async (
  analyticsObj: AnalyticDateSnapshot,
  usersMap: Record<string, UserDetails>,
  startTimestamp: number,
  endTimestamp: number
) => {
  const diagnosticResultsSnap = await admin
    .firestore()
    .collection('diagnosticResults')
    .where('timestamp', '>', startTimestamp)
    .where('timestamp', '<=', endTimestamp)
    .get();
  const diagnosticResults = diagnosticResultsSnap.docs.map((snap) => {
    return {
      id: snap.id,
      ...snap.data()
    } as DiagnosticResultDocumentWithId;
  });

  for (const diagnosticResult of diagnosticResults) {
    const { userId } = diagnosticResult;

    const user = get(usersMap, [userId]);
    if (!user) continue;

    const { difficultLevel, testType } = user;
    const counterKey = 'diagnostics';

    const analtyicsConfig = { difficultLevel, testType };
    incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['counters', counterKey], 1);
  }
};

const handleVideosCounterAnalytics = async (
  analyticsObj: AnalyticDateSnapshot,
  usersMap: Record<string, UserDetails>,
  startTimestamp: number,
  endTimestamp: number
) => {
  const videoFeedActivitySnap = await admin
    .firestore()
    .collection('feed')
    .where('type', '==', 'video')
    .where('timestamp', '>', startTimestamp)
    .where('timestamp', '<=', endTimestamp)
    .get();
  const videoFeedActivities = videoFeedActivitySnap.docs.map((snap) => {
    return {
      id: snap.id,
      ...snap.data()
    } as FirestoreDocumentWithId<VideoFeedActivity>;
  });

  for (const videoFeedActivity of videoFeedActivities) {
    const userId = videoFeedActivity.user?.id;
    if (!userId) continue;

    const user = get(usersMap, [userId]);
    if (!user) continue;

    const { difficultLevel, testType } = user;
    const counterKey = 'videos';

    const analtyicsConfig = { difficultLevel, testType };
    incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['counters', counterKey], 1);
  }
};
