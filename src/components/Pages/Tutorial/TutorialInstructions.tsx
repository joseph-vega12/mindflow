import React, { FC } from 'react';

import { Box, Divider, Flex, Text } from '@chakra-ui/react';

import { Icon } from 'components/common';
import { VideoPlayer } from 'components/common';

import { TutorialVideoType } from './TutorialContainer';

import { useAuthContext } from 'lib/firebase';

interface Props {
  onVideoFinish: (videoType: TutorialVideoType) => void;
}

export const TutorialInstructions: FC<Props> = ({ onVideoFinish }) => {
  const { user } = useAuthContext();

  return (
    <Box d="flex" flexDir="column">
      <Flex flexDirection={{ lg: 'row', md: 'column' }} alignItems="center">
        <Icon name="welcome" fontSize="6xl" />
        <Text as="p" fontWeight="bold" color="gray.600" ml={{ lg: 8, md: 0 }} mr={{ lg: 2, md: 0 }}>
          Welcome to MindFlow, {user?.userDetails.firstName}! <br />
          Follow the next steps to learn how the platform works and to begin your speed reading training.
        </Text>
      </Flex>

      <Divider borderTopColor="teal.500" mt={4} mb={10} borderTopWidth={2} />

      <Box borderRadius={20} overflow="hidden" textAlign="center" shadow="md" mb={14}>
        <VideoPlayer
          id="welcome"
          videoUrl="https://cdn.jwplayer.com/videos/0kIYNF2I.mp4"
          onFinish={() => onVideoFinish('welcome')}
        />
        <Text fontSize="xl" bg="white" py={7} borderWidth={1} borderStyle="solid">
          Welcome to MindFlow & Onboarding
        </Text>
      </Box>

      <Box d="flex" flexDirection={{ lg: 'row', md: 'column' }}>
        <Icon name="ready-set-go" fontSize="6xl" />

        <Text as="p" fontWeight="bold" color="gray.600" ml={{ lg: 8, md: 0 }} mr={{ lg: 2, md: 0 }}>
          Now it’s your turn! Watch the video to understand how you use the platform. Learn about the different
          techniques, the components of the platform, and how the system tracks your progress and improvements.
        </Text>
      </Box>

      <Divider borderTopColor="teal.500" mt={4} mb={10} borderTopWidth={2} />

      <Box borderRadius={20} textAlign="center" shadow="md">
        <VideoPlayer
          id="tutorial"
          videoUrl="https://cdn.jwplayer.com/videos/3nQyI6Nj.mp4"
          onFinish={() => onVideoFinish('tutorial')}
        />
        <Text fontSize="xl" bg="white" py={7} borderWidth={1} borderStyle="solid">
          How does MindFlow work?
        </Text>
      </Box>
    </Box>
  );
};
