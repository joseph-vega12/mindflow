import React, { FC } from 'react';

import { Flex as ChakraFlex, Heading as ChakraHeading, Text as ChakraText } from '@chakra-ui/react';

export const BlockWall: FC = () => (
  <ChakraFlex
    top="0"
    left="0"
    width="100%"
    height="100%"
    position="absolute"
    alignItems="center"
    flexDirection="column"
    justifyContent="center"
    zIndex="100"
  >
    <ChakraFlex top="0" left="0" width="100%" height="100%" opacity="0.9" position="absolute" backgroundColor="black" />
    <ChakraFlex justifyContent="center" alignItems="center" flexDirection="column" zIndex="150">
      <ChakraHeading color="white">License Expired</ChakraHeading>
      <ChakraText textAlign="center" color="whiteAlpha.800">
        Your license has expired. Please contact the support
        <br /> to extend it and continue using the platform
      </ChakraText>
      <ChakraText
        as="a"
        href="mailto:support@mindflowspeedreading.com"
        color="teal.500"
        cursor="pointer"
        marginTop="sm"
        textDecoration="underline"
      >
        support@mindflowspeedreading.com
      </ChakraText>
    </ChakraFlex>
  </ChakraFlex>
);
