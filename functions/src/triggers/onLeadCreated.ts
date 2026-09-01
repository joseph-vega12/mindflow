import * as functions from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { Lead } from 'types';

import { sendTemplateEmail } from '../utils/email';

export const onLeadCreated = onDocumentCreated('leads/{leadId}', async (event) => {
  const snap = event.data;
  if (!snap) {
    functions.logger.warn('[onLeadCreated] No data associated with the event');
    return;
  }
  const lead = snap.data() as Lead;
  const leadId = event.params.leadId;

  functions.logger.info('[onLeadCreated] New lead: ', {
    ...lead,
    id: leadId
  });

  sendTemplateEmail({
    to: 'support@mindflowspeedreading.com',
    subject: 'New Lead - Mindflow Speed Reading',
    template: '18-new-lead-support',
    data: {
      lead,
    }
  })

  functions.logger.info('[onLeadCreated] New lead email sent');
});
