import React, { FC } from 'react';

import { Flex as ChakraFlex, FlexProps as ChakraFlexProps, Heading as ChakraHeading } from '@chakra-ui/react';

import { Loading } from 'components/common/Loading';

interface IndicatorProps extends ChakraFlexProps {
  value: number | string;
  label: string;
  isLoading?: boolean;
}

export const Indicator: FC<IndicatorProps> = ({ value, isLoading = false, label, ...rest }) => {
  return (
    <ChakraFlex marginBottom="sm" alignItems="center" {...rest}>
      <Loading isLoading={isLoading}>
        <ChakraHeading
          marginRight="md"
          fontWeight="300"
          lineHeight={1}
          fontSize={{
            lg: '4xl',
            xl: '5xl'
          }}
        >
          {value}
        </ChakraHeading>
      </Loading>
      <ChakraHeading
        m={0}
        as="h3"
        color="black"
        fontWeight="500"
        fontSize={{
          md: 'sm',
          lg: 'md',
          xl: 'lg'
        }}
      >
        {label}
      </ChakraHeading>
    </ChakraFlex>
  );
};
