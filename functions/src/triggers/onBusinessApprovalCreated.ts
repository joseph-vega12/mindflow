import * as functions from 'firebase-functions';

import { BusinessApproval } from 'types';

import { sendTemplateEmail } from '../utils/email';

const cors = require('cors')({origin: true});

export const onBusinessApprovalCreated = functions.firestore.document('/businessApprovals/{businessApprovalId}').onCreate(async (snap, context) => {
  const businessApproval = snap.data() as BusinessApproval;
  const businessApprovalId = context.params.businessApprovalResultId;

  functions.logger.info('[onBusinessApprovalCreated] New business approval: ', {
    ...businessApproval,
    id: businessApprovalId
  });

  sendTemplateEmail({
    to: 'support@mindflowspeedreading.com',
    subject: 'New Business Approval - Mindflow Speed Reading',
    template: '20-new-business-approval-support',
    data: {
      businessApproval,
    }
  })

  functions.logger.info('[onBusinessApprovalCreated] New business approval email sent');
});
