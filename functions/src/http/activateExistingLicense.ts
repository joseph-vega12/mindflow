import axios from 'axios';
import * as qs from 'qs';
import * as convert from 'xml-js';

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { get } from 'lodash';
import { Request, Response } from 'express';

import * as emailValidator from 'email-validator';
import { getAccessToken, retrieveOrder } from '../utils/paypal';

import { License, LicenseDocumentWithId } from 'types';
import { ELicenseStatus } from '../types';

const methodName = 'activateExistingLicense';
export const activateExistingLicense = async (request: Request, response: Response) => {
  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const { user, licenseId, password } = request.body;
    functions.logger.log(`[${methodName}] request: `, {
      user,
      licenseId
    });

    if (!password) {
      throw new Error('Password is required!');
    }

    await validateUserPayload(user);

    const licenseSnapshot = await admin.firestore().collection('licenses').doc(licenseId).get();
    const foundLicense = { id: licenseSnapshot.id, ...licenseSnapshot.data() } as Pick<
      LicenseDocumentWithId,
      'id' | 'status' | 'type' | 'timestamp' | 'orderId' | 'purchaseDate' | 'business' | 'businessId'
    >;

    functions.logger.log(`[${methodName}] license found: `, { foundLicense });

    // @ts-ignore
    if (foundLicense.status !== 'INACTIVE' || foundLicense.user) {
      throw new Error('This license already has already been activated!');
    }

    const authUser = await admin
      .auth()
      .getUserByEmail(user.email)
      .catch((error) => console.warn(error));

    const dbUserSnapshot = await admin.firestore().collection('users').where('email', '==', user.email).get();
    const [dbUser] = dbUserSnapshot.docs.map((doc) => doc.data());

    if (authUser || dbUser) {
      functions.logger.warn(`[${methodName}] AuthUser or dbUser: `, { authUser, dbUser });

      throw new Error('This email is already in use!');
    }

    const newUser = await admin.auth().createUser({
      email: user.email,
      password,
      displayName: `${user.firstName} ${user.lastName}`
    });
    functions.logger.warn(`[${methodName}] New Auth user: `, { id: newUser.uid, email: user.email, t: Object.values(ELicenseStatus ?? {}) });

    const updateLicensePayload: License = {
      ...foundLicense,
      status: ELicenseStatus.ACTIVE,

      businessId: get(foundLicense, 'businessId', null),
      business: get(foundLicense, 'business', null),

      userId: newUser.uid,
      user: {
        id: newUser.uid,
        firstName: get(user, 'firstName', null),
        lastName: get(user, 'lastName', null),
        email: get(user, 'email', null),
        picture: get(user, 'picture', null),
        testType: get(user, 'testType', null),
        difficultLevel: get(user, 'difficultLevel', null)
      },

      activationDate: +new Date(),
      expirationDate: +new Date(Date.now() + 90 * 86400000)
    };

    const newLicense = await admin.firestore().collection('licenses').doc(licenseId).update(updateLicensePayload);

    functions.logger.log(`[${methodName}] License created: `, { newLicense });

    const databaseUser = await admin
      .firestore()
      .collection('users')
      .doc(newUser.uid)
      .set({
        ...user,
        businessId: get(foundLicense, 'businessId', null),
        level: 1,
        licenseId: licenseId,
        activity: {
          tutorial: {
            diagnosticTest: false,
            speedReadingTest: false,
            tutorialVideo: false,
            welcomeVideo: false
          },
          counters: {
            brainEyeCoordination: 0,
            diagnostics: 0,
            practices: 0,
            speedRead: 0,
            videos: 0
          },
          stats: {
            comprehension: {
              averageComprehension: 0,
              lastComprehension: 0,
              totalComprehensionReports: 0
            },
            diagnostics: {},
            videos: {},
            wordSpeed: {
              averageWordSpeed: 0,
              bestWordSpeed: 0,
              firstWordSpeed: 0,
              lastWordSpeed: 0,
              totalWordSpeedReports: 0
            }
          }
        },

        license: {
          id: licenseId,
          status: 'ACTIVE'
        },

        timestamp: +new Date()
      });

    functions.logger.log(`[${methodName}] User created: `, newUser.uid);

    response
      .json({
        user: databaseUser,
        license: updateLicensePayload
      })
      .end();
  } catch (error) {
    functions.logger.error('[activateLicense] Critical error: ', error);

    response.status(400).send({
      // @ts-ignore
      message: error.message
    });
  }
};

const validateUserPayload = (user: Record<string, any>) => {
  if (!user) {
    throw new Error('User is required!');
  }

  if (!user.email) {
    throw new Error('Email is required!');
  }

  if (!emailValidator.validate(user.email)) {
    throw new Error('Invalid email!');
  }

  if (!user.firstName || !user.lastName) {
    throw new Error('First and last name are required!');
  }

  return user;
};

const validatePaypalOrder = async (orderId: string) => {
  const paypalAccessToken = await getAccessToken(functions.config().paypal.client_id, functions.config().paypal.client_secret);
  // const paypalOrder = await retrieveOrder(paypalAccessToken.access_token, orderId);
  const paypalOrder = await retrieveOrder(orderId);
  if (!paypalOrder) {
    throw new Error('Order not found!');
  }

  if (paypalOrder.status !== 'COMPLETED') {
    throw new Error('Payment not found!');
  }

  return paypalOrder;
};

const validateGroupIsoOrder = async (orderId: string) => {
  const resp = await axios.post(
    'https://secure.groupisogateway.com/api/query.php',
    qs.stringify({
      security_key: functions.config().group_iso.security_key,
      transaction_id: Number(orderId)
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  const data = convert.xml2js(resp.data, { compact: true });
  const transaction = get(data, ['nm_response', 'transaction']);

  if (!transaction) {
    throw new Error('Order not found!');
  }

  const status = get(transaction, ['action', 'response_text', '_text']);
  if (status !== functions.config().group_iso.successful_response_status) {
    throw new Error('Payment not found!');
  }

  return transaction;
};
