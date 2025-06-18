import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { Request, Response } from 'express';

import { CouponDocumentWithId } from 'types';

export interface Coupon {
  code: string;
  name: string;
  price: number;
  expiryDate: string;
}

export const manageCoupon = async (request: Request, response: Response) => {
  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const result = request.body.type == 'add' ? await addCoupon(request) : await deleteCoupons(request);

    response
      .json({
        result
      })
      .end();
  } catch (error) {
    functions.logger.error('Critical error: ', error);

    response.status(400).send({
      // @ts-ignore
      message: error.message
    });
  }
};

const addCoupon = async (request: Request) => {
  const { coupon } = request.body;

  if (!coupon) {
    throw new Error('Coupon is required!');
  }

  if (!coupon.name || !coupon.code || !coupon.price || !coupon.expiryDate) {
    throw new Error('All fields are required!');
  }

  functions.logger.log('Request', { coupon });

  const dbCodeSnapShot = await admin.firestore().collection('coupons').where('code', '==', coupon.code).limit(1).get();
  const [oldCode] = dbCodeSnapShot.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }));

  if (oldCode) {
    functions.logger.warn('Code already exists: ', oldCode);
    throw new Error('Code already exists!');
  }

  const couponValue: Coupon = {
    ...coupon
  };
  const dbCoupon = await admin.firestore().collection('coupons').add(couponValue);

  functions.logger.log('New coupon created', dbCoupon.id);

  return dbCoupon;
};

const deleteCoupons = async (request: Request) => {
  const { couponsToDelete } = request.body;
  if (!couponsToDelete) {
    functions.logger.warn('Coupon ID is required!');
    throw new Error('Coupon ID is required!');
  }

  const batch = admin.firestore().batch();

  couponsToDelete.forEach((doc: CouponDocumentWithId) => {
    const reference = admin.firestore().collection('coupons').doc(doc.id);

    batch.delete(reference);
  });

  await batch
    .commit()
    .then(() => {
      functions.logger.warn(`Coupons deleted successfully!`);
      return true;
    })
    .catch((error) => {
      functions.logger.warn(`failed to delete Coupons! ${error}`);
      return false;
    });
};
