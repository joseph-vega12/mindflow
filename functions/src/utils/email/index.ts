import { createEmailClient, mountTemplateBody } from './client';
import * as functions from 'firebase-functions';

import { AvailableEmailTemplates } from '../../types/Email';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: [
    {
      filename: string;
      content: string;
    }
  ];
}

export async function sendEmail(params: SendEmailParams) {
  const emailClient = await createEmailClient();

  await emailClient.sendMail(params);
}

export interface SendTemplateEmailParams {
  to: string | string[];
  subject: string;
  template: AvailableEmailTemplates;
  data: Record<string, any>;
  attachments?: [
    {
      filename: string;
      content: string;
    }
  ];
}

export async function sendTemplateEmail(params: SendTemplateEmailParams) {
  const { template, data, to, subject, attachments } = params;
  functions.logger.info(`lib.email.sendTemplateEmail request: ${JSON.stringify({ template, data, to, subject, attachments })}`);

  try {
    const emailClient = await createEmailClient();

    const html = mountTemplateBody(template, data);

    await emailClient.sendMail({
      from: 'mindflowspeedreading@gmail.com',
      to,
      subject,
      html,
      attachments
    });

    functions.logger.info(`lib.email.sendTemplateEmail success: ${JSON.stringify({ to, subject, attachments })}`);
  } catch (error) {
    functions.logger.error('lib.email.sendTemplateEmail: ', error);
  }
}
