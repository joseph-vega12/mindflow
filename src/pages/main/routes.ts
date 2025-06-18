import { ReactNode, ComponentType } from 'react';

// User Routes
// import { AddonDetailsPage } from './extras/addons/[addonId]/details';
import { DiagnosticResult } from './diagnostics/[diagnosticId]/result';
import { Diagnostics } from './diagnostics';
import { DiagnosticTest } from './diagnostics/[diagnosticId]';
import { SpeedReadResult } from './speedRead/result';

import { Faq } from './faq';
import { Home } from './home';
// import { ExtrasPage } from './extras';

// Library
import { BrainEyeCoordinationTest } from './library/[essayId]/brain-eye-coordination';
import { Library } from './library';
import { LibraryEssay } from './library/[essayId]';
import { PracticePageTest } from './library/[essayId]/practice';

import { SpeedReadLibrary } from './speedRead';
import { SpeedReadText } from './speedRead/[essayId]';
import { Training } from './training';
import { Tutorial } from './tutorial';
import { UserProfilePage } from './userProfile';

// Deprecated
// import Payment from './payment'

interface PageRoute {
  path: string;
  exact?: boolean;
  Component: ComponentType<any>;
}

const libraryRoutes: PageRoute[] = [
  {
    exact: true,
    path: '/library',
    Component: Library
  },
  {
    exact: true,
    path: '/library/:essayId',
    Component: LibraryEssay
  },
  {
    exact: true,
    path: '/library/:essayId/brain-eye-coordination',
    Component: BrainEyeCoordinationTest
  },
  {
    exact: true,
    path: '/library/:essayId/practice',
    Component: PracticePageTest
  }
];

const speedReadRoutes: PageRoute[] = [
  {
    exact: true,
    path: '/speed-read',
    Component: SpeedReadLibrary
  },
  {
    exact: true,
    path: '/speed-read/:essayId',
    Component: SpeedReadText
  }
];

export const mainRoutes: PageRoute[] = [
  {
    exact: true,
    path: '/',
    Component: Home
  },
  {
    path: '/tutorial',
    Component: Tutorial
  },
  ...libraryRoutes,
  ...speedReadRoutes,
  {
    path: '/training/:videoId?',
    Component: Training
  },
  // // Diagnostics
  {
    exact: true,
    path: '/diagnostics',
    Component: Diagnostics
  },
  {
    exact: true,
    path: '/diagnostics/:diagnosticId',
    Component: DiagnosticTest
  },
  {
    path: '/diagnostics/:diagnosticId/result',
    Component: DiagnosticResult
  },
  {
    path: '/speed-test/:essayId/result',
    Component: SpeedReadResult
  },
  // // User
  {
    path: '/profile',
    Component: UserProfilePage
  },
  {
    path: '/faq',
    Component: Faq
  }
  // // Addons
  // {
  //   path: '/extras',
  //   Component: ExtrasPage
  // },
  // {
  //   exact: true,
  //   path: '/addon/:addonId/details',
  //   Component: AddonDetailsPage
  // }
];
