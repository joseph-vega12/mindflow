import axios from 'axios';
import * as qs from 'qs';
import * as convert from 'xml-js';
import { Request, Response } from 'express';
import { get } from 'lodash';

import * as functions from 'firebase-functions';

import { getAccessToken, retrieveOrder } from '../utils/paypal';
import { sendTemplateEmail } from '../utils/email';

import * as cors from 'cors';

const corsHandler = cors({ origin: true }); // Omogućava sve izvore

const methodName = 'sendLicenseOrderReceipt';

export const sendLicenseOrderReceipt = async (request: Request, response: Response) => {
  
  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const { orderId, provider, quantity } = request.body;

    functions.logger.log(`[${methodName}] request: `, {
      provider,
      orderId,
      quantity
    });

    if (!orderId || typeof orderId !== 'string') {
      throw new Error('OrderId is required!');
    }

    if (!provider || typeof provider !== 'string') {
      throw new Error('Provider is required!');
    }

    let gatewayResponse;
    
    if (provider === 'stripe') {
      gatewayResponse = await validateStripeOrder(orderId);
    }
    
    if (provider === 'paypal') {
      gatewayResponse = await validatePaypalOrder(orderId);
    }

    if (provider === 'group_iso') {
      gatewayResponse = await validateGroupIsoOrder(orderId);
    }

    if (!gatewayResponse) {
      throw new Error('Order not found!');
    }

    await sendTemplateEmail({
      to: gatewayResponse.email,
      subject: 'Your license order receipt',
      template: '14-purchase-receipt',
      data: {
        name: gatewayResponse.name,
        amount: gatewayResponse.amount,
        total: gatewayResponse.amount,
        product: quantity > 1 ? 'Single License' : `${quantity} Licenses`,
        quantity: quantity
      }
    });

    response
      .json({
        message: 'Receipt e-mail sent'
      })
      .end();
  } catch (error) {
    response.status(400).send({
      // @ts-ignore
      message: error.message || error
    });
  }
};

const validatePaypalOrder = async (orderId: string) => {
  // const paypalAccessToken = await getAccessToken(functions.config().paypal.client_id, functions.config().paypal.client_secret);
  // const paypalOrder = await retrieveOrder(paypalAccessToken.access_token, orderId);
  const paypalOrder = await retrieveOrder(orderId);
  if (!paypalOrder) {
    throw new Error('Order not found!');
  }

  if (paypalOrder.status !== 'COMPLETED') {
    throw new Error('Payment not found!');
  }

  const name = paypalOrder.payer.name.given_name;
  const email = paypalOrder.payer.email_address;
  const amount = paypalOrder.purchase_units[0].amount.value;

  return {
    name,
    email,
    amount: parseInt(amount).toFixed(2)
  };
};

const validateGroupIsoOrder = async (orderId: string) => {
  const resp = await axios.post(
    'https://secure.groupisogateway.com/api/query.php',
    qs.stringify({
      security_key: functions.config().group_iso.security_key,
      transaction_id: Number(orderId)
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  const data = convert.xml2js(resp.data, { compact: true });
  const transaction = get(data, ['nm_response', 'transaction']);

  if (!transaction) {
    throw new Error('Order not found!');
  }

  const status = get(transaction, ['action', 'response_text', '_text']);

  if (status !== functions.config().group_iso.successful_response_status) {
    throw new Error('Payment not found!');
  }

  const email = get(transaction, ['email', '_text']);
  const name = get(transaction, ['first_name', '_text']);
  const amount = get(transaction, ['action', 'amount', '_text']);

  return {
    name,
    email,
    amount: parseInt(amount).toFixed(2)
  };
};

const validateStripeOrder = async (orderId: string) :Promise<any> => {
  const stripe = require("stripe")(functions.config().stripe.secret_key);

  const session = await stripe.checkout.sessions.retrieve(orderId);
  const lineItems = await stripe.checkout.sessions.listLineItems(orderId);
  
  const name = session.customer_details.name;
  const email = session.customer_details.email;
  const amount = lineItems.data[0].amount_total;
  const amountInDollars = amount / 100;

  return {
    name,
    email,
    amount: amountInDollars
  };
}


