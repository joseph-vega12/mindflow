import React, { FC, useMemo } from 'react';

import {
  Flex as ChakraFlex,
  FlexProps as ChakraFlexProps,
  Progress as ChakraProgress,
  Text as ChakraText
} from '@chakra-ui/react';

import { Loading } from '../../common';
import { percentage } from 'lib/utils';

interface ProgressCardProps extends ChakraFlexProps {
  title: string;
  total?: number;
  value?: number;
  isLoading?: boolean;
  isDisabled?: boolean;
  isPercentage?: boolean;
}

export const ProgressCard: FC<ProgressCardProps> = ({
  title,
  total = 0,
  value = 0,
  isLoading = false,
  isPercentage = true,
  isDisabled = false,
  ...props
}) => {
  const percentageValue = useMemo(() => {
    if (isDisabled || !value || !total) {
      return 0;
    }

    return percentage(value, total);
  }, [percentage, value, total]);

  return (
    <ChakraFlex width="100%" alignItems="center" gridGap="md" padding="lg" boxShadow="md" borderRadius="md" {...props}>
      <Loading isLoading={isLoading} width="25%" textAlign="center">
        <ChakraText whiteSpace="nowrap" fontSize="4xl" color="red.700">
          {isDisabled ? '-' : value.toFixed(0)}
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
              color="red"
              borderRadius="md"
              value={percentageValue}
            />
            <ChakraText width="20%" fontSize="sm" fontWeight="light" whiteSpace="nowrap">
              {isDisabled ? '-' : isPercentage ? `${percentageValue}%` : `${value}/${total}`}
            </ChakraText>
          </ChakraFlex>
        </Loading>
      </ChakraFlex>
    </ChakraFlex>
  );
};

export default ProgressCard;
