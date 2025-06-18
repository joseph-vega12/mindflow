import React, { FC } from 'react';

import { Flex as ChakraFlex, Grid as ChakraGrid, Heading as ChakraHeading } from '@chakra-ui/react';

import { Icon } from 'components/common';

interface ActivitiesResumeProps {
  finishedBrainEye?: number;
  finishedDiagnostics?: number;
  finishedPractices?: number;
  finishedSpeedReads?: number;
  finishedVideos?: number;
}

export const ActivitiesResume: FC<ActivitiesResumeProps> = ({
  finishedBrainEye = 0,
  finishedDiagnostics = 0,
  finishedPractices = 0,
  finishedSpeedReads = 0,
  finishedVideos = 0
}) => {
  return (
    <ChakraFlex paddingX={{ md: 'xl', lg: 'none' }} flexDirection="column">
      <ChakraGrid marginBottom="md" templateColumns="1fr 2fr 2fr" alignItems="center">
        <Icon name="diagnostic-test" fontSize="3xl" color="teal.500" />
        <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center">
          {finishedDiagnostics ?? '-'}
        </ChakraHeading>
        <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }}>
          Diagnostics
        </ChakraHeading>
      </ChakraGrid>
      <ChakraGrid marginBottom="md" templateColumns="1fr 2fr 2fr" alignItems="center">
        <Icon color="teal.500" name="speed-reading-test" fontSize="3xl" />
        <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center">
          {finishedSpeedReads ?? '-'}
        </ChakraHeading>
        <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }}>
          Speed Assessments
        </ChakraHeading>
      </ChakraGrid>
      <ChakraGrid marginBottom="md" templateColumns="1fr 2fr 2fr" alignItems="center">
        <Icon color="teal.500" name="practices" fontSize="3xl" />
        <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center">
          {finishedPractices ?? '-'}
        </ChakraHeading>
        <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }}>
          Practice
        </ChakraHeading>
      </ChakraGrid>
      <ChakraGrid marginBottom="md" templateColumns="1fr 2fr 2fr" alignItems="center">
        <Icon color="teal.500" name="brain_eye_coordination_mono" fontSize="3xl" />
        <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center">
          {finishedBrainEye ?? '-'}
        </ChakraHeading>
        <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }}>
          Brain Eye Coordination
        </ChakraHeading>
      </ChakraGrid>
      <ChakraGrid marginBottom="md" templateColumns="1fr 2fr 2fr" alignItems="center">
        <Icon color="teal.500" name="videos_watched" fontSize="3xl" />
        <ChakraHeading as="h5" fontWeight="300" fontSize="4xl" textAlign="center">
          {finishedVideos ?? '-'}
        </ChakraHeading>
        <ChakraHeading as="h4" fontWeight="500" fontSize={{ lg: 'lg', md: 'md' }}>
          Videos Watched
        </ChakraHeading>
      </ChakraGrid>
    </ChakraFlex>
  );
};
