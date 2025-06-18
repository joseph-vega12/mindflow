import { Flex, Progress, Text } from '@chakra-ui/react';
import { percentage } from 'lib/utils';
import React, { FC, useMemo } from 'react';

interface Props {
  value: number;
  min?: number;
  max: number;
}

export const PercentageProgress: FC<Props> = ({ value, min = 0, max, ...rest }) => {
  const percentageValue = useMemo(() => percentage(value, max), [percentage, value, max]);

  return (
    <Flex width="100%" alignItems="center">
      <Progress borderRadius={5} width="90%" value={value} min={min} max={max} size="md" {...rest} />
      <Text as="span" fontSize="md" ml={3}>
        {percentageValue}%
      </Text>
    </Flex>
  );
};
