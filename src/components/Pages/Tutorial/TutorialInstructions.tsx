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

// Once a JW player has mounted, keep it mounted for this page session.
// Unmounting after "complete" races JW's DOM teardown and blanks the page
// (React removeChild NotFoundError).
const useStickyMount = (shouldShow: boolean) => {
  const [mounted, setMounted] = useState(shouldShow);

  useEffect(() => {
    if (shouldShow) {
      setMounted(true);
    }
  }, [shouldShow]);

  return mounted;
};

export const TutorialInstructions: FC<Props> = ({
  onWelcomeVideoFinish,
  onTutorialVideoFinish,
  showWelcomeVideo,
  showTutorialVideo
}) => {
  const { user } = useAuthContext();
  const welcomeMounted = useStickyMount(showWelcomeVideo);
  const tutorialMounted = useStickyMount(showTutorialVideo);

  return (
    <Box d="flex" flexDir="column">
      <Flex flexDirection={{ lg: 'row', md: 'column' }} alignItems="center">
        <Icon name="welcome" fontSize="6xl" />
        <Text as="p" fontWeight="bold" color="gray.600" ml={{ lg: 8, md: 0 }} mr={{ lg: 2, md: 0 }}>
          Welcome to MindFlow, {user?.userDetails?.firstName}! <br />
          Follow the next steps to learn how the platform works and to begin your speed reading training.
        </Text>
      </Flex>

      <Divider borderTopColor="teal.500" mt={4} mb={10} borderTopWidth={2} />

      {welcomeMounted ? (
        <Box borderRadius={20} overflow="hidden" textAlign="center" shadow="md" mb={14}>
          <Box display={showWelcomeVideo ? 'block' : 'none'}>
            <VideoPlayer
              id="welcome"
              videoUrl="https://cdn.jwplayer.com/videos/0kIYNF2I.mp4"
              onFinish={onWelcomeVideoFinish}
            />
          </Box>
          <Text
            fontSize="xl"
            bg={showWelcomeVideo ? 'white' : 'green.50'}
            color={showWelcomeVideo ? undefined : 'green.700'}
            fontWeight={showWelcomeVideo ? 'normal' : 'bold'}
            py={7}
            borderWidth={1}
            borderStyle="solid"
            borderColor={showWelcomeVideo ? undefined : 'green.200'}
          >
            {showWelcomeVideo ? 'Welcome to MindFlow & Onboarding' : 'Welcome video completed'}
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

      {tutorialMounted ? (
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
            <Box display={showTutorialVideo ? 'block' : 'none'}>
              <VideoPlayer
                id="tutorial"
                videoUrl="https://cdn.jwplayer.com/videos/3nQyI6Nj.mp4"
                onFinish={onTutorialVideoFinish}
              />
            </Box>
            <Text
              fontSize="xl"
              bg={showTutorialVideo ? 'white' : 'green.50'}
              color={showTutorialVideo ? undefined : 'green.700'}
              fontWeight={showTutorialVideo ? 'normal' : 'bold'}
              py={7}
              borderWidth={1}
              borderStyle="solid"
              borderColor={showTutorialVideo ? undefined : 'green.200'}
            >
              {showTutorialVideo ? 'How does MindFlow work?' : 'Tutorial video completed'}
            </Text>
          </Box>
        </>
      ) : null}
    </Box>
  );
};
