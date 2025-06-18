import * as functions from 'firebase-functions';

import { Lead } from 'types';

import { sendTemplateEmail } from '../utils/email';

export const onLeadCreated = functions.firestore.document('/leads/{leadId}').onCreate(async (snap, context) => {
  const lead = snap.data() as Lead;
  const leadId = context.params.leadId;

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
