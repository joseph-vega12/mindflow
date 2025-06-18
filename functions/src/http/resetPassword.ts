import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

import { sendTemplateEmail } from '../utils/email';

export const resetPassword = async (request: Request, response: Response) => {
  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const { code, password } = request.body;

    if(!code) {
      throw new Error('Code is required');
    }
    
    if(!password) {
      throw new Error('Password is required');
    }

    const passwordResetRequestSnap = await admin.firestore().collection('passwordResetRequest').doc(code).get(); 
    const passwordResetRequest = await passwordResetRequestSnap.data();

    if (!passwordResetRequest) {
      throw new Error('Code not found');
    }

    if(passwordResetRequest.expiresAt < +new Date()) {
      throw new Error('Code expired');
    }

    const passwordResetRequestDeleteSnap = await admin.firestore().collection('passwordResetRequest').doc(code).delete();

    // It automatically throws an error if the email is not found 
    const user = await admin.auth().updateUser(passwordResetRequest.user.id, {
      password
    });

    await sendTemplateEmail({
      to: passwordResetRequest.user.email,
      subject: 'Password Reset Success - MindFlow Speed Reading',
      template: 'password-reset-success',
      data: {
        user: passwordResetRequest.user,
        code: passwordResetRequest.id,
      }
    });      
    'password-reset-success'
    return response.status(200).json({
      message: 'Email sent',
      ok: true,
      user,
      passwordResetRequest,
      code: passwordResetRequest.id,
    })
  } catch (e) {
    response.status(400).send({
      // @ts-ignore
      message: e.message
    });
  }
};
