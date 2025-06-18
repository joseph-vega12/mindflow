import React, { FC } from 'react';

import { Flex as ChakraFlex } from '@chakra-ui/react';


export const Footer: FC<{}> = ({}) => {

  return (
    <ChakraFlex
        backgroundImage={`url(${require('assets/images/public/speed_read_footer.png')})`}
        width="100%"
        height="400px"
        backgroundPosition="center"
        backgroundRepeat="no-repeat"
        position="absolute"
        left="0px"
        bottom={{ base: "-300px", md: "-230px" , sm: "-230px"}}
        backgroundSize="cover"
    >
    </ChakraFlex>
  );
};
