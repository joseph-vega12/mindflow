import React, { FC } from 'react';

import { Flex as ChakraFlex, Skeleton as ChakraSkeleton, SpinnerProps as ChakraSpinnerProps } from '@chakra-ui/react';

interface LoadingProps extends ChakraSpinnerProps {
  isLoading: boolean;
}

export const Loading: FC<LoadingProps> = ({ isLoading, boxSize, children, ...rest }) => {
  return <ChakraFlex {...rest}>{isLoading ? <ChakraSkeleton>{children}</ChakraSkeleton> : <>{children}</>}</ChakraFlex>;
};
