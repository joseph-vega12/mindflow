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
  Text as ChakraText,
  Link as ChakraLink
} from '@chakra-ui/react';

import { BineuralBeatsPlayer } from 'components/common/BineuralBeats';
import { Icon } from 'components/common';

import { useAuthContext } from 'lib/firebase';

import { IconName } from 'types';

interface HeaderProps {
  isPublic?: boolean;
}

export const TransparentHeader: FC<HeaderProps> = ({ isPublic }) => {
  return (
    <ChakraGrid
      display={{ xs: 'none', lg: 'grid' }}
      alignItems="center"
      background="rgba(5, 49, 93, 0.7)"
      borderTopLeftRadius="32px"
      borderTopRightRadius="32px"
      height="105px"
      templateColumns={'repeat(2, 1fr)'}
    >
      <ChakraFlex alignItems="flex-end">
        <Icon marginRight="sm" name="mind-flow-full-logo-white" width="auto" height="69px" mt={30} ml={49} />
      </ChakraFlex>
      <ChakraFlex justifyContent="flex-end">
        <ChakraFlex marginRight="lg" justifyContent="flex-end">
          <ChakraText color="white" fontWeight="bold" fontSize="md">
            business@mindflowspeedreading.com
          </ChakraText>
        </ChakraFlex>
        <ChakraFlex marginRight="lg" justifyContent="flex-end">
          <ChakraText color="white" fontWeight="bold" fontSize="md">
            support@mindflowspeedreading.com
          </ChakraText>
        </ChakraFlex>

        <ChakraLink
          as="a"
          href="https://mindflowspeedreading.com"
          target="_blank"
          color="#94D4D6"
          fontWeight="bold"
          marginLeft="xl"
          marginRight="49px"
          whiteSpace="nowrap"
          _hover={{ textDecoration: 'none' }}
          fontSize="md"
          borderBottom="2px solid #94D4D6"
        >
          MindFlow Website
        </ChakraLink>
      </ChakraFlex>
    </ChakraGrid>
  );
};
