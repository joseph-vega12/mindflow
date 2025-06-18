import React, { FC, useState } from 'react';

import { Flex as ChakraFlex, Image as ChakraImage } from '@chakra-ui/react';
import { Icon } from './Icon';

export interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery: FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleImageChange = (value: number) => {
    if (value > images.length - 1) setSelectedImageIndex(0);
    else if (value < 0) setSelectedImageIndex(images.length - 1);
    else setSelectedImageIndex(value);
  };

  return (
    <ChakraFlex width="100%" userSelect="none" flexDirection="column" position="relative">
      {images.length && (
        <ChakraFlex width="100%" height="100%" position="relative">
          <ChakraImage
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            alignItems="center"
            borderRadius="sm"
            objectFit="cover"
            src={images[selectedImageIndex]}
          />
          <ChakraFlex
            top="50%"
            transform="translateY(-50%)"
            left="-15px"
            padding="sm"
            opacity="0.6"
            width="fit-content"
            background="gray.600"
            borderRadius="full"
            position="absolute"
            cursor="pointer"
            transitionDuration="0.3s"
            _hover={{
              opacity: '0.8'
            }}
            onClick={() => handleImageChange(selectedImageIndex - 1)}
          >
            <Icon size="sm" name="triangle-left" />
          </ChakraFlex>
          <ChakraFlex
            top="50%"
            transform="translateY(-50%)"
            right="-15px"
            padding="sm"
            opacity="0.6"
            width="fit-content"
            background="gray.600"
            borderRadius="full"
            position="absolute"
            cursor="pointer"
            transitionDuration="0.3s"
            _hover={{
              opacity: '0.8'
            }}
            onClick={() => handleImageChange(selectedImageIndex + 1)}
          >
            <Icon size="sm" name="triangle-right" />
          </ChakraFlex>
        </ChakraFlex>
      )}

      <ChakraFlex width="100%" marginTop="md" justifyContent="center" alignItems="center">
        {images.map((image, index) => (
          <ChakraFlex
            width={index === selectedImageIndex ? '18px' : '10px'}
            height={index === selectedImageIndex ? '18px' : '10px'}
            cursor="pointer"
            borderRadius="full"
            background="gray.300"
            transitionDuration="0.3s"
            key={index}
            _hover={{
              background: 'gray.500'
            }}
            _notFirst={{
              marginX: 'sm'
            }}
            _notLast={{
              marginX: 'sm'
            }}
            onClick={() => setSelectedImageIndex(index)}
          />
        ))}
      </ChakraFlex>
    </ChakraFlex>
  );
};
