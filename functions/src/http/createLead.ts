import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { Request, Response } from 'express';

import * as emailValidator from 'email-validator';

export const createLead = async (request: Request, response: Response) => {
  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const { name, email, category, whereDidYouHearAboutUs, whereDidYouHearAboutUsObservation } = request.body;

    if (!name) {
      throw new Error('Name is required!');
    }
    if (!category) {
      throw new Error('Category is required!');
    }

    if (!whereDidYouHearAboutUs) {
      throw new Error('Where Did You Heard About Us is required!');
    }

    if (!email) {
      throw new Error('Email is required!');
    }

    if (!emailValidator.validate(email)) {
      throw new Error('Invalid email!');
    }

    const dbUserSnapShot = await admin.firestore().collection('users').where('email', '==', email).limit(1).get();
    const [user] = dbUserSnapShot.docs.map((d) => d.data());

    functions.logger.log('User found: ', user);
    if (user) {
      throw new Error('This email is already a mindflow user!');
    }

    const dbLeadSnapShot = await admin.firestore().collection('leads').where('email', '==', email).limit(1).get();
    const [oldLead] = dbLeadSnapShot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    if (oldLead) {
      functions.logger.warn('Lead already exists: ', oldLead);

      return response.json({
        lead: oldLead
      });
    }

    const leadData = {
      name,
      email,
      category,
      whereDidYouHearAboutUs,
      whereDidYouHearAboutUsObservation,
      timestamp: +new Date()
    };

    const newLead = await admin.firestore().collection('leads').add(leadData);

    functions.logger.log('Lead created: ', { id: newLead.id, leadData });

    response
      .json({
        lead: {
          id: newLead.id,
          ...leadData
        }
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
