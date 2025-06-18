import { DifficultLevel } from '../Core';

import { FirestoreDocumentWithId, UserDetailsWithId } from 'types';

export type EssayComprehensionAnswerOption = 'a' | 'b' | 'c' | 'd';
export interface Essay {
  id: number;
  name: string;

  content: string;
  textHtml: string;
  totalOfSentences: number;

  difficult: number;
  category: DifficultLevel;

  speedTestOnly: boolean;
  preTest?: boolean;

  author?: string;
  source?: string;

  // ComprehensionQuestions
  questions?: EssayComprehensionQuestion[];
}

export interface EssayComprehensionQuestion {
  correctAnswer: EssayComprehensionAnswerOption;
  label: string;
  options: Record<EssayComprehensionAnswerOption, string>;
}

export interface EssayResult {
  category?: string;

  comprehension?: number;
  comprehensionAnswers?: [];

  essayId?: string;
  type?: string;

  user?: Pick<UserDetailsWithId, 'id' | 'firstName' | 'lastName' | 'picture'>;

  userId?: string;

  wordSpeed?: number;
  wordsNumber?: number;

  timestamp?: number;
}
export type EssayAnswerOption = 'a' | 'b' | 'c' | 'd';
export interface EssayQuestion {
  correctAnswer: EssayAnswerOption;
  label: string;
  options: Record<EssayAnswerOption, string>;
}

export type EssayDocumentWithId = FirestoreDocumentWithId<Essay>;
export type EssayResultDocumentWithId = FirestoreDocumentWithId<EssayResult>;

/**
 useQuery(
    'json',
    async () => {
      const correctJson: FirebaseItem<EssayComprehensionQuestion[]> = {};
      const notFormmated: Record<string, any> = {};

      for (const essay of json) {
        const { essayId, q1, a1, q2, a2, q3, a3 } = essay;

        if (!essayId) continue;

        const questionRegex = /.+?(?=((\n|\n\n|$)))/g;

        const q1regexMatch = q1.match(questionRegex);
        const q2regexMatch = q2.match(questionRegex);
        const q3regexMatch = q3.match(questionRegex);

        if (q1regexMatch?.length !== 5 || q2regexMatch?.length !== 5 || q3regexMatch?.length !== 5) {
          continue;
        }

        const [label1, a11, a12, a13, a14] = q1regexMatch;
        const [label2, a21, a22, a23, a24] = q2regexMatch;
        const [label3, a31, a32, a33, a34] = q3regexMatch;

        correctJson[essayId] = [
          {
            label: capitalize(label1.trim()),
            // @ts-ignore
            correctAnswer: a1,
            options: {
              a: capitalize(a11.replace('A.', '').trim()),
              b: capitalize(a12.replace('B.', '').trim()),
              c: capitalize(a13.replace('C.', '').trim()),
              d: capitalize(a14.replace('D.', '').trim())
            }
          },
          {
            label: capitalize(label2.trim()),
            // @ts-ignore
            correctAnswer: a2,
            options: {
              a: capitalize(a21.replace('A.', '').trim()),
              b: capitalize(a22.replace('B.', '').trim()),
              c: capitalize(a23.replace('C.', '').trim()),
              d: capitalize(a24.replace('D.', '').trim())
            }
          },
          {
            label: capitalize(label3.trim()),
            // @ts-ignore
            correctAnswer: a3,
            options: {
              a: capitalize(a31.replace('A.', '').trim()),
              b: capitalize(a32.replace('B.', '').trim()),
              c: capitalize(a33.replace('C.', '').trim()),
              d: capitalize(a34.replace('D.', '').trim())
            }
          }
        ];
      }

      let a = 0;
      const b = Object.entries(correctJson);

      for (const [essayId, questions] of b) {
        try {
          await firestore.collection('essays').doc(essayId).update({
            questions
          });
        } catch (e) {
          console.error(e);
        }

        a++;
        console.log(essayId, 'updated ', a, b.length);
      }
    },
    {
      refetchOnMount: false,
      retryDelay: 5000,
      refetchOnWindowFocus: false,
      onSettled(resp) {
        console.log(resp);
      }
    }
  );
 */
