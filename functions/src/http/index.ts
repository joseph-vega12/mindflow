import * as express from 'express';
import * as cors from 'cors';
import * as functions from 'firebase-functions';

import { activateSoldLicense } from './activateSoldLicense';
import { activateExistingLicense } from './activateExistingLicense';
import { approveBusiness } from './approveBusiness';
import { businessApprovalPaymentCallback } from './businessApprovalPaymentCallback';
import { createBetaUser } from './createBetaUser';
import { createBusinessUser } from './createBusinessUser';
import { createBusinessApproval } from './createBusinessApproval';
import { createLead } from './createLead';
import { forgotPassword } from './forgotPassword';
import { resetPassword } from './resetPassword';
import { temporaryPassword } from './temporaryPassword';
import { listFreeSpeedTests } from './listFreeSpeedTests';
import { updateLead } from './updateLead';
import { sendLicenseOrderReceipt } from './sendLicenseOrderReceipt';
import { sendFeedback } from './sendFeedback';

import { syncBetaUsers } from '../internal/syncBetaUsers';
// import { purgeUsers } from '../internal/purgeUsers';
import { syncEssays } from '../internal/syncEssays';
import { syncFeedAndTestResults } from '../internal/syncFeedAndTestResults';
import { syncLicenses } from '../internal/syncLicenses';
import { sendBusinessStudentLicense } from './sendBusinessStudentLicenseCsv';
import { manageCoupon } from './manageCoupon';
import { assignUsersToBusiness } from './assignUsersToBusiness';
import { createCheckoutSession } from './createCheckoutSession';

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// build multiple CRUD interfaces:
app.post('/activateSoldLicense', activateSoldLicense);
app.post('/activateExistingLicense', activateExistingLicense);
app.post('/createBetaUser', createBetaUser);

app.post('/manageCoupon', manageCoupon);

app.post('/createBusinessUser', createBusinessUser);
app.post('/assignUsersToBusiness', assignUsersToBusiness);

app.post('/createLead', createLead);
app.get('/listFreeSpeedTests', listFreeSpeedTests);
app.put('/updateLead', updateLead);

app.post('/forgotPassword', forgotPassword);
app.post('/resetPassword', resetPassword);
app.post('/temporaryPassword', temporaryPassword);
app.post('/sendBusinessStudentLicenses', sendBusinessStudentLicense);

app.post('/businessApprovalPaymentCallback', businessApprovalPaymentCallback);
app.post('/createBusinessApproval', createBusinessApproval);
app.put('/approveBusiness', approveBusiness);
app.post('/sendLicenseOrderReceipt', sendLicenseOrderReceipt);
app.post('/sendFeedback', sendFeedback);
app.post('/createCheckoutSession', createCheckoutSession);

// app.get('/syncFeedAndTestResults', async (req, res) => {
//   return res.json(await syncFeedAndTestResults()).end();
// });
// app.get('/syncLicenses', async (req, res) => {
//   return res.json(await syncLicenses()).end();
// });
// app.get('/syncBetaUsers', async (req, res) => {
//   return res.json(await syncBetaUsers()).end();
// });
// app.get('/syncEssays', async (req, res) => {
//   return res.json(await syncEssays()).end();
// });

// Expose Express API as a single Cloud Function:
export const api = functions.https.onRequest(app);
