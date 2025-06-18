import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

import { isArray } from 'lodash';

export const assignUsersToBusiness = async (request: Request, response: Response) => {
  const { users, businessId } = request.body;
  if (!users && !isArray(users)) {
    throw new Error('users are required!');
  }
  if (!businessId) {
    throw new Error('business is required!');
  }

  try {
    const batch = admin.firestore().batch();

    for (const user of users) {
      const { value, license } = user;

      const licenseRef = admin.firestore().collection('licenses').doc(license);
      const userRef = admin.firestore().collection('users').doc(value);
      batch.update(licenseRef, {
        businessId: businessId
      });

      batch.update(userRef, {
        businessId: businessId
      });
    }

    await batch.commit();

    response
      .json({
        sucess: true
      })
      .end();

    return true;
  } catch (e) {
    response.status(400).send({
      // @ts-ignore
      message: e.message
    });
  }
};
