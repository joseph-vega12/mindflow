import { Box, Text } from '@chakra-ui/react';
import React, { FC } from 'react';

import { BoundVideo } from 'types';

interface Props {
  video: BoundVideo;
}

export const Attachments: FC<Props> = ({ video }) => {
  if (!video?.attachments?.length) {
    return (
      <Box>
        <Text color="gray.600" fontWeight="400" fontSize={['sm', 'md']}>
          No attachments
        </Text>
      </Box>
    );
  }

  return (
    <>
      {video.attachments.map(({ name, link }) => (
        <Text key={link}>
          <a key={`${name}_${link}`} href={link} target="__blank">
            {name}
          </a>
        </Text>
      ))}
    </>
  );
};
