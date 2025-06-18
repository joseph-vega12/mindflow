import React, { FC } from 'react';

import {
  Avatar as ChakraAvatar,
  AvatarBadge as ChakraAvatarBadge,
  Flex as ChakraFlex,
  Grid as ChakraGrid,
  Menu as ChakraMenu,
  MenuButton as ChakraMenuButton,
  MenuItem as ChakraMenuItem,
  MenuList as ChakraMenuList,
  Text as ChakraText
} from '@chakra-ui/react';
import { useMatch, useNavigate } from 'react-router-dom';

import { BineuralBeatsPlayer } from 'components/common/BineuralBeats';
import { Icon } from 'components/common';

import { useAuthContext } from 'lib/firebase';

import { IconName } from 'types';
import { PeopleOnline } from 'components/common/PeopleOnline';

const socialMedias: {
  link: string;
  icon: IconName;
}[] = [
    {
      link: 'https://www.facebook.com/mindflow.speedreading',
      icon: 'facebook'
    },
    {
      link: 'https://www.instagram.com/mindflow.speedreading',
      icon: 'instagram'
    },
    {
      link: 'https://twitter.com/mindflowreading',
      icon: 'twitter'
    }
  ];

interface HeaderProps {
  isPublic?: boolean;
}

export const Header: FC<HeaderProps> = ({ isPublic }) => {
  const { user, signOut } = useAuthContext();

  const navigate = useNavigate();
  const isDiagnostic = useMatch('/diagnostics/:diagnosticId');

  const matchOwner = useMatch('/owner');
  const matchBusiness = useMatch('/business');
  const matchReports = useMatch('/reports');

  const isOwner = matchOwner || matchBusiness || matchReports;

  return (
    <ChakraGrid
      display={{ xs: 'none', lg: 'grid' }}
      alignItems="center"
      templateColumns={isPublic ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)'}
    >
      <ChakraFlex alignItems="flex-end">
        <Icon marginRight="sm" name="mind-flow-full-logo" width="250px" height="30px" />
        <ChakraFlex>
          {socialMedias.map((social, idx) => (
            <Icon
              size="sm"
              color="blue.500"
              cursor="pointer"
              key={idx}
              name={social.icon}
              _notLast={{
                marginRight: 'sm'
              }}
              onClick={() => window.open(social.link, '_blank')}
            />
          ))}
        </ChakraFlex>
      </ChakraFlex>
      {isPublic ? (
        <ChakraFlex justifyContent="flex-end">
          <ChakraFlex marginRight="lg" alignItems="center">
            <Icon marginRight="sm" size="sm" name="mail" />
            <ChakraText color="gray.600" fontWeight="bold" fontSize="md">
              business@mindflowspeedreading.com
            </ChakraText>
          </ChakraFlex>
          <ChakraFlex alignItems="center">
            <Icon marginRight="sm" size="sm" name="mail" />
            <ChakraText color="gray.600" fontWeight="bold" fontSize="md">
              support@mindflowspeedreading.com
            </ChakraText>
          </ChakraFlex>
        </ChakraFlex>
      ) : (
        <>
          <ChakraFlex width="100%" paddingX="xl">
            {!isDiagnostic && !isOwner && <BineuralBeatsPlayer />}
            {isOwner && <PeopleOnline isLoading={true} />}
          </ChakraFlex>
          <ChakraFlex width="100%" alignItems="center" justifyContent="flex-end">
            <ChakraText whiteSpace="nowrap" fontSize="md" color="orange.500">
              Level {user?.userDetails.level ?? 1}
            </ChakraText>
            <ChakraText paddingX="md" whiteSpace="nowrap" fontSize="md" fontWeight="bold" color="gray.500">
              Level{' '}
              <ChakraText as="span" textTransform="uppercase">
                {user?.userDetails.currentLevel}
              </ChakraText>
            </ChakraText>

            <ChakraMenu>
              <ChakraMenuButton>
                <ChakraAvatar width="40px" height="40px" src={user?.userDetails?.picture ?? undefined}>
                  <ChakraAvatarBadge bottom="30px" boxSize="1.2rem" bg="green.500" />
                </ChakraAvatar>
              </ChakraMenuButton>
              <ChakraMenuList borderRadius="md" border="sm" borderColor="gray.200" boxShadow="none">
                <ChakraMenuItem color="blue.500" onClick={() => navigate('/profile')}>
                  Profile
                </ChakraMenuItem>
                <ChakraMenuItem color="blue.500" onClick={() => { signOut(); navigate('/login') }}>
                  Logout
                </ChakraMenuItem>
              </ChakraMenuList>
            </ChakraMenu>
          </ChakraFlex>
        </>
      )}
    </ChakraGrid>
  );
};
