import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { get, findIndex } from 'lodash';
import { Business, LicenseDocumentWithId, UserDetails, UserDetailsWithId } from 'types';

export const syncBetaUsers = async () => {
  try {
    const firestore = admin.firestore();

    const usersSnap = await firestore.collection('users').get();
    const users = usersSnap.docs.map((snap) => {
      return {
        ...snap.data(),
        id: snap.id
      } as UserDetailsWithId;
    });

    const businessSnap = await firestore.collection('business').doc(functions.config().core.main_business_id).get();
    const business = businessSnap.data() as Business;

    const licensesSnap = await admin.firestore().collection('licenses').where('orderId', '==', 'beta_testing').get();
    const licenses = licensesSnap.docs.map((snap) => {
      return {
        id: snap.id,
        ...snap.data()
      } as LicenseDocumentWithId;
    });

    const usersWithLicenses: { license: LicenseDocumentWithId; user: UserDetailsWithId }[] = [];
    for (const user of users) {
      // @ts-ignore
      const licenseIdx = findIndex(licenses, { userId: user.id });

      if (licenseIdx >= 0) {
        const license = licenses[licenseIdx];
        usersWithLicenses.push({
          user,
          license
        });
        licenses.splice(licenseIdx, 1);
      }
    }
    const promises = [];

    const no = [];
    const yes = [];

    for (const userDetails of usersWithLicenses) {
      const { license, user } = userDetails;

      no.push(userDetails);
      if (user.businessId) {
        continue;
      }

      yes.push(userDetails);

      // @ts-ignore
      // if (user.license) continue;

      const resumedBusiness = {
        id: functions.config().core.main_business_id,
        name: get(business, 'name', null),
        email: get(business, 'email', null),
        timestamp: get(business, 'timestamp')
      };

      const userUpdateValues: Partial<UserDetails> = {
        businessId: functions.config().core.main_business_id,
        license: {
          id: license.id,
          status: get(license, 'status'),

          activationDate: get(license, 'activationDate'),
          expirationDate: get(license, 'expirationDate'),
          purchaseDate: get(license, 'purchaseDate'),

          orderId: get(license, 'orderId'),
          type: get(license, 'type')
        },
        business: resumedBusiness
      };

      const licenseUpdateValue = {
        businessId: functions.config().core.main_business_id,
        business: resumedBusiness
      };

      promises.push(firestore.collection('users').doc(user.id).update(userUpdateValues));
      promises.push(firestore.collection('licenses').doc(license.id).update(licenseUpdateValue));
    }

    await Promise.all(promises);

    return {
      usersWithLicenses,
      no,
      yes
    };
  } catch (error) {
    functions.logger.error('Critical error: ', error);

    return {
      error
    };
  }
};
