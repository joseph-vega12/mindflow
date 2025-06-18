import React, { FC } from 'react';

import { Box, BoxProps, Spinner } from '@chakra-ui/react';

interface Props extends BoxProps {
  isLoading: boolean;
}

export const PageLoading: FC<Props> = ({ children, isLoading, ...rest }) => {
  if (isLoading) {
    return (
      <Box width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center" {...rest}>
        <Spinner
          // @ts-ignore
          boxSize="100px"
          thickness="4px"
          speed="0.8s"
          emptyColor="gray.100"
          color="blue.800"
        />
      </Box>
    );
  }

  return <>{children}</>;
};
