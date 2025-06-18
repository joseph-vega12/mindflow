import { Box, BoxProps } from '@chakra-ui/react';
import React, { FC } from 'react';

interface Props extends BoxProps {
  spacing?: 'sm' | 'md' | 'lg';
}

export const BasePage: FC<Props> = ({ spacing = 'lg', children, ...rest }) => {
  const basePageSpacingOptions: Record<string, [number, number, number]> = {
    sm: [4, 4, 6],
    md: [4, 4, 12],
    lg: [4, 4, 24]
  };

  return (
    <Box
      boxShadow="0px 3px 8px rgba(0, 0, 0, 0.45);"
      borderRadius="15px"
      py={[4, 8]}
      px={basePageSpacingOptions[spacing]}
      width="100%"
      {...rest}
    >
      {children}
    </Box>
  );
};
