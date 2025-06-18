import * as _ from 'lodash';

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import onWriteHelper, { FirestoreWriteEventType } from '../utils/firestore/onWriteHelper';

import { LicenseDocumentWithId, UserDetails } from 'types';

const firestore = admin.firestore();

export const onLicenseWrite = functions.firestore.document('/licenses/{id}').onWrite(async (change, context) => {
  const licenseId = context.params.id;

  const operation = onWriteHelper(change);

  const newLicense = { ...change.after.data(), id: licenseId } as LicenseDocumentWithId;
  const oldLicense = { ...change.before.data(), id: licenseId } as LicenseDocumentWithId;

  functions.logger.info('Licenses collection write: ', {
    operation,
    newLicense,
    oldLicense
  });

  if (!newLicense || operation === FirestoreWriteEventType.Delete) {
    functions.logger.info('License deleted!', {
      licenseId,
      authType: context.authType,
      auth: context.auth
    });

    return;
  }

  const userId = newLicense.user?.id;

  const userSnap = await firestore
    .collection('users')
    .doc(userId ?? '')
    .get();
  const user = userSnap.data() as UserDetails;

  if (!user || !userId) {
    throw new Error('User details were not found');
  }

  try {
    const updatedUser = {
      ...user,
      license: _.pick(newLicense, ['activationDate', 'expirationDate', 'id', 'orderId', 'purchaseDate', 'status', 'type'])
    };
    await firestore.collection('users').doc(userId).set(updatedUser, { merge: true });
  } catch (error) {}
});
