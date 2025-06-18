import React, { FC } from 'react';

import { Box, Grid, Heading } from '@chakra-ui/react';

import { Icon } from 'components/common';

import { UserActivityStats } from 'types';
import StudentDataItem from './StudentDataItem';

interface Props {
  wordSpeedStats?: UserActivityStats['wordSpeed'];
}
export const StudentSpeedReadingData: FC<Props> = ({ wordSpeedStats = {} }) => {
  const { firstWordSpeed, lastWordSpeed, bestWordSpeed, averageWordSpeed, totalWordSpeedReports } = wordSpeedStats;

  return (
    <Grid gridTemplateColumns="1fr 4fr" height="100%" alignItems="center">
      <Box textAlign="center" borderRight="1px solid" borderRightColor="gray.300" pr={6} mr={2}>
        <Icon name="speed-read" fontSize="4xl" color="blue.500" />
        <Heading as="p" fontSize={{ lg: 'lg', md: 'md' }} fontWeight="500" mt={2}>
          Reading Speed Data
        </Heading>
      </Box>
      <Box d="flex" alignItems="center">
        <StudentDataItem title="Best" value={bestWordSpeed} />
        <StudentDataItem title="Current" value={lastWordSpeed} />
        <StudentDataItem title="First" value={firstWordSpeed} />
        <StudentDataItem title="Average" value={averageWordSpeed} />
        <StudentDataItem title="Total" value={totalWordSpeedReports} />
      </Box>
    </Grid>
  );
};
