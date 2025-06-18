import React, { FC } from 'react';

import { Flex as ChakraFlex, FlexProps as ChakraFlexProps, Text as ChakraText } from '@chakra-ui/react';

import { IconName } from 'types';

import { BaseCard, Icon } from 'components/common';

interface AverageCardProps extends ChakraFlexProps {
  value: string | number;
  description: string;
  color: 'orange' | 'red' | 'blue' | 'teal' | 'gray';
  icon: IconName;
}

export const AverageCard: FC<AverageCardProps> = ({ value, description, color, icon, ...rest }) => {
  return (
    <BaseCard width="100%" background={`${color}.500`} {...rest}>
      <ChakraFlex width="100%" height="100%" gridGap="sm">
        <ChakraFlex flex="2" flexDirection="column">
          <ChakraText fontSize="2xl" color="white">
            {value}
          </ChakraText>
          <ChakraText fontSize="lg" color="white">
            {description}
          </ChakraText>
        </ChakraFlex>
        <ChakraFlex justifyContent="flex-end">
          <Icon color="white" size="sm" name={icon} />
        </ChakraFlex>
      </ChakraFlex>
    </BaseCard>
  );
};
