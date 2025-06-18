import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { Request, Response } from 'express';

const freeTestEssayCategoryIdMap = {
  middle_school: '-MIp_o_fKOhkQUTwCYLc', // Transportation Changes
  high_school: '-M2A53Yqtnoeqrc40KpO', // H. G. Wells and the Uncertainties of Progress
  college: '-M2tNV7GF3bYu_jm31S1', // George WashingtonA Descendant of Odin?
  adult: '-M2tNV7GF3bYu_jm31S1' // George WashingtonA Descendant of Odin?
};

export const listFreeSpeedTests = async (request: Request, response: Response) => {
  if (request.method !== 'GET') {
    return response.status(405).end();
  }

  try {
    const essaySnap = await admin.firestore().collection('essays').limit(10).where('freeTest', '==', true).get();
    const freeTestAllowedEntries = Object.entries(freeTestEssayCategoryIdMap);

    const essaysMap: Record<string, object> = essaySnap.docs.reduce((prev, snap) => {
      return {
        ...prev,
        [snap.id]: snap.data()
      };
    }, {});

    const result: Record<string, any> = {};
    for (const allowedEssayEntry of freeTestAllowedEntries) {
      const [category, id] = allowedEssayEntry;

      const essay = essaysMap[id];

      if (essay) {
        result[category] = {
          id,
          ...essay
        };
      }
    }

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
