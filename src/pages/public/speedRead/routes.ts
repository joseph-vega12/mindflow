import { ReactNode } from 'react';

import { PublicSpeedReadHome } from '.';
import { PublicSpeedReadBuy } from './buyProgram';
import { PublicSpeedReadPricing } from './pricing';

interface PageRoute {
  path: string;
  exact?: boolean;
  Component: ReactNode;
}

const routes: PageRoute[] = [
  {
    path: '/free/speed-read',
    Component: PublicSpeedReadHome
  },
  {
    path: '/free/program',
    Component: PublicSpeedReadPricing
  },
  {
    path: '/free/buy-program',
    Component: PublicSpeedReadBuy
  }
];

export default routes;
