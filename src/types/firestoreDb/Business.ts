import { FirestoreDocumentWithId, TestType } from 'types';

export type ProgramLocation = 'ONLINE' | 'IN_PERSON' | 'BOTH';
export type ProgramModality = 'GROUP' | 'INDIVIDUAL' | 'BOTH';

export interface Business {
  id: string;
  name?: string | null;
  address?: string;
  phone?: string;
  email?: string | null;
  website?: string;
  contactPerson?: string;
  testType?: TestType;
  programLocation?: ProgramLocation;
  programModality?: ProgramModality;
  onwerId?: string;
  activity?: BusinessActivity;
  timestamp: number;
  licensePrice?: number;
  isBuyingEnabled?: boolean;
  business: string;
  quantity: number;
}

export type BusinessDocumentWithId = FirestoreDocumentWithId<Business>;

interface BusinessActivity {
  stats?: BusinessActivityStats;

  counters: BusinessUsersAcitiviesCounters;
}

export interface BusinessActivityStats {
  averageComprehension: number;
  totalComprehensionReports: number;

  averageLevel: number;
  totalLevelReports: number;

  averageWordSpeed: number;
  totalWordSpeedReports: number;

  // TODO: How to calculate this?
  maximumImprovement?: number;
  minimumImprovement?: number;
}

export interface BusinessUsersAcitiviesCounters {
  diagnostics: number;

  speedRead: number;
  practices: number;
  brainEyeCoordination: number;

  videos: number;
}
