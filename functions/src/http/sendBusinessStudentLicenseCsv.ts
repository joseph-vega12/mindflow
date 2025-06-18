import { Request, Response } from 'express';

import * as functions from 'firebase-functions';

import { sendTemplateEmail } from '../utils/email';

const methodName = 'sendBusinessStudentLicense';
const { convertArrayToCSV } = require('convert-array-to-csv');

export const sendBusinessStudentLicense = async (request: Request, response: Response) => {
  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const { email, licenses } = request.body;

    const csvFromArrayOfObjects = convertArrayToCSV(licenses);

    functions.logger.log(`[${methodName}] request: `, request.body);

    if (!email) {
      throw new Error('Email is required!');
    }

    if (!licenses) {
      throw new Error('Licenses is required!');
    }

    await sendTemplateEmail({
      to: email,
      subject: `Student Licenses`,
      template: '22-business-student-licenses-download',
      data: {},
      attachments: [
        {
          filename: 'student-licenses.csv',
          content: csvFromArrayOfObjects
        }
      ]
    });

    response.json({ message: 'Business Student Licenses e-mail sent' }).end();
  } catch (error) {
    functions.logger.error(`[${methodName}] Critical error: `, error);

    response.status(400).send({
      // @ts-ignore
      message: error.message || error
    });
  }
};
