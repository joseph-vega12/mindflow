import React, { FC, useMemo } from 'react';

import { Box, Divider as ChakraDivider, Flex as ChakraFlex, Text as ChakraText, useToast } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';

import { IconName } from 'types';

import { Icon } from 'components/common';

import { toast } from 'react-toastify';
import { useAuthContext } from 'lib/firebase';
import { useLicenses } from 'lib/customHooks';
export interface SidebarRouteItem {
  path: string;
  as?: React.ReactNode;
  icon?: IconName;
  label: string;
}

export interface SidebarProps {
  isCollapsed: boolean;
  routes: SidebarRouteItem[];
  setCollapsed: (...args: any[]) => any;
}

export const Sidebar: FC<SidebarProps> = ({ routes, isCollapsed, setCollapsed }) => {
  const { user, signOut } = useAuthContext();
  const { isOwner, isBusinessOwner } = useLicenses();
  const finished = user.userDetails.activity.tutorial.finished;
  const access = finished || isOwner || isBusinessOwner;
  const { pathname } = useLocation();

  const RouteItem: FC<SidebarRouteItem> = (route) => {
    const isSelectedRoute = useMemo(() => {
      const homeRoutes = ['/', '/business']; // TODO: improve this
      if (!homeRoutes.includes(route.path)) {
        return pathname.match(route.path);
      }

      if (pathname === '/' && route.path === '/') {
        return true;
      }
      if (pathname === '/business' && route.path === '/business') {
        return true;
      }
    }, [route, pathname]);

    const handleToast = () => {
      if (!access) {
        toast.error('You do not have access until tests are complete.');
      }
    };
    const invertedBorderStyle = {
      right: '0',
      width: '30px',
      height: '30px',
      position: 'absolute',
      borderRadius: '50%',
      boxShadow: '-20px 9px 0 -3px white',
      content: `""`
    };

    return (
      <div
        onClick={() => {
          return route.path.includes('business') ? {} : handleToast();
        }}
      >
        <Box
          zIndex={3}
          as={Link}
          key={route.path}
          to={route.path}
          style={route.path.includes('business') ? {} : !access ? { pointerEvents: 'none' } : {}}
        >
          <ChakraFlex
            gridGap="md"
            marginY="sm"
            paddingY="12px"
            textAlign="center"
            position="relative"
            borderBottomLeftRadius="2xl"
            borderTopLeftRadius="2xl"
            paddingLeft="md"
            alignItems="center"
            marginLeft="12px"
            justifyContent="flex-start"
            backgroundColor={isSelectedRoute ? 'white' : 'transparent'}
            // @ts-ignore
            _before={
              isSelectedRoute && {
                ...invertedBorderStyle,
                top: '-30px',
                transform: 'rotate(-105deg)'
              }
            }
            // @ts-ignore
            _after={
              isSelectedRoute && {
                ...invertedBorderStyle,
                bottom: '-30px',
                transform: 'rotate(-205deg)'
              }
            }
          >
            <Icon
              size="md"
              name={route.icon}
              // @ts-ignore
              as={route.as}
              color={isSelectedRoute ? 'teal.300' : 'white'}
            />
            <ChakraText
              as="span"
              fontSize="sm"
              fontWeight="bolder"
              whiteSpace="nowrap"
              color={isSelectedRoute ? 'teal.300' : 'white'}
            >
              {route.label}
            </ChakraText>
          </ChakraFlex>
        </Box>
      </div>
    );
  };
  return (
    <ChakraFlex
      height="100%"
      flexDirection="column"
      justifyContent="space-between"
      background="linear-gradient(10.85deg, #05314A 33.39%, #0C3950 37.66%, #1E4D62 44.12%, #3C6F80 51.97%, #659EA8 60.82%, #94D4D6 69.6%);"
      minWidth="175px"
    >
      <ChakraFlex flexDirection="column" paddingTop={4}>
        {routes.map((r, indx) => {
          return <RouteItem key={indx} path={r.path} icon={r.icon || 'students'} label={r.label} as={r.as ?? null} />;
        })}
        <ChakraFlex paddingX="md">
          <ChakraDivider marginTop="md" borderColor="white" />
        </ChakraFlex>
        {(isOwner || isBusinessOwner) && <RouteItem path="/owner" icon="user" label="Owner" />}
        {isOwner && <RouteItem path="/reports" icon="bar-chart" label="Reports" />}
      </ChakraFlex>

      <ChakraFlex my={2} py={3} gridGap="md" paddingLeft="md" marginLeft="12px" justifyContent="flex-start">
        <Icon cursor="pointer" name="logout" color="white" size="md" onClick={signOut} />
        {!isCollapsed && (
          <ChakraText as="span" fontSize="sm" fontWeight="bolder" whiteSpace="nowrap" color="white">
            Logout
          </ChakraText>
        )}
      </ChakraFlex>
    </ChakraFlex>
  );
};
