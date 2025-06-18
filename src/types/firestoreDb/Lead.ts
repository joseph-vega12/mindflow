import { DifficultLevel, SpeedTestResult, TestType, WhereDidYouHearAboutUs } from '../index';
import { FirestoreDocumentWithId } from '..';

export interface Lead {
  name: string;
  email: string;

  programPreparation: boolean;
  programEducationLevel?: DifficultLevel;
  programTestType?: TestType;
  programDate?: string;

  archived?: boolean;
  converted?: boolean;

  whereDidYouHearAboutUs: WhereDidYouHearAboutUs;
  whereDidYouHearAboutUsObservation?: string;

  result?: Omit<SpeedTestResult, 'textId' | 'userId' | 'user'>;
  category: DifficultLevel;

  timestamp: number;
}

export type LeadDocumentWithId = FirestoreDocumentWithId<Lead>;
