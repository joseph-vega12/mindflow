import { getAuth } from 'firebase-admin/auth';
import { Request, Response } from 'express';

function isLocalTestingEnvironment(): boolean {
  return process.env.FUNCTIONS_EMULATOR === 'true';
}

export const createDevCustomToken = async (request: Request, response: Response) => {
  if (!isLocalTestingEnvironment()) {
    return response.status(404).json({ message: 'Not found' }).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' }).end();
  }

  try {
    const { uid } = request.body as { uid?: string };

    if (!uid || typeof uid !== 'string') {
      return response.status(400).json({ message: 'uid is required' }).end();
    }

    const customToken = await getAuth().createCustomToken(uid);
    return response.status(200).json({ customToken }).end();
  } catch (err) {
    console.error('createDevCustomToken failed', err);
    return response.status(500).json({ message: 'Failed to create custom token' }).end();
  }
};
