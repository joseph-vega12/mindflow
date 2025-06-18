import * as functions from 'firebase-functions';

import { UserDetails } from 'types';

import { sendTemplateEmail } from '../utils/email';

export const onUserCreated = functions.firestore.document('/users/{userId}').onCreate(async (snap, context) => {
  const user = snap.data() as UserDetails;
  const userId = context.params.userId;

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
