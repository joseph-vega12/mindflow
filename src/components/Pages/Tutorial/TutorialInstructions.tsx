import React, { FC, useEffect, useState } from 'react';

import { Box, Divider, Flex, Text } from '@chakra-ui/react';

import { Icon } from 'components/common';
import { VideoPlayer } from 'components/common';

import { useAuthContext } from 'lib/firebase';

interface Props {
  onWelcomeVideoFinish: () => void;
  onTutorialVideoFinish: () => void;
  showWelcomeVideo: boolean;
  showTutorialVideo: boolean;
}

const useDelayedHide = (isVisible: boolean, delayMs = 400) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      return;
    }

    const timeoutId = setTimeout(() => setShouldRender(false), delayMs);
    return () => clearTimeout(timeoutId);
  }, [isVisible, delayMs]);

  return shouldRender;
};

export const TutorialInstructions: FC<Props> = ({
  onWelcomeVideoFinish,
  onTutorialVideoFinish,
  showWelcomeVideo,
  showTutorialVideo
}) => {
  const { user } = useAuthContext();
  const renderWelcomeVideo = useDelayedHide(showWelcomeVideo);
  const renderTutorialVideo = useDelayedHide(showTutorialVideo);

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

      {renderWelcomeVideo ? (
        <Box borderRadius={20} overflow="hidden" textAlign="center" shadow="md" mb={14}>
          <VideoPlayer
            id="welcome"
            videoUrl="https://cdn.jwplayer.com/videos/0kIYNF2I.mp4"
            onFinish={onWelcomeVideoFinish}
          />
          <Text fontSize="xl" bg="white" py={7} borderWidth={1} borderStyle="solid">
            {!showWelcomeVideo ? 'Welcome video completed' : 'Welcome to MindFlow & Onboarding'}
          </Text>
        </Box>
      ) : (
        <Box
          borderRadius={20}
          textAlign="center"
          shadow="md"
          mb={14}
          bg="green.50"
          borderWidth={1}
          borderColor="green.200"
          py={7}
          px={4}
        >
          <Text fontSize="xl" color="green.700" fontWeight="bold">
            Welcome video completed
          </Text>
        </Box>
      )}

      {renderTutorialVideo ? (
        <>
          <Box d="flex" flexDirection={{ lg: 'row', md: 'column' }}>
            <Icon name="ready-set-go" fontSize="6xl" />

            <Text as="p" fontWeight="bold" color="gray.600" ml={{ lg: 8, md: 0 }} mr={{ lg: 2, md: 0 }}>
              Now it’s your turn! Watch the video to understand how you use the platform. Learn about the different
              techniques, the components of the platform, and how the system tracks your progress and improvements.
            </Text>
          </Box>

          <Divider borderTopColor="teal.500" mt={4} mb={10} borderTopWidth={2} />

          <Box borderRadius={20} overflow="hidden" textAlign="center" shadow="md">
            <VideoPlayer
              id="tutorial"
              videoUrl="https://cdn.jwplayer.com/videos/3nQyI6Nj.mp4"
              onFinish={onTutorialVideoFinish}
            />
            <Text fontSize="xl" bg="white" py={7} borderWidth={1} borderStyle="solid">
              {!showTutorialVideo ? 'Tutorial video completed' : 'How does MindFlow work?'}
            </Text>
          </Box>
        </>
      ) : null}
    </Box>
  );
};
