import React, { FC } from 'react';
import { Box, Heading } from '@chakra-ui/react';

interface Props {
  title?: string;
  value?: string | number;
  result?: string;
}

const StudentDataItem: FC<Props> = ({ title, value, result }) => {
  return (
    <Box textAlign="center" flex="1">
      <Heading as="p" fontSize="md" fontWeight="500">
        {title}
      </Heading>
      <Heading as="p" fontSize="3xl" fontWeight="300" my={4} color="green.600">
        {value ?? '-'}
      </Heading>
      {result && (
        <Heading as="p" fontSize="md" fontWeight="500" color="gray.500">
          {result}
        </Heading>
      )}
    </Box>
  );
};

export default StudentDataItem;
