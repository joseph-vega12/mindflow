import React, { FC } from 'react';

import {
  Flex as ChakraFlex,
  Grid as ChakraGrid,
  GridItem as ChakraGridItem,
  Heading as ChakraHeading,
  Text as ChakraText
} from '@chakra-ui/react';

import { AverageCard } from 'components/Pages/Business/Home';
import { BaseCard, Icon } from 'components/common';
import { BusinessAverageCard } from 'components/Pages/BusinessDashboard';

interface ActivitiesResumeProps {
  data: Record<string, any>;
}
export const StudentReadingImprovementData: FC<ActivitiesResumeProps> = ({ data }) => {
  return (
    <ChakraGrid gridRowGap="md" gridColumnGap="md">
      <BusinessAverageCard
        bgColor="white"
        color="red"
        columnDirection="row"
        width="100%"
        value={data.firstWordSpeed}
        icon="guageLow"
        description="Student’s starting reading speed score"
      />
      <BusinessAverageCard
        bgColor="white"
        color="blue"
        columnDirection="row"
        width="100%"
        value={data.bestWordSpeed}
        icon="guageHigh"
        description="Student’s Highest reading speed score"
      />
      <ChakraFlex gridGap={5}>
        <BusinessAverageCard
          bgColor="white"
          color="blue"
          columnDirection="column"
          width="50%"
          value={data.speedReadingImprovement}
          description="Speed reading improvement"
        />
        <BusinessAverageCard
          bgColor="white"
          color="blue"
          columnDirection="column"
          width="50%"
          value={data.speedReadingImprovementPercentage}
          description="Speed reading improvement %"
        />
      </ChakraFlex>
      <ChakraFlex justifyContent="start" gridGap="1.5">
        <ChakraText fontSize="lg" fontWeight="normal">
          Student’s name:
        </ChakraText>
        <ChakraText fontSize="lg" fontWeight="bold">
          {data.student}
        </ChakraText>
      </ChakraFlex>
    </ChakraGrid >
  );
};
