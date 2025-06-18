import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as moment from 'moment';

import { UserDetails, UserDocumentWithId } from 'types';
import { AvailableEmailTemplates } from '../../types/Email';
import { sendTemplateEmail } from '../../utils/email';

export const dailyInactivityEmails = functions.pubsub.schedule('every day 10:00').onRun(async () => {
  try {
    const todayDate = moment().format('MM/DD/YYYY');

    const usersSnap = await admin
      .firestore()
      .collection('users')
      .withConverter<UserDocumentWithId>({
        fromFirestore: (doc) => ({
          id: doc.id,
          ...(doc.data() as UserDetails)
        }),
        toFirestore: (doc: UserDetails) => doc
      })
      .get();

    const mappedUsers = usersSnap.docs.map((doc) => ({
      ...doc.data(),
      lastSeen: moment(doc.data()?.lastSeen).format('MM/DD/YYYY')
    })) as (UserDocumentWithId & { lastSeen: string })[];

    const usersWithOneWeekInactivity = mappedUsers.filter((user) => moment.duration(moment(todayDate).diff(user.lastSeen)).asDays() === 7);

    const usersWithThreeWeeksInactivity = mappedUsers.filter((user) => moment.duration(moment(todayDate).diff(user.lastSeen)).asDays() === 21);

    const usersWithFiveWeeksInactivity = mappedUsers.filter((user) => moment.duration(moment(todayDate).diff(user.lastSeen)).asDays() === 35);

    const usersWithTenWeeksInactivity = mappedUsers.filter((user) => moment.duration(moment(todayDate).diff(user.lastSeen)).asDays() === 70);

    if (usersWithOneWeekInactivity.length > 0) {
      await handleEmailQueue('one-week', usersWithOneWeekInactivity);
      functions.logger.info('[dailyInactivityEmails] Successfully sent one week inactivity emails');
    }

    if (usersWithThreeWeeksInactivity.length > 0) {
      await handleEmailQueue('three-weeks', usersWithThreeWeeksInactivity);
      functions.logger.info('[dailyInactivityEmails] Successfully sent three weeks inactivity emails');
    }

    if (usersWithFiveWeeksInactivity.length > 0) {
      await handleEmailQueue('five-weeks', usersWithFiveWeeksInactivity);
      functions.logger.info('[dailyInactivityEmails] Successfully sent five weeks inactivity emails');
    }

    if (usersWithTenWeeksInactivity.length > 0) {
      await handleEmailQueue('ten-weeks', usersWithTenWeeksInactivity);
      functions.logger.info('[dailyInactivityEmails] Successfully sent ten weeks inactivity emails');
    }
  } catch (error) {
    functions.logger.error('[dailyInactivityEmails] Critical error: ', error);
  }
});

type EmailType = 'one-week' | 'three-weeks' | 'five-weeks' | 'ten-weeks';

const handleEmailQueue = (type: EmailType, users: UserDocumentWithId[]) => {
  const emailSubject: Record<EmailType, string> = {
    'one-week': 'One Week Inactive - MindFlow Speed Reading',
    'three-weeks': 'Three Weeks Inactive - MindFlow Speed Reading',
    'five-weeks': 'Five Weeks Inactive - MindFlow Speed Reading',
    'ten-weeks': 'Ten Weeks Inactive - MindFlow Speed Reading'
  };

  const emailTemplate: Record<EmailType, AvailableEmailTemplates> = {
    'one-week': '5-one-week-inactive',
    'three-weeks': '6-three-weeks-inactive',
    'five-weeks': '7-five-weeks-inactive',
    'ten-weeks': '8-ten-weeks-inactive'
  };

  const emailPromises = [];

  for (const user of users) {
    emailPromises.push(
      sendTemplateEmail({
        to: user.email,
        subject: emailSubject[type],
        template: emailTemplate[type],
        data: {
          user
        }
      })
    );
  }

  return Promise.all(emailPromises);
};
