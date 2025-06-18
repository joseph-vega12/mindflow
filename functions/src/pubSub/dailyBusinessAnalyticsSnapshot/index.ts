// import * as moment from 'moment';
// import * as admin from 'firebase-admin';
// import * as functions from 'firebase-functions';
// import { get } from 'lodash';

// import { createAnaylyticDateSnapshot, incrementAnalyticsKey, setAverageReportAnalyticsKey } from '../dailyAnalyticsSnapshot/helpers';

// import {
//     AnalyticSnapshot,
//     DiagnosticResultDocumentWithId,
//     FirestoreDocumentWithId,
//     AnalyticDateSnapshot,
//     TestResultWithId,
//     UserTestType,
//     UserDetails,
//     VideoFeedActivity
// } from 'types';

// const analyticsCounterKeyMap: Record<UserTestType, keyof AnalyticSnapshot['counters']> = {
//     'speed-read': 'speedRead',
//     'brain-eye-coordination': 'brainEyeCoordination',
//     practice: 'practices'
// };

// export const dailyBusinessAnalyticsSnapshot = functions.pubsub.schedule('1 0 * * *').onRun(async (context) => {
//     const startTimestamp = moment().subtract(1, 'day').startOf('day').unix() * 1000;
//     const endTimestamp = moment().subtract(1, 'day').endOf('day').unix() * 1000;

//     try {
//         const date = moment(startTimestamp, 'x').format('YYYY-MM-DD');
//         // const checkExistingAnalyticsSnapshot = await admin.firestore().collection('analytics').where('timestampPeriod.date', '==', date).limit(1).get();

//         const checkExistingBusinessAnalyticsSnapshot = await admin.firestore().collection('business').get();



//         // iterate over each business find the users that correspond to that business and save them somewhere
//         // once we have the users under that business what we can do is run all the above to gather analytics once the analycits are gathered update the businesses with the analytics.

//         const businessSnap = await admin.firestore().collection('business').get();
//         const usersSnap = await admin.firestore().collection('users').get();


//         const businessUsers: { [key: string]: any[] } = {};

//         businessSnap.docs.map(async (business) => {
//             const businessId = business.id;

//             usersSnap.docs.map((user) => {
//                 const userBusinessId = user.data().businessId;
//                 if (businessId === userBusinessId) {
//                     const userData = {
//                         businessId,
//                         ...user.data()
//                     };

//                     if (businessId in businessUsers) {
//                         businessUsers[businessId].push(userData);
//                     } else {
//                         businessUsers[businessId] = [userData];
//                     }
//                 }
//             });
//         });

//         // we have seperated all users into its own array tied to the business so now we will pass it all into the snapshots to create the business analytics, down the line we will make it so if the business is already present and the timestamp is current we dont need to create another snapshot again for the day

//         for (const key in businessUsers) {
//             if (businessUsers.hasOwnProperty(key)) {
//                 const usersMap: Record<string, UserDetails> = businessUsers[key].reduce((prev, snap) => {
//                     return {
//                         ...prev,
//                         [snap.businessId]: snap as UserDetails
//                     };
//                 }, {});

//                 const analyticDateSnapshot = createAnaylyticDateSnapshot(startTimestamp, endTimestamp);

//                 await handleUsersAndLicensesAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);
//                 await handleTestResultsAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);
//                 await handleDiagnosticResultsAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);
//                 await handleVideosCounterAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);

//                 await admin.firestore().collection('businessAnalytics').add(analyticDateSnapshot);
//                 // functions.logger.info(`[dailyAnalyticsSnapshot] Successfully created daily analytics snapshot: ${JSON.stringify(analyticDateSnapshot)}`);
//             }
//         }
//     } catch (error) {
//         functions.logger.error('[dailyAnalyticsSnapshot] Critical error: ', error);
//     }
// });

// const handleUsersAndLicensesAnalytics = async (
//     analyticsObj: AnalyticDateSnapshot,
//     usersMap: Record<string, UserDetails>,
//     startTimestamp: number,
//     endTimestamp: number
// ) => {
//     const users = Object.values(usersMap);
//     for (const user of users) {
//         // functions.logger.log(user, 'user');
//         if (!user) continue;
//         const { difficultLevel, timestamp, lastSeen, level, license, testType } = user;
//         // Its seems ugly, but it works
//         // Also, it's pretty legible, read one line at a time
//         const analtyicsConfig = { difficultLevel, testType };
//         incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['users', 'total'], 1);

//         // if (timestamp > startTimestamp && timestamp < endTimestamp) {
//         incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['users', 'createdToday'], 1);
//         // }

//         // if (lastSeen && lastSeen > startTimestamp && lastSeen < endTimestamp) {
//         incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['users', 'loggedIn'], 1);
//         // }

//         if (level && level > 0) {
//             const averageLevelPath = ['stats', 'averageLevel'];
//             const levelCounterPath = ['stats', 'totalLevelReports'];

//             setAverageReportAnalyticsKey(analyticsObj, analtyicsConfig, averageLevelPath, levelCounterPath, level);
//         }

//         // User improvement
//         const firstWordSpeed = get(user, ['activity', 'stats', 'wordSpeed', 'firstWordSpeed'], 0);
//         const bestWordSpeed = get(user, ['activity', 'stats', 'wordSpeed', 'bestWordSpeed'], 0);

//         const improvement = Math.floor(((bestWordSpeed - firstWordSpeed) / bestWordSpeed || 1) * 100);
//         const averageImprovementPath = ['stats', 'averageImprovement'];
//         const improvementCounterPath = ['stats', 'totalImprovementReports'];

//         setAverageReportAnalyticsKey(analyticsObj, analtyicsConfig, averageImprovementPath, improvementCounterPath, improvement);

//         // License analytics
//         // if (license?.activationDate && license?.activationDate > startTimestamp && license?.activationDate < endTimestamp) {
//         incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['licenses', 'activatedToday'], 1);
//         // }

//         if (license?.expirationDate && license?.expirationDate > startTimestamp && license?.expirationDate < endTimestamp) {
//             incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['licenses', 'expiredToday'], 1);
//         }

//         if (license?.status === 'ACTIVE') {
//             incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['licenses', 'active'], 1);
//         } else {
//             incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['licenses', 'expired'], 1);
//         }
//     }
// };

// const handleTestResultsAnalytics = async (
//     analyticsObj: AnalyticDateSnapshot,
//     usersMap: Record<string, UserDetails>,
//     startTimestamp: number,
//     endTimestamp: number
// ) => {
//     const testResultsSnap = await admin
//         .firestore()
//         .collection('testResults')
//         // .where('timestamp', '>', startTimestamp)
//         // .where('timestamp', '<=', endTimestamp)
//         .get();
//     const testResults = testResultsSnap.docs.map((snap) => {
//         return {
//             id: snap.id,
//             ...snap.data()
//         };
//     }) as TestResultWithId[];

//     for (const testResult of testResults) {
//         const { comprehension, comprehensionAnswers, type } = testResult;

//         if (!testResult.userId && !testResult.user) continue;
//         const userId = testResult.userId || testResult.user?.id;

//         const user = get(usersMap, [userId]);
//         if (!user) continue;

//         const { difficultLevel, testType } = user;
//         const analtyicsConfig = { difficultLevel, testType };

//         // @ts-ignore
//         const counterKey = analyticsCounterKeyMap[type];
//         if (!counterKey) continue;

//         if (comprehensionAnswers?.length) {
//             const comprehensionAveragePath = ['stats', 'averageComprehension'];
//             const comprehensionCounterPath = ['stats', 'totalComprehensionReports'];

//             setAverageReportAnalyticsKey(analyticsObj, analtyicsConfig, comprehensionAveragePath, comprehensionCounterPath, comprehension);
//         }

//         if (type === 'speed-read') {
//             const wordSpeed = get(testResult, 'wordSpeed', 1);
//             const comprehensionAveragePath = ['stats', 'averageWordSpeed'];
//             const comprehensionCounterPath = ['stats', 'totalWordSpeedReports'];

//             setAverageReportAnalyticsKey(analyticsObj, analtyicsConfig, comprehensionAveragePath, comprehensionCounterPath, wordSpeed);
//         }

//         incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['counters', counterKey], 1);
//     }
// };

// const handleDiagnosticResultsAnalytics = async (
//     analyticsObj: AnalyticDateSnapshot,
//     usersMap: Record<string, UserDetails>,
//     startTimestamp: number,
//     endTimestamp: number
// ) => {
//     const diagnosticResultsSnap = await admin
//         .firestore()
//         .collection('diagnosticResults')
//         .where('timestamp', '>', startTimestamp)
//         .where('timestamp', '<=', endTimestamp)
//         .get();
//     const diagnosticResults = diagnosticResultsSnap.docs.map((snap) => {
//         return {
//             id: snap.id,
//             ...snap.data()
//         } as DiagnosticResultDocumentWithId;
//     });

//     for (const diagnosticResult of diagnosticResults) {
//         const { userId } = diagnosticResult;

//         const user = get(usersMap, [userId]);
//         if (!user) continue;

//         const { difficultLevel, testType } = user;
//         const counterKey = 'diagnostics';

//         const analtyicsConfig = { difficultLevel, testType };
//         incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['counters', counterKey], 1);
//     }
// };

// const handleVideosCounterAnalytics = async (
//     analyticsObj: AnalyticDateSnapshot,
//     usersMap: Record<string, UserDetails>,
//     startTimestamp: number,
//     endTimestamp: number
// ) => {
//     const videoFeedActivitySnap = await admin
//         .firestore()
//         .collection('feed')
//         .where('type', '==', 'video')
//         // .where('timestamp', '>', startTimestamp)
//         // .where('timestamp', '<=', endTimestamp)
//         .get();
//     // functions.logger.log(usersMap.businessId, 'businessId');
//     const videoFeedActivities = videoFeedActivitySnap.docs.map((snap) => {
//         return {
//             id: snap.id,
//             ...snap.data()
//         } as FirestoreDocumentWithId<VideoFeedActivity>;
//     });

//     for (const videoFeedActivity of videoFeedActivities) {
//         // functions.logger.log(videoFeedActivity, 'video feed');
//         const userId = videoFeedActivity.user?.id;
//         if (!userId) continue;

//         const user = get(usersMap, [userId]);
//         if (!user) continue;

//         const { difficultLevel, testType } = user;
//         const counterKey = 'videos';

//         const analtyicsConfig = { difficultLevel, testType };
//         incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['counters', counterKey], 1);
//     }
// };



import * as moment from 'moment';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { get } from 'lodash';

import { createAnaylyticDateSnapshot, incrementAnalyticsKey, setAverageReportAnalyticsKey } from '../dailyAnalyticsSnapshot/helpers';

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

export const dailyBusinessAnalyticsSnapshot = functions.pubsub.schedule('1 0 * * *').onRun(async (context) => {
    const startTimestamp = moment().subtract(1, 'day').startOf('day').unix() * 1000;
    const endTimestamp = moment().subtract(1, 'day').endOf('day').unix() * 1000;

    try {
        const date = moment(startTimestamp, 'x').format('YYYY-MM-DD');

        const checkExistingAnalyticsSnapshot = await admin.firestore().collection('businessAnalytics').where('timestampPeriod.date', '==', date).limit(1).get();

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

        const users = Object.values(usersMap);
        const analyticDateSnapshot = createAnaylyticDateSnapshot(startTimestamp, endTimestamp);

        const businessAnalytics: any[] = [];

        for (const user of users) {
            if (user.businessId === "rsOd2AOttLhig8c8af3h") {
                await handleUsersAndLicensesAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);
                await handleTestResultsAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);
                await handleDiagnosticResultsAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);
                await handleVideosCounterAnalytics(analyticDateSnapshot, usersMap, startTimestamp, endTimestamp);

                let updated = false;

                for (const entry of businessAnalytics) {
                    if (entry[user.businessId]) {
                        entry[user.businessId] = analyticDateSnapshot;
                        updated = true;
                        break;
                    }
                }

                if (!updated) {
                    businessAnalytics.push({ [user.businessId]: analyticDateSnapshot });
                }
            }
        }

        // Now you can store `businessAnalytics` in the database as desired
        // For example, if you're using Firestore, you can do something like:
        await admin.firestore().collection('businessAnalytics').doc(date).set({ analytics: businessAnalytics });


        // functions.logger.log(businessAnalytics, 'businessAnalytics');
        // functions.logger.log(businessAnalytics, 'businessAnalytics return');

        // await admin.firestore().collection('businessAnalytics').add(businessAnalytics);

        // functions.logger.info(`[dailyAnalyticsSnapshot] Successfully created daily analytics snapshot: ${JSON.stringify(businessAnalytics)}`);
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
        // functions.logger.log(user, 'user');
        if (!user) continue;
        const { difficultLevel, timestamp, lastSeen, level, license, testType } = user;
        // Its seems ugly, but it works
        // Also, it's pretty legible, read one line at a time
        const analtyicsConfig = { difficultLevel, testType };
        incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['users', 'total'], 1);

        // if (timestamp > startTimestamp && timestamp < endTimestamp) {
        incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['users', 'createdToday'], 1);
        // }

        // if (lastSeen && lastSeen > startTimestamp && lastSeen < endTimestamp) {
        incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['users', 'loggedIn'], 1);
        // }

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
        // if (license?.activationDate && license?.activationDate > startTimestamp && license?.activationDate < endTimestamp) {
        incrementAnalyticsKey(analyticsObj, analtyicsConfig, ['licenses', 'activatedToday'], 1);
        // }

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
        // .where('timestamp', '>', startTimestamp)
        // .where('timestamp', '<=', endTimestamp)
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
        // .where('timestamp', '>', startTimestamp)
        // .where('timestamp', '<=', endTimestamp)
        .get();

    functions.logger.log(usersMap, 'businessId');
    const videoFeedActivities = videoFeedActivitySnap.docs.map((snap) => {
        return {
            id: snap.id,
            ...snap.data()
        } as FirestoreDocumentWithId<VideoFeedActivity>;
    });

    for (const videoFeedActivity of videoFeedActivities) {
        // functions.logger.log(videoFeedActivity, 'video feed');
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

