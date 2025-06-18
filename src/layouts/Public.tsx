import React, { FC } from 'react';

import { Flex as ChakraFlex, Img as ChakraImg, Text as ChakraText } from '@chakra-ui/react';

import { Header } from 'components/layout';
import { Icon } from 'components/common';

export const PublicLayout: FC = ({ children, ...props }) => {
  return (
    <ChakraFlex width="100%" height="100%" flexDirection="column" padding={{ xs: 'none', lg: 'xl' }} overflow="auto">
      <Header isPublic />
      <ChakraFlex
        width="100%"
        height="110px"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        display={{ xs: 'flex', lg: 'none' }}
      >
        <ChakraImg
          top="0"
          left="0"
          zIndex="0"
          width="100%"
          height="140px"
          position="absolute"
          src={require('assets/images/public/background.jpg')}
        />
        <ChakraImg zIndex="10" src={require('assets/images/public/logo.png')} />
      </ChakraFlex>
      <ChakraFlex width="100%" zIndex="10" flexDirection="column" marginTop={{ xs: 'none', lg: 'xl' }}>
        {React.Children.map(children, (child: any) => React.cloneElement(child, { ...props }))}
      </ChakraFlex>
      <ChakraFlex
        paddingY="lg"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        display={{ xs: 'flex', lg: 'none' }}
      >
        <ChakraFlex marginBottom="sm" alignItems="center">
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
    </ChakraFlex>
  );
};
