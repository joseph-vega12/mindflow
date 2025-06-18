import { Request, Response } from 'express';

import * as functions from 'firebase-functions';

import { sendTemplateEmail } from '../utils/email';

const methodName = 'sendFeedback';

export const sendFeedback = async (request: Request, response: Response) => {
  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const { title, description, email } = request.body;

    functions.logger.log(`[${methodName}] request: `, {
      title,
      description,
      email,
    });

    if (!title || typeof title !== 'string') {
      throw new Error('Title is required!');
    }

    if (!description || typeof description !== 'string') {
      throw new Error('Description is required!');
    }

    if (!email || typeof email !== 'string') {
      throw new Error('Email is required!');
    }

    await sendTemplateEmail({
      to: 'business@mindflowspeedreading.com ',
      subject: `[Feedback] ${title}`,
      template: '21-user-feedback',
      data: {
        title,
        description,
        userEmail: email
      }
    })

    response
      .json({ message: 'Feedback e-mail sent' })
      .end();
  } catch (error) {
    functions.logger.error(`[${methodName}] Critical error: `, error);

    response.status(400).send({
      // @ts-ignore
      message: error.message || error
    });
  }
};
