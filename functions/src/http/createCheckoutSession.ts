
import { Request, Response } from 'express';
import * as functions from 'firebase-functions';

const methodName = 'createCheckoutSession';

export const createCheckoutSession = async (request: Request, response: Response) => {

  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const { amount, quantity, success_url, cancel_url } = request.body;
    functions.logger.log(`[${methodName}] request: `, {
      amount,
      quantity
    });

    const stripe = require("stripe")(functions.config().stripe.secret_key);

    const amountCent = amount * 100;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Custom Product',
            },
            unit_amount: amountCent,
          },
          quantity: quantity,
        },
      ],
      cancel_url: cancel_url,
      success_url: success_url
    });
    functions.logger.log('BOBA session', session);

    response.json({ id: session.id });

  } catch (error) {
    functions.logger.error('[stripeRedirect] Critical error : ', error);

    response.status(400).send({
      // @ts-ignore
      message: error.message || error
    });
  }
};
