import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { Request, Response } from 'express';
import { get } from 'lodash';

import * as emailValidator from 'email-validator';
import { BusinessDocumentWithId, License, UserWithDetails } from 'types';
import { ELicenseStatus, ELicenseType } from '../types';

export const createBusinessUser = async (request: Request, response: Response) => {
  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const { user, password } = request.body;

    if (!user) {
      throw new Error('User is required!');
    }

    if (!password) {
      throw new Error('Password is required!');
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

    functions.logger.log('Request', { user });

    const authUser = await admin
      .auth()
      .getUserByEmail(user.email)
      .catch((error) => console.warn(error));

    const dbUserSnapShot = await admin.firestore().collection('users').where('email', '==', user.email).limit(1).get();
    const [dbUser] = dbUserSnapShot.docs.map((d) => d.data());

    if (authUser || dbUser) {
      functions.logger.warn('AuthUser or dbUser found', { authUser, dbUser });

      throw new Error('This email is already in use!');
    }

    const newUser = await admin.auth().createUser({
      email: user.email,
      password,
      displayName: `${user.firstName} ${user.lastName}`
    });

    const businessSnap = await admin.firestore().collection('business').doc(user.businessId).get();
    const business = { id: businessSnap.id, ...businessSnap.data() } as BusinessDocumentWithId;

    const licenseValue: any = {
      status: ELicenseStatus.ACTIVE,
      type: user.license,
      orderId: '',
      provider: 'manual_sell',
      user: {
        id: newUser.uid,
        firstName: get(user, 'firstName'),
        lastName: get(user, 'lastName'),
        email: get(user, 'email')
      },

      business: {
        id: user.businessId,
        name: get(business, 'name'),
        email: get(business, 'email'),
        timestamp: get(business, 'timestamp')
      },

      durationDays: 90,
      purchaseDate: +new Date(),
      activationDate: +new Date(),
      expirationDate: +new Date(Date.now() + 90 * 86400000),

      timestamp: +new Date()
    };

    const newLicense = await admin.firestore().collection('licenses').add(licenseValue);
    functions.logger.log('License created', { newLicense });

    const userValue: UserWithDetails = {
      ...user,

      businessId: user.businessId,
      business: get(licenseValue, 'business'),

      license: {
        id: newLicense.id,
        status: get(licenseValue, 'status'),

        activationDate: get(licenseValue, 'activationDate'),
        expirationDate: get(licenseValue, 'expirationDate'),
        purchaseDate: get(licenseValue, 'purchaseDate'),

        orderId: get(licenseValue, 'orderId'),
        type: get(licenseValue, 'type', null)
      },

      level: 1,
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
      }
    };

    const databaseUser = await admin.firestore().collection('users').doc(newUser.uid).set(userValue);

    functions.logger.log('New user created', newUser.uid);

    response
      .json({
        databaseUser
        // authUser,
      })
      .end();
  } catch (error) {
    functions.logger.error('Critical error: ', error);

    response.status(400).send({
      // @ts-ignore
      message: error.message
    });
  }
};
