import React, { FC } from 'react';

import {
  Flex as ChakraFlex,
  FlexProps as ChakraFlexProps,
  Image as ChakraImage,
  Text as ChakraText
} from '@chakra-ui/react';

import { JWPlayerVideo } from 'types';

interface VideoCardProps extends ChakraFlexProps {
  video: JWPlayerVideo;
}

export const VideoCard: FC<VideoCardProps> = ({ video, ...rest }) => {
  const { title, image } = video;

  return (
    <ChakraFlex height="200px" flexDirection="column" boxShadow="md" borderRadius="sm" {...rest}>
      <ChakraFlex height="150px">
        <ChakraImage
          width="100%"
          height="100%"
          objectFit="cover"
          borderTopRightRadius="sm"
          borderTopLeftRadius="sm"
          src={image}
          alt={title}
        />
      </ChakraFlex>
      <ChakraFlex padding="md" justifyContent="center" alignItems="center">
        <ChakraText isTruncated as="span" fontSize="sm">
          {title}
        </ChakraText>
      </ChakraFlex>
    </ChakraFlex>
  );
};
