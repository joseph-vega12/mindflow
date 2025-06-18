import * as admin from 'firebase-admin';
import { Request, Response } from 'express';

import { sendTemplateEmail } from '../utils/email';

export const updateLead = async (request: Request, response: Response) => {
  if (request.method !== 'PUT') {
    return response.status(405).end();
  }

  try {
    const { id, newData } = request.body;

    const updatedLead = {
      ...newData,
      timestamp: +new Date()
    };

    await admin
      .firestore()
      .collection('leads')
      .doc(id)
      .update({
        ...updatedLead
      });

    await sendTemplateEmail({
      to: newData.email,
      subject: 'Practice makes Perfect!',
      template: '23-after-free-speed-read-completed',
      data: {
        user: newData
      }
    });

    response
      .json({
        lead: {
          id,
          ...updatedLead
        }
      })
      .end();
  } catch (e) {
    response.status(400).send({
      // @ts-ignore
      message: e.message
    });
  }
};
