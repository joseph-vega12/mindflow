import { DifficultLevel } from '../Core';
import { EssayComprehensionAnswerOption, UserDetailsWithId } from '.';
import { FirestoreDocumentWithId } from '..';

export type UserTestType = 'brain-eye-coordination' | 'speed-read' | 'practice';

export type TestResult = SpeedTestResult | BrainEyeTestResult | PracticeTestResult;

interface BaseTestResult {
  // name: string
  type: UserTestType;

  comprehension?: number;
  comprehensionAnswers?: EssayComprehensionAnswerOption[];

  essayId: string;
  category?: DifficultLevel;

  businessId?: string | null;

  user: Pick<UserDetailsWithId, 'id' | 'firstName' | 'lastName' | 'picture'>;
  userId?: string;

  timestamp: number;
}

export interface SpeedTestResult extends BaseTestResult {
  type: 'speed-read';

  isCustomText?: boolean;
  isPreTest?: boolean;

  wordSpeed: number;
  wordsNumber: number;
}

export interface BrainEyeTestResult extends BaseTestResult {
  type: 'brain-eye-coordination';

  wordSpeed: number;
  wordsNumber: number;
}

export interface PracticeTestResult extends BaseTestResult {
  type: 'practice';

  numberOfRounds: 5 | 10 | 15 | 20;
  numberOfColumns: 1 | 2 | 3;
  targetLines: 5 | 10;
  // In miliSeconds

  practiceType: 'regular' | 'oneTwenty';
}

export type TestResultWithId = FirestoreDocumentWithId<TestResult>;
