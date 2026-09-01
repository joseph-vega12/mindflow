import * as nodemailer from 'nodemailer';
import * as mustache from 'mustache';
import * as path from 'path';
import * as fs from 'fs';
import { google } from 'googleapis';

import { gmailEmail, gmailClientId, gmailClientSecret, gmailRefreshToken } from '../../params';

import { AvailableEmailTemplates } from '../../types/Email';

const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground';

export async function createEmailClient() {
  const email = gmailEmail.value();
  const clientId = gmailClientId.value();
  const clientSecret = gmailClientSecret.value();
  const refreshToken = gmailRefreshToken.value();

  const myOAuth2Client = new OAuth2(clientId, clientSecret, OAUTH_PLAYGROUND);

  await myOAuth2Client.setCredentials({
    refresh_token: refreshToken
  });

  const accessToken = await myOAuth2Client.getAccessToken();

  return nodemailer.createTransport({
    // @ts-ignore
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: email,
      clientId,
      clientSecret,
      refreshToken,
      accessToken
    }
  });
}

export function mountTemplateBody(template: AvailableEmailTemplates, params: Record<string, any>) {
  const mustacheParams = {
    ...params,
    baseUrl: 'https://app.mindflowspeedreading.com'
  };

  const templateFile = path.join(__dirname, 'emails', 'templates', `${template}.html`);
  const templateBody = fs.readFileSync(templateFile).toString('utf-8');

  return mustache.render(templateBody, mustacheParams);
}
