import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { get, findIndex } from 'lodash';

import { Business, License, LicenseDocumentWithId, UserDetails, UserDetailsWithId } from 'types';

export const syncLicenses = async () => {
  try {
    const firestore = admin.firestore();

    const businessSnap = await firestore.collection('business').get();
    const businesses = businessSnap.docs.reduce((prev, snap) => {
      return {
        ...prev,
        [snap.id]: snap.data()
      };
    }, {});

    const licensesSnap = await firestore.collection('licenses').get();
    const licenses = licensesSnap.docs.map((snap) => {
      return {
        id: snap.id,
        ...snap.data()
      } as LicenseDocumentWithId;
    });

    const usersSnap = await firestore.collection('users').get();
    const users = usersSnap.docs.map((snap) => {
      return {
        ...snap.data(),
        id: snap.id
      } as UserDetailsWithId;
    });

    const usersWithLicenses = [];

    for (const user of users) {
      // @ts-ignore
      const licenseIdx = findIndex(licenses, { userId: user.id });
      // @ts-ignore
      const business = businesses[user.businessId];

      if (licenseIdx >= 0) {
        const license = licenses[licenseIdx];
        usersWithLicenses.push({
          user,
          license,
          business
        });

        licenses.splice(licenseIdx, 1);
      }
    }

    const promises = [];

    for (const userDetails of usersWithLicenses) {
      const { business, license, user } = userDetails;

      // @ts-ignore
      // if (user.license) continue;

      const userUpdateValues: Partial<UserDetails> = {
        license: {
          id: license.id,
          status: get(license, 'status'),

          activationDate: get(license, 'activationDate'),
          expirationDate: get(license, 'expirationDate'),
          purchaseDate: get(license, 'purchaseDate'),

          orderId: get(license, 'orderId'),
          type: get(license, 'type')
        }
      };

      const licenseUpdateValue: Partial<License> = {
        user: {
          id: user.id,
          firstName: get(user, 'firstName', ''),
          lastName: get(user, 'lastName', ''),
          email: get(user, 'email', ''),
          picture: get(user, 'picture', null),
          testType: get(user, 'testType'),
          difficultLevel: get(user, 'difficultLevel')
        }
      };

      if (business) {
        const resumedBusiness = {
          id: business.id,
          name: get(business, 'name', null),
          email: get(business, 'email', null),
          timestamp: get(business, 'timestamp', null)
        };

        userUpdateValues['businessId'] = business.id;
        licenseUpdateValue['businessId'] = business.id;

        userUpdateValues['business'] = resumedBusiness;
        licenseUpdateValue['business'] = resumedBusiness;
      }

      promises.push(firestore.collection('users').doc(user.id).update(userUpdateValues));
      promises.push(firestore.collection('licenses').doc(license.id).update(licenseUpdateValue));
    }

    await Promise.all(promises);

    return {};
  } catch (error) {
    functions.logger.error('Critical error: ', error);

    return {
      error
    };
  }
};
