import React, { FC, useEffect, useMemo, useState } from 'react';

import { Flex as ChakraFlex } from '@chakra-ui/react';
import { FiActivity, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { VscGraph } from 'react-icons/vsc';

import { Header, Sidebar, SidebarRouteItem } from 'components/layout';

import { ELicenseType } from 'types';
import { PageLoading } from 'components/common';
import { useBusiness, useLicenses } from 'lib/customHooks';

export const BusinessLayout: FC = ({ children, ...props }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const navigate = useNavigate();

  const { licensesQuery } = useLicenses();
  const { businessId } = useBusiness();

  const sidebarRoutes: SidebarRouteItem[] = useMemo(() => {
    if (!licensesQuery.isSuccess) return [];

    const routes = [
      { path: ['/business', businessId].join('/'), icon: 'home', label: 'Dashboard' },
      { path: ['/business', businessId, 'activities'].join('/'), as: FiActivity, label: 'Activities' },
      { path: ['/business', businessId, 'students'].join('/'), as: FiUsers, label: 'Students' },
      { path: ['/business', businessId, 'profile'].join('/'), icon: 'user', label: 'Profile' }
      // { path: ['/business', businessId, 'reports'].join('/'), as: VscGraph, label: 'Reports' }
      // { path: ['/business', businessId, 'profile'], icon: 'user', label: 'Profile' }
    ] as SidebarRouteItem[];

    return routes;
  }, [licensesQuery]);

  useEffect(() => {
    if (licensesQuery.isSuccess) {
      const cantAccess = licensesQuery.data.some((license) => license.type === ELicenseType.BUSINESS_OWNER);

      if (!cantAccess) {
        toast.error("You don't have access to this page");
        navigate('/');
      }
    }
  }, [licensesQuery]);

  return (
    <ChakraFlex width="100%" height="100vh">
      <Sidebar routes={sidebarRoutes} isCollapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
      <ChakraFlex width="100%" height="100%" padding="xl" gridGap="xl" overflow="auto" flexDirection="column">
        <Header />
        <PageLoading isLoading={!licensesQuery.isSuccess}>
          {licensesQuery.data && React.Children.map(children, (child: any) => React.cloneElement(child, { ...props }))}
        </PageLoading>
      </ChakraFlex>
    </ChakraFlex>
  );
};
