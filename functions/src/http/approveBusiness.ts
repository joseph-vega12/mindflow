import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { Request, Response } from 'express';

export const approveBusiness = async (request: Request, response: Response) => {
  if (request.method !== 'PUT') {
    return response.status(405).end();
  }

  try {
    const { id, status } = request.body;
    const updatedApproval = {
      id: id,
      status: status
    };

    await admin.firestore().collection('businessApprovals').doc(id).update(updatedApproval);

    response.status(200).send();
  } catch (error) {
    functions.logger.error('[approveBusiness] Critical error: ', error);
    response.status(400).send({ message: 'Internal Server Error' });
  }
};
