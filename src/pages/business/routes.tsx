import React, { ComponentType, FC, ReactNode } from 'react';

import { BusinessLayout } from 'layouts';
import { BusinessSelector } from '.';
import { Home } from './home';
import { StudentDetails } from './students/[studentId]';
import { StudentReports } from './reports';
import { StudentsActivities } from './activities';
import { StudentsPanel } from './students';
import { UserProfilePage } from '../main/userProfile';

interface PageRoute {
  path: string;
  exact?: boolean;
  // Component: ReactNode;
  Component: ComponentType<any>;
}

const renderComponent = (Page: FC) => {
  return (
    <BusinessLayout>
      <Page />
    </BusinessLayout>
  );
};

export const businessRoutes: PageRoute[] = [
  {
    path: '/business',
    exact: true,
    Component: () => renderComponent(BusinessSelector)
  },
  {
    path: '/business/:businessId',
    exact: true,
    Component: () => renderComponent(Home)
  },
  {
    path: '/business/:businessId/activities',
    exact: true,
    Component: () => renderComponent(StudentsActivities)
  },
  {
    path: '/business/:businessId/students',
    exact: true,
    Component: () => renderComponent(StudentsPanel)
  },
  {
    path: '/business/:businessId/licenses',
    exact: true,
    Component: () => renderComponent(StudentsActivities)
  },
  // {
  //   path: '/business/:businessId/activities',
  //   Component: () => renderComponent(Home),
  // },
  {
    path: '/business/:businessId/students/:studentId',
    Component: () => renderComponent(StudentDetails)
  },
  {
    path: '/business/:businessId/profile',
    Component: () => renderComponent(UserProfilePage)
  }
  // {
  //   path: '/business/:businessId/reports',
  //   Component: () => renderComponent(StudentReports)
  // }
];
