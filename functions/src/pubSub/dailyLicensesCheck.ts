import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';

import { ELicenseStatus, License, LicenseDocumentWithId } from 'types';
import { WithFieldValue } from 'firebase-admin/firestore';

export const dailyLicensesCheck = onSchedule('every day 00:00', async () => {
  try {
    const todayDate = +new Date();

    const licensesSnap = await admin
      .firestore()
      .collection('licenses')
      .where('status', '==', ELicenseStatus.ACTIVE)
      .where('expirationDate', '<', todayDate)
      .withConverter<LicenseDocumentWithId>({
        fromFirestore: (doc) => ({
          id: doc.id,
          ...(doc.data() as License)
        }),
        toFirestore: (doc: WithFieldValue<License>) => doc
      })
      .get();

    const licenses = licensesSnap.docs.map((snap) => snap.data());

    for (const license of licenses) {
      await admin.firestore().collection('licenses').doc(license.id).update({
        status: ELicenseStatus.EXPIRED
      });

      functions.logger.error('[dailyLicenseCheck] license updated to expired: ', license);

      // TODO: send an email to the user
      // const emailData = {
      //   to: user.email,
      //   subject: 'Your license has expired',
      //   template: 'license-expired',
      //   data: {
      //     user: [user.firstName, user.lastName].join(' '),
      //     license: license.type
      //   }
      // };

      // await sendTemplateEmail(emailData);
    }
  } catch (err) {
    functions.logger.error('[dailyLicenseCheck] critical error: ', err);
  }
});
