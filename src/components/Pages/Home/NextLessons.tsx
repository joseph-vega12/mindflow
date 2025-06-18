import React, { FC } from 'react';

import { Badge as ChakraBadge, Flex as ChakraFlex, Text as ChakraText, SimpleGrid } from '@chakra-ui/react';
import { filter } from 'lodash';
import { useNavigate } from 'react-router-dom';

import { JWPlayerPlaylist } from 'types';

import { BaseCard, VideoCard } from 'components/common';

interface NextLessonsProps {
  watchedVideosIds: string[];
  playlists: JWPlayerPlaylist[];
}

export const NextLessons: FC<NextLessonsProps> = ({ playlists, watchedVideosIds = [] }) => {
  const navigate = useNavigate();

  return (
    <BaseCard width="100%" title="Speed Reading and Mindset Videos" height="100%">
      <SimpleGrid width="100%" marginTop="md" columns={2} gap="xl">
        {playlists?.map((playlist) => {
          const nextVideo = playlist.playlist.find((video) => !watchedVideosIds.includes(video.mediaid));

          const watchedVideos = filter(playlist.playlist, (video) => watchedVideosIds.includes(video.mediaid));

          return (
            <ChakraFlex flexDirection="column" key={playlist.feedid}>
              <ChakraFlex marginBottom="md">
                <ChakraText marginRight="md" fontSize="sm" fontWeight="bold" as="span">
                  {playlist.title}
                </ChakraText>
                <ChakraBadge
                  display="flex"
                  paddingX="sm"
                  alignItems="center"
                  borderRadius="xs"
                  colorScheme="red"
                  variant="solid"
                >
                  {watchedVideos.length || 0}/{playlist.playlist.length || 0}
                </ChakraBadge>
              </ChakraFlex>
              {nextVideo ? (
                <VideoCard
                  video={nextVideo}
                  height="auto"
                  cursor="pointer"
                  onClick={() => navigate(`/training/${nextVideo.mediaid}`)}
                />
              ) : (
                <ChakraFlex
                  width="100%"
                  height="100%"
                  padding="lg"
                  border="1px dashed"
                  color="gray.600"
                  background="gray.100"
                  borderColor="gray.500"
                  borderRadius="md"
                  fontSize="sm"
                  justifyContent="center"
                  alignItems="center"
                  textAlign="center"
                >
                  No next videos for this playlist.
                </ChakraFlex>
              )}
            </ChakraFlex>
          );
        })}
      </SimpleGrid>
    </BaseCard>
  );
};
