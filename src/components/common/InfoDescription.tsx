import { BoxProps, Text } from '@chakra-ui/react';
import React, { FC } from 'react';

import { Loading } from './Loading';

interface Props extends BoxProps {
  label: string;
  description?: string | number;
  isLoading?: boolean;
}

export const InfoDescription: FC<Props> = ({ label, description = '', isLoading = false, children, ...rest }) => {
  return (
    <Text color="gray.500" fontWeight="bolder" {...rest}>
      {label}:
      <Loading isLoading={isLoading} display="inline">
        <Text as="span" pl={1} color="black" fontWeight="400">
          {description}
        </Text>
        {children}
      </Loading>
    </Text>
  );
};
