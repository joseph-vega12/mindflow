import * as functions from 'firebase-functions';

import * as firestore from '@google-cloud/firestore';
const client = new firestore.v1.FirestoreAdminClient();
const firestoreClient = new firestore.Firestore();

// Replace BUCKET_NAME
const bucket = 'gs://mindflow-firestore-backup';

// 6am est
export const scheduledFirestoreBackup = functions.pubsub.schedule('every 24 hours').onRun((context) => {});
// '5-one-week-inactive' -> Not seen in last 7 days // onInactive
// '3-one-week-incomplete-onboarding' -> Not finished tutorial after 7 days // onTutorialIncomplete
// '4-two-weeks-incomplete-onboarding' -> Not finished tutorial after 14 days // onTutorialIncomplete
// '6-three-weeks-inactive' -> Not seen in last 21 days // onInactive
// '7-five-weeks-inactive' -> Not seen in last 35 days // onInactive
// '8-ten-weeks-inactive' -> Not seen in last 50 days // onInactive
// '9-one-week-no-second-diagnostic-test' -> no second diagnostic for last 7 days // onNoSecondDiagnosticTest
// '10-one-week-no-third-diagnostic-test' -> no third diagnostic for last 7 days // onNoThirdDiagnosticTest
// '12-feedback'; -> 3 days after finished the program // FEEDBACK

// 13 - License invitation
// 14 - License expiration
