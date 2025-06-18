// import { User as FirebaseUser } from 'firebase';

import { CurrentLevel, DifficultLevel, TestType, WhereDidYouHearAboutUs } from '../Core';
import { FirestoreDocumentWithId } from 'types';

import { BusinessDocumentWithId, LicenseDocumentWithId, TestResultWithId } from '.';

// export interface UserWithDetails extends FirebaseUser {
//   userDetails: UserDetails;

//   testResults: TestResultWithId[];
// }

// users/{userId}
export interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  businessId?: string;
  licenseId?: string;
  picture?: string | null;
  level: number;
  schoolName: string;
  examDate: number;
  phone: number;

  activity: UserActivity;

  difficultLevel: DifficultLevel;
  currentLevel?: CurrentLevel;
  testType: TestType;

  lastSeen: number | null;
  timestamp: number;

  whereDidYouHearAboutUs: WhereDidYouHearAboutUs;
  whereDidYouHearAboutUsObservation?: string;

  license: Pick<
    LicenseDocumentWithId,
    'id' | 'status' | 'activationDate' | 'expirationDate' | 'orderId' | 'type' | 'purchaseDate'
  >;

  business?: Pick<BusinessDocumentWithId, 'id' | 'name' | 'email' | 'timestamp'>;
}

export type UserDetailsWithId = FirestoreDocumentWithId<UserDetails>;

// Used for activity and stats purposes
export interface UserActivity {
  counters?: UserAcitiviesCounters;
  stats?: UserActivityStats;

  tutorial: UserTutorial;
}

// Used in the main dashboard
interface UserAcitiviesCounters {
  diagnostics: number;

  speedRead: number;
  practices: number;
  brainEyeCoordination: number;

  videos: number;
}

// The functions define theses results
export interface UserActivityStats {
  wordSpeed: {
    firstWordSpeed: number;
    lastWordSpeed: number;
    bestWordSpeed: number;
    averageWordSpeed: number;
    totalWordSpeedReports: number;
  };

  comprehension: {
    lastComprehension: number;
    averageComprehension: number;
    totalComprehensionReports: number;
  };

  testResults: UserActivityStatsReportItem[];

  videos: Record<string, boolean>;

  diagnostics: Record<TestType, UserAcitivityResumedDiagnosticResult[]>;
}

export interface UserTutorial {
  welcomeVideo: boolean;
  speedReadingTest: boolean;
  diagnosticTest: boolean;
  tutorialVideo: boolean;
  finished: boolean;
}

export interface UserAcitivityResumedDiagnosticResult {
  diagnosticId: string;
  diagnosticResultId: string;

  name: string;
  order: string;

  totalTime: number;

  totalScore: number;
  totalOfQuestions: number;
  scorePercentage: number;
}

export interface UserActivityStatsReportItem {
  type?: TestType;

  essayId: string;
  resultId: string;

  category: TestType;
  practiceType?: 'regular' | 'oneTwenty';

  wordSpeed?: number;
  comprehension?: number;

  numberOfRounds?: 5 | 10 | 15 | 20;
  numberOfColumns?: 1 | 2 | 3;

  timestamp: number;
}
export type UserDocumentWithId = FirestoreDocumentWithId<UserDetails>;
