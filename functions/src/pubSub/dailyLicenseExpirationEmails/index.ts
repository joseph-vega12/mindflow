import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as moment from 'moment';

import { ELicenseStatus, License, LicenseDocumentWithId } from 'types';

import { AvailableEmailTemplates } from '../../types/Email';

import { sendTemplateEmail } from '../../utils/email';

export const dailyLicenseExpirationEmails = functions.pubsub.schedule('every day 10:00').onRun(async () => {
  try {
    const todayDate = moment().format('MM/DD/YYYY');

    const licensesSnap = await admin
      .firestore()
      .collection('licenses')
      .where('status', '==', ELicenseStatus.ACTIVE)
      .withConverter<LicenseDocumentWithId>({
        fromFirestore: (doc) => ({
          id: doc.id,
          ...(doc.data() as License)
        }),
        toFirestore: (doc: License) => doc
      })
      .get();

    const mappedLicenses = licensesSnap.docs.map((doc) => doc.data() as LicenseDocumentWithId);

    const licensesWithThirtyDaysExpiration = mappedLicenses.filter(
      (license) => moment.duration(moment(todayDate).diff(moment(license.expirationDate).format('MM/DD/YYYY'))).asDays() === 30
    );

    const licensesWithTwoDaysExpiration = mappedLicenses.filter(
      (license) => moment.duration(moment(todayDate).diff(moment(license.expirationDate).format('MM/DD/YYYY'))).asDays() === 2
    );

    if (licensesWithThirtyDaysExpiration.length > 0) {
      await handleEmailQueue('thirty-days', licensesWithThirtyDaysExpiration);
      functions.logger.info('[dailyLicenseExpirationEmails] Successfully sent thirty days expiration e-mail');
    }

    if (licensesWithTwoDaysExpiration.length > 0) {
      await handleEmailQueue('two-days', licensesWithTwoDaysExpiration);
      functions.logger.info('[dailyLicenseExpirationEmails] Successfully sent two days expiration e-mail');
    }
  } catch (error) {
    functions.logger.error('[dailyLicenseExpirationEmails] Critical error: ', error);
  }
});

type EmailType = 'thirty-days' | 'two-days';

const handleEmailQueue = (type: EmailType, licenses: LicenseDocumentWithId[]) => {
  const emailSubject: Record<EmailType, string> = {
    'thirty-days': 'Thirty Days For License Expiration - MindFlow Speed Reading',
    'two-days': 'Two Days For License Expiration - MindFlow Speed Reading'
  };

  const emailTemplate: Record<EmailType, AvailableEmailTemplates> = {
    'thirty-days': '15-thirty-days-license-expiration',
    'two-days': '16-two-days-license-expiration'
  };

  const emailDays: Record<EmailType, number> = {
    'thirty-days': 30,
    'two-days': 2
  };

  const emailPromises = [];

  for (const license of licenses) {
    if (license?.user) {
      emailPromises.push(
        sendTemplateEmail({
          to: license.user.email,
          subject: emailSubject[type],
          template: emailTemplate[type],
          data: {
            user: license.user
          }
        })
      );

      emailPromises.push(
        sendTemplateEmail({
          to: 'support@mindflowspeedreading.com',
          subject: `${license.user.firstName} License Expiration - MindFlow Speed Reading`,
          template: emailTemplate[type],
          data: {
            user: license.user,
            days: emailDays[type]
          }
        })
      );
    }
  }

  return Promise.all(emailPromises);
};
