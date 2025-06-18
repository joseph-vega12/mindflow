import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import * as Joi from 'joi';
import { Request, Response } from 'express';
import { BusinessApproval } from 'types';

export type BusinessAprovalSubmit = Pick<BusinessApproval, 'quantity' | 'name' | 'email' | 'phone' | 'businessName' | 'businessUrl' | 'heardAboutUs'>;

const businessSchema = Joi.object<BusinessAprovalSubmit>({
  quantity: Joi.number().min(1).max(200).required(),
  name: Joi.string().min(5).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .min(5)
    .max(50)
    .required(),
  phone: Joi.string().min(7).max(14).required(),
  businessName: Joi.string().min(5).max(50).required(),
  businessUrl: Joi.string().required().uri(),
  heardAboutUs: Joi.string().min(4).required()
}).required();

const methodName = 'createBusinessApproval';
export const createBusinessApproval = async (request: Request, response: Response) => {
  if (request.method !== 'POST') {
    return response.status(405).end();
  }

  try {
    const bodyValidator = businessSchema.validate(request.body, { abortEarly: true });

    if (bodyValidator.error) {
      throw new Error(bodyValidator.error.message);
    }

    const input = bodyValidator.value as BusinessAprovalSubmit;

    functions.logger.log(`[${methodName}] request: `, input);

    const businessApprovalParams: Partial<BusinessApproval> = {
      ...input,
      // @ts-ignore
      status: 'NOT_CONVERTED',
      timestamp: +new Date()
    };
    const newBusinessApproval = await admin.firestore().collection('businessApprovals').add(businessApprovalParams);

    functions.logger.log('BusinessAproval created: ', { id: newBusinessApproval.id, ...businessApprovalParams });

    response
      .json({
        id: newBusinessApproval.id,
        ...businessApprovalParams
      })
      .end();
  } catch (error) {
    functions.logger.error('[activateLicense] Critical error: ', error);

    response.status(400).send({
      // @ts-ignore
      message: error.message
    });
  }
};
