import React, { FC } from 'react';

import { BaseCard } from 'components/common';
import { Center, Flex as ChakraFlex, Grid as ChakraGrid, GridItem, Heading as ChakraHeading } from '@chakra-ui/react';

import { Icon } from 'components/common';

interface BusinessActivitiesResumeProps {
  title: string;
  color: string;
  iconColor: string;
  finishedBrainEye?: number;
  finishedDiagnostics?: number;
  finishedPractices?: number;
  finishedSpeedReads?: number;
  finishedVideos?: number;
  streamedMinutesBinauralBeats?: number;
  hoursSpentAtMindFlow?: number;
}

export const BusinessActivitiesResume: FC<BusinessActivitiesResumeProps> = ({
  title,
  color,
  iconColor,
  finishedBrainEye = 0,
  finishedDiagnostics = 0,
  finishedPractices = 0,
  finishedSpeedReads = 0,
  finishedVideos = 0,
  streamedMinutesBinauralBeats = 0,
  hoursSpentAtMindFlow = 0
}) => {
  return (
    <GridItem>
      <BaseCard title={title} borderRadius={18} height="430px">
        <ChakraFlex paddingX={{ md: 'xl', lg: 'lg' }} flexDirection="column">
          <ChakraGrid marginBottom="md" templateColumns="1fr 2fr 2fr" alignItems="center">
            <Icon name="diagnostic-test" fontSize="4xl" color={iconColor} />
            <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center" color={color}>
              {finishedDiagnostics ?? '-'}
            </ChakraHeading>
            <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }} color={color}>
              Diagnostic tests
            </ChakraHeading>
          </ChakraGrid>
          <ChakraGrid marginBottom="md" templateColumns="1fr 2fr 2fr" alignItems="center">
            <Icon color={iconColor} name="speed-reading-test" fontSize="4xl" />
            <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center" color={color}>
              {finishedSpeedReads ?? '-'}
            </ChakraHeading>
            <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }} color={color}>
              Speed Tests
            </ChakraHeading>
          </ChakraGrid>
          <ChakraGrid marginBottom="md" templateColumns="1fr 2fr 2fr" alignItems="center">
            <Icon color={iconColor} name="practices" fontSize="4xl" />
            <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center" color={color}>
              {finishedPractices ?? '-'}
            </ChakraHeading>
            <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }} color={color}>
              Practices
            </ChakraHeading>
          </ChakraGrid>
          <ChakraGrid marginBottom="md" templateColumns="1fr 2fr 2fr" alignItems="center">
            <Icon color={iconColor} name="brain_eye_coordination_mono" fontSize="4xl" />
            <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center" color={color}>
              {finishedBrainEye ?? '-'}
            </ChakraHeading>
            <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }} color={color}>
              Brain Eye Coordination
            </ChakraHeading>
          </ChakraGrid>
          <ChakraGrid marginBottom="md" templateColumns="1fr 2fr 2fr" alignItems="center">
            <Icon color={iconColor} name="videos_watched" fontSize="4xl" />
            <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center" color={color}>
              {finishedVideos ?? '-'}
            </ChakraHeading>
            <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }} color={color}>
              Videos Watched
            </ChakraHeading>
          </ChakraGrid>
          {/*
          <ChakraGrid marginBottom="lg" templateColumns="1fr 2fr 2fr" alignItems="center">
            <Icon color={iconColor} name="hourglass" fontSize="4xl" />
            <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center" color={color}>
              {streamedMinutesBinauralBeats ?? '-'}
            </ChakraHeading>
            <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }} color={color}>
              Streamed minutes of binaural beats
            </ChakraHeading>
          </ChakraGrid>
          <ChakraGrid marginBottom="lg" templateColumns="1fr 2fr 2fr" alignItems="center">
            <Icon color={iconColor} name="calendarTimeSpent" fontSize="4xl" />
            <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center" color={color}>
              {hoursSpentAtMindFlow ?? '-'}
            </ChakraHeading>
            <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }} color={color}>
              Hours spent at MindFlow
            </ChakraHeading>
          </ChakraGrid>
        */}
        </ChakraFlex>
      </BaseCard>
    </GridItem>
  );
};
