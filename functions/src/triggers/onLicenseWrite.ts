import * as _ from 'lodash';

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';

import onWriteHelper, { FirestoreWriteEventType } from '../utils/firestore/onWriteHelper';

import { LicenseDocumentWithId, UserDetails } from 'types';

const firestore = admin.firestore();

export const onLicenseWrite = onDocumentWritten('licenses/{id}', async (event) => {
  const change = event.data;
  if (!change) {
    functions.logger.warn('[onLicenseWrite] No data associated with the event');
    return;
  }
  const licenseId = event.params.id;

  const operation = onWriteHelper(change);

  const newLicense = { ...change.after.data(), id: licenseId } as LicenseDocumentWithId;
  const oldLicense = { ...change.before.data(), id: licenseId } as LicenseDocumentWithId;

  functions.logger.info('Licenses collection write: ', {
    operation,
    newLicense,
    oldLicense
  });

  if (!newLicense || operation === FirestoreWriteEventType.Delete) {
    functions.logger.info('License deleted!', { licenseId });

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
  } catch (error) { }
});
