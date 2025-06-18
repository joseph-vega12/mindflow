import { FirestoreDocumentWithId, UserDetailsWithId } from '..';
import { TestType } from '../Core';

export enum AdditionalDiagnostics {
  isee = 'ssat',
  ssat = 'isee',
  shsat = 'isee',
  sat = 'act',
  act = 'sat',
  gre = 'gmat',
  gmat = 'lsat',
  lsat = 'gmat',
  mcat = 'lsat',
  toefl = 'gmat',
  pte = 'gmat',
  ielts = 'gmat'
}

export type DiagnosticAnswerOption = 'a' | 'b' | 'c' | 'd' | 'e';

export interface Diagnostic {
  id: string;
  name: string;

  category: TestType;
  order: number;

  result?: DiagnosticTestResult;

  author?: string;
  title?: string;
  source?: string;
  text?: string;
  content?: string;
  difficult?: number;
  totalOfSentences?: number;
  questions?: DiagnosticQuestion[];
}

export type ResumedDiagnostic = Omit<Diagnostic, 'questions' | 'text'>;
export type ResumedDiagnosticDocumentWithId = FirestoreDocumentWithId<ResumedDiagnostic>;

export type DiagnosticDocumentWithId = FirestoreDocumentWithId<Diagnostic>;
export type DiagnosticResultDocumentWithId = FirestoreDocumentWithId<DiagnosticResult>;

export interface DiagnosticResult {
  name: string;
  category: TestType;
  order: number;

  finished: boolean;
  result?: DiagnosticTestResult;

  answers: DiagnosticAnswerOption[];
  answersTime?: number[];

  diagnosticId: string;
  businessId?: string;

  user?: Pick<UserDetailsWithId, 'id' | 'firstName' | 'lastName' | 'picture'>;
  userId: string;

  timestamp: number;
}

export interface DiagnosticTestResult {
  totalTime: number;
  totalScore: number;
  totalOfQuestions: number;
  scorePercentage: number;
}
export interface DiagnosticQuestion {
  correctAnswer: DiagnosticAnswerOption;
  label: string;
  options: Record<DiagnosticAnswerOption, string>;
}
