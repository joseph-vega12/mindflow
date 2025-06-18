import React, { FC, useMemo } from 'react';

import {
  Flex as ChakraFlex,
  FlexProps as ChakraFlexProps,
  Progress as ChakraProgress,
  Text as ChakraText
} from '@chakra-ui/react';

import { Loading } from '../../common';
import { percentage } from 'lib/utils';

interface ImprovementCardProps extends ChakraFlexProps {
  title: string;
  total?: number;
  value?: number;
  isLoading?: boolean;
  isDisabled?: boolean;
}

export const ImprovementCard: FC<ImprovementCardProps> = ({
  title,
  total = 0,
  value = 0,
  isLoading = false,
  isDisabled = false,
  ...props
}) => {
  const percentageValue = useMemo(() => {
    if (isDisabled || !value || !total) {
      return 0;
    }

    return percentage(value, total);
  }, [percentage, value, total]);

  const isPositivePercentage = percentageValue >= 0;

  return (
    <ChakraFlex width="100%" alignItems="center" gridGap="md" padding="lg" boxShadow="md" borderRadius="md" {...props}>
      <Loading isLoading={isLoading} width="25%" textAlign="center">
        <ChakraText whiteSpace="nowrap" fontSize="4xl" color={isPositivePercentage ? 'green.700' : 'red.700'}>
          {isDisabled ? '-' : `${percentageValue === 100 ? 0 : percentageValue}%`}
        </ChakraText>
      </Loading>
      <ChakraFlex width="100%" flexDirection="column">
        <ChakraText whiteSpace="nowrap" fontSize={{ lg: 'md', xl: 'lg' }} fontWeight="600">
          {title}
        </ChakraText>
        <Loading width="100%" isLoading={isLoading}>
          <ChakraFlex width="100%" display="flex" alignItems="center" gridGap="sm">
            <ChakraProgress
              width="100%"
              height="14px"
              size="sm"
              colorScheme={isPositivePercentage ? 'green' : 'red'}
              borderRadius="md"
              value={percentageValue < 0 ? 100 + percentageValue : 100 - percentageValue}
            />
            <ChakraText
              width="20%"
              fontSize="sm"
              fontWeight="light"
              whiteSpace="nowrap"
              color={isPositivePercentage ? 'green.700' : 'red.700'}
            >
              {percentageValue === 100 ? 0 : percentageValue}%
            </ChakraText>
          </ChakraFlex>
        </Loading>
      </ChakraFlex>
    </ChakraFlex>
  );
};
