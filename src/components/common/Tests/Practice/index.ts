import { PracticeTestResult } from 'types';

export interface PracticeTestConfig {
  fontFamily: string;
  fontSize: number;

  practiceType: PracticeTestResult['practiceType'];

  numberOfRounds: PracticeTestResult['numberOfRounds'];

  hopping: 'wide' | 'narrow';
  numberOfColumns: PracticeTestResult['numberOfColumns'] & number;
  targetLines: PracticeTestResult['targetLines'] & number;

  soundUrl: string;
}

export { PracticeTestSettings } from './PracticeTestSettings';
export { PracticeTest } from './PracticeTest';
