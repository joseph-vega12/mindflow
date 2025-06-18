import type { ReactNode } from 'react';

import { ReportsMainPanel } from 'pages/ownerReports/main';
import { OwnerStudentsPanel } from 'pages/owner/students/students';
import { OwnerBTOBPanel } from 'components/Pages/Owner/OwnerBTOBPanel';
import { AddonDetails } from 'components/Pages/Addon/AddonDetails';

interface PageRoute {
  label: string;
  path: string;
  exact?: boolean;
  Component: ReactNode;
}

export const ownerReportsRoutes: PageRoute[] = [
  { path: '/reports', exact: true, label: 'MAIN DASH', Component: ReportsMainPanel },
  { path: '/reports/students', exact: true, label: 'STUDENT LIST', Component: OwnerStudentsPanel },
  { path: '/reports/btob', exact: true, label: 'BTOB DASH', Component: OwnerBTOBPanel },
  { path: '/reports/add-ons', exact: true, label: 'ADD ONS', Component: AddonDetails }
];
