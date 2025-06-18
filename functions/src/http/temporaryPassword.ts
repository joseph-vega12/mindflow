import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

import { sendTemplateEmail } from '../utils/email';

export const temporaryPassword = async (request: Request, response: Response) => {
  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const { email, temporaryPassword } = request.body;

    if (!email) {
      throw new Error('Email is required');
    }

    if (!temporaryPassword) {
      throw new Error('Temporary Password is required');
    }

    // It automatically throws an error if the email is not found
    const user = await admin.auth().getUserByEmail(email);

    const userRecordSnap = await admin.firestore().collection('users').doc(user.uid).get();
    const userRecord = await userRecordSnap.data();

    if (!userRecord) {
      throw new Error('User not found');
    }

    const oneHour = 60 * 60 * 1000;
    const expiresAt = +new Date() + oneHour;

    const passwordResetRequest = await admin
      .firestore()
      .collection('passwordResetRequest')
      .add({
        user: {
          id: user.uid,
          name: userRecord.firstName,
          email: userRecord.email
        },
        expiresAt
      });

    await sendTemplateEmail({
      to: email,
      subject: 'Temporary Password - MindFlow Speed Reading',
      template: 'temporary-password',
      data: {
        user: {
          name: userRecord.firstName,
          temporaryPassword: temporaryPassword
        },
        code: passwordResetRequest.id
      }
    });

    return response.status(200).json({
      message: 'Email sent',
      ok: true,
      user,
      userRecord,
      code: passwordResetRequest.id
    });
  } catch (e) {
    response.status(400).send({
      // @ts-ignore
      message: e.message
    });
  }
};
