import axios from 'axios';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import * as functions from 'firebase-functions';
import { get } from 'lodash';
import { Request, Response } from 'express';

import { cleverClientId, cleverClientSecret } from '../params';
import { License, LicenseDocumentWithId } from 'types';
import { ELicenseStatus } from '../types';
import type { UpdateData } from 'firebase-admin/firestore';

const CLEVER_TOKEN_URL = 'https://clever.com/oauth/tokens';
const CLEVER_ME_URL = 'https://api.clever.com/v3.0/me';

/** Firebase UID for Clever users */
function toCleverFirebaseUid(cleverUserId: string): string {
  return 'clever_' + cleverUserId;
}

export const oauthCleverAuth = async (request: Request, response: Response) => {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' }).end();
  }

  try {
    const { code, redirect_uri } = request.body as { code?: string; redirect_uri?: string };

    if (!code) {
      return response.status(400).json({ message: 'code is required' }).end();
    }
    if (!redirect_uri) {
      return response.status(400).json({ message: 'redirect_uri is required' }).end();
    }

    const clientId = cleverClientId.value();
    const clientSecret = cleverClientSecret.value();
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const tokenResponse = await axios.post<{ access_token: string;[key: string]: unknown }>(
      CLEVER_TOKEN_URL,
      {
        code,
        grant_type: 'authorization_code',
        redirect_uri
      },
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    if (!tokenResponse.data?.access_token) {
      return response.status(200).json(tokenResponse.data).end();
    }

    const meResponse = await axios.get(CLEVER_ME_URL, {
      headers: {
        Authorization: `Bearer ${tokenResponse.data.access_token}`,
        Accept: 'application/json'
      }
    });

    const meData = meResponse.data as Record<string, unknown>;
    const data = meData?.data as any;
    const links = (meData?.links ?? data?.links) as Array<{ rel?: string; uri?: string }> | undefined;

    // let cleverUserId: string | undefined =
    //   data?.id != null ? String(data?.id) : meData?.id != null ? String((meData as { id: unknown }).id) : undefined;
    // if (!cleverUserId && links) {
    //   const canonical = links.find((l) => l?.rel === 'canonical' && l?.uri);
    //   if (canonical?.uri) {
    //     const match = /\/v3\.0\/users\/(.+)$/.exec(String(canonical.uri));
    //     if (match && match[1]) cleverUserId = match[1];
    //   }
    // }

    const cleverUserId = data?.id;

    functions.logger.info('[!!!!oauthCleverAuthINFO!!!!] logging the cleverUserId', cleverUserId);

    if (!cleverUserId) {
      return response.status(200).json({ cleverUserId, ...meData, hasAvailableSeat: false, message: 'Could not determine Clever user id' });
    }


    let districtId: string | undefined =
      data?.district != null ? String(data?.district) : meData?.district != null ? String((meData as { district: unknown }).district) : undefined;
    if (!districtId && links) {
      const districtLink = links.find((l) => l?.rel === 'district' && l?.uri);
      if (districtLink?.uri) {
        const match = /\/v3\.0\/districts\/(.+)$/.exec(String(districtLink.uri));
        if (match && match[1]) districtId = match[1];
      }
    }

    // if(!districtId) {
    //   return response.status(200).json({ ...meData, hasAvailableSeat: false, message: 'Could not determine district id' }).end();
    // }

    functions.logger.info('[!!!!districtID!!!!] logging the districtID', districtId);

    const firebaseUid = toCleverFirebaseUid(cleverUserId as string);

    let existingUid: string | null = null;
    try {
      const existingUser = await getAuth().getUser(firebaseUid);
      existingUid = existingUser.uid;
    } catch {
      const cleverUserIdStr = String(cleverUserId);
      const userByCleverSnap = await admin
        .firestore()
        .collection('users')
        .where('cleverUserId', '==', cleverUserIdStr)
        .limit(1)
        .get();
      if (!userByCleverSnap.empty) {
        existingUid = userByCleverSnap.docs[0].id;
      }
    }

    if (existingUid) {
      const customToken = await getAuth().createCustomToken(existingUid);
      return response.status(200).json({ customToken }).end();
    }

    if (!districtId) {
      return response.status(200).json({ ...meData, hasAvailableSeat: false, message: 'No district associated with this Clever account' }).end();
    }

    const inactiveLicenseSnap = await admin
      .firestore()
      .collection('licenses')
      .where('districtId', '==', districtId)
      .where('status', '==', ELicenseStatus.INACTIVE)
      .limit(1)
      .get();

    if (inactiveLicenseSnap.empty) {
      let uidForToken: string | null = null;
      const existingUserDoc = await admin.firestore().collection('users').doc(firebaseUid).get();
      if (existingUserDoc.exists) uidForToken = firebaseUid;
      if (!uidForToken) {
        const byClever = await admin
          .firestore()
          .collection('users')
          .where('cleverUserId', '==', String(cleverUserId))
          .limit(1)
          .get();
        if (!byClever.empty) uidForToken = byClever.docs[0].id;
      }
      if (uidForToken) {
        const customToken = await getAuth().createCustomToken(uidForToken as string);
        return response.status(200).json({ customToken }).end();
      }
      return response.status(200).json({
        ...meData,
        hasAvailableSeat: false,
        message: 'No available seats for your district. Please contact your school.'
      }).end();
    }

    const licenseId = inactiveLicenseSnap.docs[0].id;
    const licenseSnapshot = await admin.firestore().collection('licenses').doc(licenseId).get();
    const foundLicense = { id: licenseSnapshot.id, ...licenseSnapshot.data() } as Pick<
      LicenseDocumentWithId,
      'id' | 'status' | 'type' | 'timestamp' | 'orderId' | 'purchaseDate' | 'business' | 'businessId'
    >;

    if (foundLicense.status !== ELicenseStatus.INACTIVE || (foundLicense as License).user) {
      return response.status(200).json({ ...meData, hasAvailableSeat: false }).end();
    }

    // const firstName = 'Clever';
    // const lastName = 'User';
    const email = `clever_${cleverUserId}@clever.placeholder`;
    const randomPassword = crypto.randomBytes(32).toString('hex');

    const newUser = await getAuth().createUser({
      uid: firebaseUid,
      email,
      password: randomPassword,
      displayName: `${cleverUserId}`
    });

    const updateLicensePayload: UpdateData<License> = {
      status: ELicenseStatus.ACTIVE,
      userId: newUser.uid,
      user: {
        id: newUser.uid,
        // firstName,
        // lastName,
        email,
        picture: undefined,
        testType: undefined,
        difficultLevel: undefined
      },
      activationDate: +new Date(),
      expirationDate: +new Date(Date.now() + 90 * 86400000)
    };

    await admin.firestore().collection('licenses').doc(licenseId).update(updateLicensePayload);

    await admin
      .firestore()
      .collection('users')
      .doc(newUser.uid)
      .set({
        // firstName,
        // lastName,
        email,
        businessId: null,
        level: 1,
        licenseId,
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
        cleverUserId,
        testType: "act",
        difficultLevel: "high_school",
        schoolName: districtId,
        timestamp: +new Date()
      });

    const customToken = await getAuth().createCustomToken(newUser.uid);
    return response.status(200).json({ customToken }).end();
  } catch (err) {
    const errAny = err as {
      response?: { status?: number; data?: unknown };
      message?: string;
      code?: string;
    };
    const status = errAny.response?.status ?? 500;
    const responseData = errAny.response?.data;
    const redirectUri = (request.body as { redirect_uri?: string })?.redirect_uri;

    const cleverError =
      responseData && typeof responseData === 'object'
        ? (responseData as { error?: string; error_description?: string })
        : undefined;

    const logPayload = {
      status,
      cleverError: cleverError?.error,
      cleverErrorDescription: cleverError?.error_description,
      responseData,
      axiosMessage: errAny.message,
      axiosCode: errAny.code,
      redirectUri
    };

    // 401 from Clever usually means bad client credentials (system misconfig).
    // Other 4xx (e.g. invalid_grant / expired code) are expected user/retry errors.
    const isCredentialFailure = status === 401;
    const isExpectedClientOAuthError = status >= 400 && status < 500 && !isCredentialFailure;

    if (isExpectedClientOAuthError) {
      functions.logger.warn('[oauthCleverAuth] Clever OAuth client/retry error', logPayload);
    } else {
      functions.logger.error('[oauthCleverAuth] Clever OAuth failure', logPayload);
    }

    const message =
      responseData != null ? responseData : { message: 'Token exchange failed' };

    return response.status(status).json(message).end();
  }
};


