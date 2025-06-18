import { Box, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import React from 'react';

import { Icon } from 'components/common';

export const VideosList = ({ videos, watchedVideos, currentVideo, refetch }) => {
  const watched = {};

  const navigate = useNavigate();

  watchedVideos?.map((vid) => {
    refetch();
    return Object.assign(watched, vid);
  });

  return videos.map(({ mediaid, time, title }) => {
    const isWatched = watched[mediaid];
    const isCurrentVideo = currentVideo === mediaid;
    return (
      <Flex direction="column" onClick={() => navigate(`/training/${mediaid}`)} key={mediaid}>
        <Box
          d="flex"
          alignItems="center"
          py={3}
          pr={4}
          _hover={{ bg: 'blue.100' }}
          borderBottomWidth={1}
          borderBottomColor="gray.500"
          bg={isCurrentVideo ? 'gray.100' : ''}
          borderBottomStyle="solid"
          cursor="pointer"
        >
          <Icon ml={2} name="play-circle" size="lg" color={isWatched ? 'green.500' : 'blue.500'} />
          <Text
            flexGrow={1}
            mb={0}
            ml={6}
            pl={1}
            fontSize={['sm', 'md']}
            color={isCurrentVideo ? 'gray.500' : 'gray.600'}
          >
            {title}
          </Text>
          <Text mb={0} ml={5} fontSize={['sm', 'md']} color="gray.600">
            {time}
          </Text>
        </Box>
      </Flex>
    );
  });
};
