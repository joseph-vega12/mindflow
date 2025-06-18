import { Badge, Box, Divider, Flex, Heading, Text } from '@chakra-ui/react';
import { BoundVideo } from '../../../types';
import React, { FC } from 'react';

import { Attachments } from './Attachments';

interface Props {
  video: BoundVideo;
}

export const Meta: FC<Props> = ({ video }) => {
  return (
    <>
      <Heading fontSize={['xl', '2xl']} marginBottom="sm" marginLeft="xs" color="gray.600">
        {video.title}
      </Heading>
      <Flex alignItems="center" mb={19} marginLeft="sm">
        <Text mb={0} mr={5} lineHeight={1} color="gray.500" fontWeight="700" fontSize={['sm', 'md']}>
          {video.time}
        </Text>
        <Badge
          px={3}
          mr={11}
          borderRadius={10}
          fontSize={['sm', 'md']}
          bg="blue.500"
          color="white"
          textTransform="none"
        >
          Speed Reading
        </Badge>
      </Flex>
      <Divider borderColor="#999" />
      <Box ml={3}>
        <Text marginTop={[10, 19]} color="gray.500" m={0} fontWeight="bold" fontSize="sm">
          Description:
        </Text>
        <Text color="gray.600" fontWeight="400" fontSize={['sm', 'md']}>
          {video.description || 'No description.'}
        </Text>
        <Text marginTop={[10, 19]} color="gray.500" m={0} fontWeight="bold" fontSize="sm">
          Attachments:
        </Text>
        <Attachments video={video} />
      </Box>
    </>
  );
};

export default Meta;
