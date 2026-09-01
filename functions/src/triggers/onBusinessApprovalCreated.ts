import * as functions from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { BusinessApproval } from 'types';

import { sendTemplateEmail } from '../utils/email';

const cors = require('cors')({ origin: true });

export const onBusinessApprovalCreated = onDocumentCreated('businessApprovals/{businessApprovalId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    functions.logger.warn('[onBusinessApprovalCreated] No data associated with the event');
    return;
  }
  const businessApproval = snapshot.data() as BusinessApproval;
  const businessApprovalId = event.params.businessApprovalId;

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
