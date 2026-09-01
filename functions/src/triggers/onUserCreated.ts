import * as functions from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

import { UserDetails } from 'types';

import { sendTemplateEmail } from '../utils/email';

export const onUserCreated = onDocumentCreated('users/{userId}', async (event) => {
  const snap = event.data;
  if (!snap) {
    functions.logger.warn('[onUserCreated] No data associated with the event');
    return;
  }
  const user = snap.data() as UserDetails;
  const userId = event.params.userId;

  functions.logger.info('[onUserCreated] New user: ', {
    ...user,
    id: userId
  });

  sendTemplateEmail({
    to: 'support@mindflowspeedreading.com',
    subject: 'New User - Mindflow Speed Reading',
    template: '19-new-user-support',
    data: {
      user,
    }
  })

  functions.logger.info('[onUserCreated] New user email sent');
});
