import { defineSecret, defineString } from 'firebase-functions/params';

// PayPal
export const paypalClientId = defineSecret('PAYPAL_CLIENT_ID');
export const paypalClientSecret = defineSecret('PAYPAL_CLIENT_SECRET');
export const paypalUrl = defineString('PAYPAL_URL');

// Gmail / email (defineString so triggers & scheduled functions can use without declaring secrets)
export const gmailEmail = defineString('GMAIL_EMAIL');
export const gmailClientId = defineString('GMAIL_CLIENT_ID');
export const gmailClientSecret = defineString('GMAIL_CLIENT_SECRET');
export const gmailRefreshToken = defineString('GMAIL_REFRESH_TOKEN');

// Group ISO
export const groupIsoSecurityKey = defineSecret('GROUP_ISO_SECURITY_KEY');
export const groupIsoSuccessfulResponseStatus = defineString('GROUP_ISO_SUCCESSFUL_RESPONSE_STATUS');

// Stripe
export const stripeSecretKey = defineSecret('STRIPE_SECRET_KEY');

// Core
export const coreMainBusinessId = defineString('CORE_MAIN_BUSINESS_ID');

// Clever OAuth
export const cleverClientId = defineSecret('CLEVER_CLIENT_ID');
export const cleverClientSecret = defineSecret('CLEVER_CLIENT_SECRET');

/** All secrets required by apiV2 (HTTP) */
export const apiSecrets = [
  paypalClientId,
  paypalClientSecret,
  groupIsoSecurityKey,
  stripeSecretKey,
  cleverClientId,
  cleverClientSecret
];
