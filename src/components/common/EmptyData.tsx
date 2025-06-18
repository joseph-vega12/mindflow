import { Box, Text } from '@chakra-ui/react';
import React, { FC } from 'react';

export interface Props {
  empty: boolean;
  text?: string;
}
export const EmptyData: FC<Props> = ({ empty, text, children }) => {
  return (
    <Box height="100%">
      {empty ? (
        <Box height="100%" display="flex" justifyContent="center" alignItems="center">
          <Text fontSize="sm" color="gray.400">
            {text ?? 'No data'}
          </Text>
        </Box>
      ) : (
        children
      )}
    </Box>
  );
};
