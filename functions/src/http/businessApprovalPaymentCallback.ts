import axios from 'axios';
import * as qs from 'qs';
import * as convert from 'xml-js';
import { Request, Response } from 'express';
import { get } from 'lodash';

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { BusinessApproval } from 'types';
import { getAccessToken, retrieveOrder } from '../utils/paypal';
import { sendTemplateEmail } from '../utils/email';


const cors = require('cors')({origin: true});

const methodName = 'businessApprovalPaymentCallback';

export const businessApprovalPaymentCallback = async (request: Request, response: Response) => {

  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    
    const { id, orderId, provider } = request.body;
  
    functions.logger.log(`[${methodName}] request: `, {
      id,
      orderId
    });

    if (!orderId || typeof orderId !== 'string') {
      throw new Error('OrderId is required!');
    }

    if (!id || typeof id !== 'string') {
      throw new Error('id is required!');
    }

    let gatewayResponse;

    if (provider === 'stripe') {
      gatewayResponse = await validateStripeOrder(orderId); // Dodaj await ovde
      functions.logger.log(['stripeResponse'], gatewayResponse);

    }
    
    if (provider === 'paypal') {
      gatewayResponse = await validatePaypalOrder(orderId);
    }

    if (provider === 'group_iso') {
      gatewayResponse = await validateGroupIsoOrder(orderId);
      functions.logger.log(['groupIsoGatewayResponse'], gatewayResponse);
    }

    await sendTemplateEmail({
      to: gatewayResponse.email.email,
      subject: 'Your business license order receipt',
      template: '14-purchase-receipt',
      data: {
        name: gatewayResponse.email.name,
        amount: gatewayResponse.email.amount,
        total: (gatewayResponse.email.quantity * gatewayResponse.email.amount).toFixed(2),
        quantity: gatewayResponse.email.quantity,
        product: 'Business Single License'
      }
    });

    delete gatewayResponse.email;

    const paidOrdersSnapshot = await admin.firestore().collection('businessApprovals').where('orderId', '==', orderId).limit(1).get();
    const [foundPaidOrder] = paidOrdersSnapshot.docs.map((d) => d.data());

    functions.logger.log(`[${methodName}] license found: `, { foundBusinessApproval: foundPaidOrder });
    if (foundPaidOrder) {
      throw new Error('This license already has already been activated!');
    }

    const businessApprovalsSnapshot = await admin.firestore().collection('businessApprovals').doc(id).get();
    const businessApproval = businessApprovalsSnapshot.data() as BusinessApproval;

    if (!businessApprovalsSnapshot.exists || !businessApproval) throw new Error(`BusinessApproval not found! ${id}`);

    const newBusinessApprovalPayload: BusinessApproval = {
      ...businessApproval,
      orderId,
      provider,
      purchaseDate: +new Date(),
      // @ts-ignore
      status: 'PENDING_APPROVAL',
      gatewayResponse
    };

    const updateBusinessApproval = await admin.firestore().collection('businessApprovals').doc(id).set(newBusinessApprovalPayload);

    response
      .json({
        id,
        ...updateBusinessApproval
      })
      .end();
      
  } catch (error) {
    functions.logger.error('[activateLicense] Critical error : ', error);

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
  functions.logger.log(['paypalOrder'], paypalOrder);
  if (!paypalOrder) {
    throw new Error('Order not found!');
  }

  if (paypalOrder.status !== 'COMPLETED') {
    throw new Error('Payment not found!');
  }

  const name = paypalOrder.payer.name.given_name;
  const email = paypalOrder.payer.email_address;
  const amount = paypalOrder.purchase_units[0].amount.value;
  const quantity = paypalOrder.purchase_units[0].items[0].quantity;

  return {
    ...paypalOrder,
    email: {
      email,
      name,
      amount: parseInt(amount).toFixed(2),
      quantity: parseInt(quantity).toFixed(0)
    }
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
  functions.logger.log(`[${methodName}]`, transaction);

  if (!transaction) {
    throw new Error('Order not found!');
  }

  const status = get(transaction, ['action', 'response_text', '_text']);
  if (status !== functions.config().group_iso.successful_response_status) {
    functions.logger.log(['status'], status);
    throw new Error('Payment not found!');
  }

  const email = get(transaction, ['email', '_text']);
  const name = get(transaction, ['first_name', '_text']);
  const amount = get(transaction, ['action', 'amount', '_text']);
  const quantity = get(transaction, ['product', 'quantity', '_text']);

  return {
    ...transaction,
    email: {
      email,
      name,
      amount: parseInt(amount).toFixed(2),
      quantity: parseInt(quantity).toFixed(0)
    }
  };
};

const validateStripeOrder = async (orderId: string) :Promise<any> => {
  
  const stripe = require("stripe")(functions.config().stripe.secret_key);

  const session = await stripe.checkout.sessions.retrieve(orderId);
  const lineItems = await stripe.checkout.sessions.listLineItems(orderId);
  
  if (!session.customer_details) {
      functions.logger.log('Stripe request error: Customer details not found!');
      return null;
  }

  const name = session.customer_details.name;
  const email = session.customer_details.email;
  const amount = lineItems.data[0].amount_total; 
  const amountInDollars = amount / 100;
  const quantity = lineItems.data[0].quantity;
  
  const response = {
      ...session,
      email: {
          email,
          name,
          amount: amountInDollars,
          quantity,
      },
  };
  
  return response;
}
