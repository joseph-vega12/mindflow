import { BusinessDocumentWithId } from './Business';
import { FirestoreDocumentWithId } from '../../types';
import { UserDetailsWithId } from './User';

export interface License {
  id?: string;
  status: ELicenseStatus;
  type: ELicenseType | null;

  businessId?: string | null;
  business?: Pick<BusinessDocumentWithId, 'id' | 'name' | 'email' | 'timestamp'> | null;

  userId?: string;
  user?: Pick<UserDetailsWithId, 'id' | 'firstName' | 'lastName' | 'email' | 'picture' | 'testType' | 'difficultLevel'>;

  provider?: 'group_iso' | 'paypal' | 'manual_sell';
  gatewayResponse?: Record<string, any>;

  orderId: string;

  durationDays?: number;

  // All the dates are epochTime
  purchaseDate: number;

  // Filled only after status active
  activationDate?: number;
  expirationDate?: number;

  timestamp: number;
}

export enum ELicenseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED'
}

export enum ELicenseType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  BETA_USER = 'BETA_USER',
  BUSINESS_STUDENT = 'BUSINESS_STUDENT'
}

export type LicenseDocumentWithId = FirestoreDocumentWithId<License>;
