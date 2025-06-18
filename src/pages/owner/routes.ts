import { OwnerBTOBPanel } from 'components/Pages/Owner/OwnerBTOBPanel';
import type { ComponentType, ReactNode } from 'react';

import { BusinessDetails } from './business/[businessId]';
import { OwnerBusinessApprovalsPanel } from './businessApprovals';
import { OwnerDiagnosticsPanel } from './diagnostics';
import { OwnerEssaysPanel } from './essays';
import { OwnerLeadsPanel } from './leads';
import { OwnerLicensePanel } from './licenses';
import { OwnerCouponsPanel } from './coupons';
import { OwnerMainPanel } from './main';
import { OwnerManageBusinessesPanel } from './manageBusinesses';
import { OwnerStudentsPanel } from './students/students';
import { StudentDetails } from './students/[studentId]';
interface PageRoute {
  label: string;
  path: string;
  exact?: boolean;
  Component: ComponentType
}

export const ownerRoutes: PageRoute[] = [
  { path: '/owner', exact: true, label: 'Dashboard', Component: OwnerMainPanel },
  { path: '/owner/students', exact: true, label: 'Students', Component: OwnerStudentsPanel },
  { path: '/owner/students/:studentId', exact: true, label: 'Students', Component: StudentDetails },
  { path: '/owner/businessDetails/:business', exact: true, label: 'Business Details', Component: BusinessDetails },
  // { path: '/owner/students', Component: OwnerStudentsPanel },
  { path: '/owner/essays', label: 'Essays', Component: OwnerEssaysPanel },
  { path: '/owner/diagnostics', label: 'Diagnostics', Component: OwnerDiagnosticsPanel },
  { path: '/owner/leads', label: 'Leads', Component: OwnerLeadsPanel },
  { path: '/owner/licenses', label: 'Licenses', Component: OwnerLicensePanel },
  { path: '/owner/coupons', label: 'Coupons', Component: OwnerCouponsPanel },
  { path: '/owner/business-approvals', label: 'Business Approvals', Component: OwnerBusinessApprovalsPanel },
  { path: '/owner/manage-businesses', label: 'Manage Businesses', Component: OwnerManageBusinessesPanel },
  { path: '/owner/b2b-dash', label: 'B2B Dash', Component: OwnerBTOBPanel }
];
