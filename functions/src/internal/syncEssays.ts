import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import axios from 'axios';

import { JSDOM } from 'jsdom';

interface SheetEssay {
  TextId: string;
  SpeedTestOnly: string;
  PreTest: string;
  FreeTest: string;
  'Name of Essay': string;
  'Level/Tests': string;
  'Word Count': string;
  'Question 1': string;
  'Answer 1': string;
  'Question 2': string;
  'Answer 2': string;
  'Question 3': string;
  'Answer 3': string;
  Grade: string;
  Difficulty: string;
  Age: string;
  Author: string;
  URL: string;
  NOTES: string;
}

export const syncEssays = async () => {
  try {
    const firestore = admin.firestore();

    const SHEET_PARSER_URL = 'https://opensheet.elk.sh';
    const SHEET_ID = '1jcCPkco0qFpbsSeEgtsHh1IZeVTv6hZ86TdZKEW7Ss8';
    const SHEET_NAME = 'Sheet1';

    const { data } = await axios.get<SheetEssay[]>(`${SHEET_PARSER_URL}/${SHEET_ID}/${SHEET_NAME}`);

    const NO_AUTHOR_FLAG = 'NO AUTHOR LISTED';

    const formattedEssaysSheet = data
      ?.filter((essay) => Object?.keys(essay)?.length > 0 && !!essay?.TextId)
      ?.map((line) => ({
        id: line.TextId.replace('\n', '').trim(),
        name: line['Name of Essay'].replace('\n', '').trim(),
        author: line.Author === NO_AUTHOR_FLAG || line.Author === '' ? null : line.Author.replace('\n', '').trim(),
        source: line.URL.replace('\n', '').trim(),
        questions: [line['Question 1'], line['Question 2'], line['Question 3']]?.map((question, idx) => {
          const [questionLabel, questionA, questionB, questionC, questionD] = question
            ?.trim()
            ?.replace('\n\n', '\n')
            ?.split('\n');

          const CORRECT_ANSWER = idx === 0 ? line['Answer 1'] : idx === 1 ? line['Answer 2'] : line['Answer 3'];

          return {
            label: questionLabel,
            correctAnswer: CORRECT_ANSWER?.toLowerCase(),
            options: {
              a: questionA?.replace('A. ', '').trim(),
              b: questionB?.replace('B. ', '').trim(),
              c: questionC?.replace('C. ', '').trim(),
              d: questionD?.replace('D. ', '').trim()
            },
          }
        }),
      }));

    const essaysThatShouldBeSynced = formattedEssaysSheet.filter((essay) => !essay?.id?.match(' '));

    const batch = firestore.batch();

    for (const essay of essaysThatShouldBeSynced) {
      const { id, name, author, questions, source } = essay;

      const essayRef = firestore.collection('essays').doc(id);

      batch.update(essayRef, {
        name,
        author,
        questions,
        source,
      });
    }

    await batch.commit();

    return {
      ok: true
    };
  } catch (error) {
    functions.logger.error('Critical error: ', error);

    return {
      error
    };
  }
};
