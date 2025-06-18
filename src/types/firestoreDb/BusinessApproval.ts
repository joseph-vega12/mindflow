import { FirestoreDocumentWithId } from 'types';

export enum BusinessApprovalStatus {
  // NOT_CONVERTED = 'NOT_CONVERTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface BusinessApproval {
  quantity: number;

  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  businessName: string;
  businessUrl: string;
  businessPhone: string;

  heardAboutUs: string;

  status: BusinessApprovalStatus;

  // POST PAYMENT
  orderId?: string;
  provider?: 'group_iso';
  purchaseDate?: number;
  gatewayResponse?: Record<string, any>;

  timestamp: number;
}

export type BusinessApprovalDocumentWithId = FirestoreDocumentWithId<BusinessApproval>;
