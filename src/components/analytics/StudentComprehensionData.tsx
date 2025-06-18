import React, { FC } from 'react';

import { Box, Grid, Heading } from '@chakra-ui/react';
import { Icon } from 'components/common';
import StudentDataItem from './StudentDataItem';

import { UserActivityStats } from 'types';

interface Props {
  comprehensionStats?: UserActivityStats['comprehension'];
}
export const StudentComprehensionData: FC<Props> = ({ comprehensionStats = {} }) => {
  const { lastComprehension, averageComprehension, totalComprehensionReports } = comprehensionStats;

  return (
    <Grid gridTemplateColumns="1fr 4fr" height="100%" alignItems="center">
      <Box textAlign="center" borderRight="1px solid" borderRightColor="gray.300" pr={6} mr={2}>
        <Icon name="comprehension" fontSize="4xl" color="blue.500" />
        <Heading as="p" fontSize={{ lg: 'lg', md: 'md' }} fontWeight="500" mt={2}>
          Reading Speed Data
        </Heading>
      </Box>
      <Box d="flex" alignItems="center">
        <StudentDataItem title="Last" value={`${lastComprehension}%`} />
        <StudentDataItem title="Average" value={`${averageComprehension}%`} />
        <StudentDataItem title="Total" value={totalComprehensionReports} />
      </Box>
    </Grid>
  );
};
