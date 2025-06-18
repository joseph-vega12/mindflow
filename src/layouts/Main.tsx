import React, { FC, useEffect, useMemo, useState } from 'react';

import { Flex as ChakraFlex } from '@chakra-ui/react';
import { get } from 'lodash';
import { useNavigate, useLocation } from 'react-router-dom';

import { BineauralBeatsProvider } from 'lib/providers';
import { useAuthContext } from 'lib/firebase';
import { useLicenses } from 'lib/customHooks';

import { BlockWall, Feedback, PageLoading } from 'components/common';
import { ELicenseStatus } from 'types';
import { Header, Sidebar, SidebarRouteItem } from 'components/layout';

export const MainLayout: FC = ({ children, ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuthContext();
  const { licensesQuery } = useLicenses();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const isLicenseValid = useMemo(() => {
    const { license } = user.userDetails;

    return license && license.status === ELicenseStatus.ACTIVE;
  }, [user]);

  const handleTutorialWall = () => {
    const { pathname } = location;

    const tutorial = get(user, ['userDetails', 'activity', 'tutorial']);
    const tasks: boolean[] = Object.values(tutorial ?? {});
    const finishedTutorial = tasks.every((task) => task);

    if (!tasks.length || !finishedTutorial) {
      if (!tutorial.speedReadingTest && pathname.includes('/speed-read/')) return;
      if (!tutorial.diagnosticTest && pathname.includes('/diagnostics/')) return;

      navigate('/tutorial');
    }
  };

  useEffect(() => {
    handleTutorialWall();
  }, [location.pathname]);

  // useEffect(() => {
  //   if (licensesQuery.isSuccess) {
  //     const individualLicenses = licensesQuery.data.filter((license) => license.type === ELicenseType.INDIVIDUAL);

  //     // todo: handle expired
  //     // todo: handle multiple licenses
  //   }
  // }, [licensesQuery]);

  const routes = useMemo(() => {
    const allowedRoutes: SidebarRouteItem[] = [
      { path: '/', icon: 'home', label: 'Dashboard' },
      { path: '/training', icon: 'play-circle', label: 'Training' },
      { path: '/library', icon: 'library-books', label: 'Practice' },
      { path: '/speed-read', icon: 'speed-read', label: 'Speed Tests' },
      { path: '/diagnostics', icon: 'book', label: 'Diagnostics' },
      { path: '/profile', icon: 'user', label: 'Profile' },
      { path: '/faq', icon: 'help-outline', label: 'FAQ' }
      // { path: '/extras', icon: 'triangle-up', label: 'Add-ons' },
    ];


    if (licensesQuery.isSuccess) {
      const canAccessBusiness = licensesQuery.data.some((license) => license.type === 'BUSINESS_OWNER');
      if (canAccessBusiness) {
        navigate('/business');
      }
    }

    return allowedRoutes;
  }, [licensesQuery]);

  return (
    <ChakraFlex width="100%" height="100vh" position="relative">
      {!isLicenseValid && <BlockWall />}
      <PageLoading isLoading={licensesQuery.isLoading || licensesQuery.isFetching} w="100%" h="100%">
        <Sidebar routes={routes} isCollapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
        <ChakraFlex height="100%" width="100%" flexDirection="column" padding="xl" overflow="auto">
          <BineauralBeatsProvider>
            <Header />
          </BineauralBeatsProvider>
          <ChakraFlex margin={{ lg: '40px auto 40px', md: 'none' }} minW="90%" maxW="100%">
            {React.Children.map(children, (child: any) => React.cloneElement(child, { ...props }))}
          </ChakraFlex>
        </ChakraFlex>
      </PageLoading>

      <Feedback />
    </ChakraFlex>
  );
};
