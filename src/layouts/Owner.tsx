import React, { FC, useEffect, useMemo, useState } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Menu as ChakraMenu,
  MenuButton as ChakraMenuButton,
  MenuItem as ChakraMenuItem,
  MenuList as ChakraMenuList,
  Text as ChakraText
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

import { FiltersFormProvider } from 'components/Pages/Owner/FiltersFormProvider';
import { Icon } from 'components/common';
import { OwnerContextProvider } from 'components/Pages/Owner';
import { ownerRoutes } from 'pages/owner/routes';
import { Header, Sidebar, SidebarRouteItem } from 'components/layout';
import { useLicenses } from 'lib/customHooks';

function routeMatches(pathname: string, routePath: string): boolean {
  const p = pathname.split('?')[0].replace(/\/$/, '') || '/';
  const r = routePath.replace(/\/$/, '') || '/';
  if (r === '/owner') {
    return p === '/owner';
  }
  return p === r || p.startsWith(`${r}/`);
}

export const OwnerLayout: FC<React.PropsWithChildren<Record<string, unknown>>> = ({ children, ...props }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const { isOwner } = useLicenses();

  const navigate = useNavigate();
  const { pathname } = useLocation();

  const routes: SidebarRouteItem[] = [{ path: '/', icon: 'home', label: 'Dashboard' }];

  const navRoutes = useMemo(
    () => ownerRoutes.filter(({ path }) => !path.includes(':')),
    []
  );

  const activeRoute = useMemo(() => {
    const matches = navRoutes.filter((route) => routeMatches(pathname, route.path));
    const best = [...matches].sort((a, b) => b.path.length - a.path.length)[0];
    return best ?? navRoutes[0];
  }, [navRoutes, pathname]);

  useEffect(() => {
    if (!isOwner) {
      toast.error('You are not authorized to access this page.');
      navigate('/');
    }
  }, [isOwner, navigate]);

  return (
    <ChakraFlex width="100%" height="100vh">
      <Sidebar routes={routes} isCollapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
      <ChakraFlex width="100%" height="100%" padding="xl" gridGap="xl" overflow="auto" flexDirection="column">
        <Header />
        <ChakraFlex w="100%" minW={0} maxW="100%" flexDir="column">
          <ChakraFlex
            w="100%"
            maxW="100%"
            minW={0}
            my="md"
            flexDirection={{ md: 'column', lg: 'row' }}
            justifyContent="flex-start"
            alignItems={{ lg: 'center' }}
            gap={{ base: 'md', lg: '50px' }}
          >
            <ChakraFlex
              marginBottom={{ sm: 'md', lg: 0 }}
              flex="0 0 auto"
              alignItems="center"
            >
              <ChakraHeading
                fontSize="3xl"
                fontWeight="bold"
                color="blue.500"
                whiteSpace="nowrap"
              >
                Owner Dashboard
              </ChakraHeading>
            </ChakraFlex>
            <ChakraFlex
              flex="0 0 auto"
              flexShrink={0}
              w={{ base: '100%', lg: '36.6%' }}
              maxW={{ base: '100%', lg: '36.6%' }}
              minW={0}
              alignSelf={{ base: 'stretch', md: 'flex-start', lg: 'center' }}
              alignItems="stretch"
              boxShadow="lg"
              borderRadius="sm"
              overflow="visible"
              bg="white"
            >
              <ChakraMenu placement="bottom-start" matchWidth>
                <ChakraMenuButton
                  as={ChakraButton}
                  w="100%"
                  minH="68px"
                  px={4}
                  borderRadius="sm"
                  rightIcon={<Icon name="chevron-down" size="sm" color="currentColor" />}
                  variant="outline"
                  color="blue.500"
                  justifyContent="space-between"
                  fontWeight="bold"
                  borderWidth={0}
                  _focus={{ color: 'blue.500' }}
                  _hover={{ bg: 'rgba(5, 49, 74, 0.06)' }}
                  _active={{ bg: 'rgba(5, 49, 74, 0.08)', color: 'blue.500' }}
                >
                  <ChakraText as="span" isTruncated textAlign="left" flex={1}>
                    {activeRoute?.label ?? 'Sections'}
                  </ChakraText>
                </ChakraMenuButton>
                <ChakraMenuList maxH="70vh" overflowY="auto">
                  {navRoutes.map(({ path, label }) => {
                    const isActive = activeRoute?.path === path;
                    return (
                      <ChakraMenuItem
                        key={path}
                        fontWeight="normal"
                        pl={5}
                        color={isActive ? 'blue.500' : undefined}
                        onClick={() => navigate(path)}
                      >
                        {label}
                      </ChakraMenuItem>
                    );
                  })}
                </ChakraMenuList>
              </ChakraMenu>
            </ChakraFlex>
          </ChakraFlex>
          <FiltersFormProvider>
            <OwnerContextProvider>
              {React.Children.map(children, (child: any) => React.cloneElement(child, { ...props }))}
            </OwnerContextProvider>
          </FiltersFormProvider>
        </ChakraFlex>
      </ChakraFlex>
    </ChakraFlex>
  );
};
