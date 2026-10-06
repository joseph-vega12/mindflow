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
// (React removeChild NotFoundError). Hide by collapsing layout instead.
const useStickyMount = (shouldShow: boolean) => {
  const [mounted, setMounted] = useState(shouldShow);

  useEffect(() => {
    if (shouldShow) {
      setMounted(true);
    }
  }, [shouldShow]);

  return mounted;
};

const CompletedBanner: FC<{ label: string; mb?: number | string }> = ({ label, mb }) => (
  <Box
    borderRadius={20}
    textAlign="center"
    shadow="md"
    mb={mb}
    bg="green.50"
    borderWidth={1}
    borderColor="green.200"
    py={7}
    px={4}
  >
    <Text fontSize="xl" color="green.700" fontWeight="bold">
      {label}
    </Text>
  </Box>
);

export const TutorialInstructions: FC<Props> = ({
  onWelcomeVideoFinish,
  onTutorialVideoFinish,
  showWelcomeVideo,
  showTutorialVideo
}) => {
  const { user } = useAuthContext();
  const welcomeMounted = useStickyMount(showWelcomeVideo);
  const tutorialMounted = useStickyMount(showTutorialVideo);

  // When welcome completes, bring the next video into view without a full page reload.
  useEffect(() => {
    if (!showWelcomeVideo && showTutorialVideo) {
      const el = document.getElementById('tutorial-section');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showWelcomeVideo, showTutorialVideo]);

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

      {welcomeMounted && (
        <Box
          borderRadius={20}
          overflow="hidden"
          textAlign="center"
          shadow="md"
          mb={showWelcomeVideo ? 14 : 0}
          maxH={showWelcomeVideo ? 'none' : '0px'}
          opacity={showWelcomeVideo ? 1 : 0}
          pointerEvents={showWelcomeVideo ? 'auto' : 'none'}
          aria-hidden={!showWelcomeVideo}
        >
          <VideoPlayer
            id="welcome"
            videoUrl="https://cdn.jwplayer.com/videos/0kIYNF2I.mp4"
            onFinish={onWelcomeVideoFinish}
            isActive={showWelcomeVideo}
          />
          <Text fontSize="xl" bg="white" py={7} borderWidth={1} borderStyle="solid">
            Welcome to MindFlow & Onboarding
          </Text>
        </Box>
      )}

      {((welcomeMounted && !showWelcomeVideo) || !welcomeMounted) && (
        <CompletedBanner label="Welcome video completed" mb={14} />
      )}

      {(tutorialMounted || showTutorialVideo) && (
        <Box id="tutorial-section">
          <Box
            display="flex"
            flexDirection={{ lg: 'row', md: 'column' }}
            maxH={showTutorialVideo ? 'none' : '0px'}
            opacity={showTutorialVideo ? 1 : 0}
            overflow="hidden"
            pointerEvents={showTutorialVideo ? 'auto' : 'none'}
            aria-hidden={!showTutorialVideo}
            mb={showTutorialVideo ? 0 : 0}
          >
            <Icon name="ready-set-go" fontSize="6xl" />

            <Text as="p" fontWeight="bold" color="gray.600" ml={{ lg: 8, md: 0 }} mr={{ lg: 2, md: 0 }}>
              Now it’s your turn! Watch the video to understand how you use the platform. Learn about the different
              techniques, the components of the platform, and how the system tracks your progress and improvements.
            </Text>
          </Box>

          <Box
            maxH={showTutorialVideo ? 'none' : '0px'}
            opacity={showTutorialVideo ? 1 : 0}
            overflow="hidden"
            pointerEvents={showTutorialVideo ? 'auto' : 'none'}
            aria-hidden={!showTutorialVideo}
          >
            <Divider borderTopColor="teal.500" mt={4} mb={10} borderTopWidth={2} />
          </Box>

          <Box
            borderRadius={20}
            overflow="hidden"
            textAlign="center"
            shadow="md"
            maxH={showTutorialVideo ? 'none' : '0px'}
            opacity={showTutorialVideo ? 1 : 0}
            pointerEvents={showTutorialVideo ? 'auto' : 'none'}
            aria-hidden={!showTutorialVideo}
          >
            <VideoPlayer
              id="tutorial"
              videoUrl="https://cdn.jwplayer.com/videos/3nQyI6Nj.mp4"
              onFinish={onTutorialVideoFinish}
              isActive={showTutorialVideo}
            />
            <Text fontSize="xl" bg="white" py={7} borderWidth={1} borderStyle="solid">
              How does MindFlow work?
            </Text>
          </Box>

          {tutorialMounted && !showTutorialVideo && <CompletedBanner label="Tutorial video completed" />}
        </Box>
      )}
    </Box>
  );
};
