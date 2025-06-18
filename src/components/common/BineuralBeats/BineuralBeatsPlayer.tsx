import React, { FC, useContext } from 'react';

import { Flex as ChakraFlex, Spinner as ChakraSpinner, Text as ChakraText, useDisclosure } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { BineuralBeatsContext } from 'lib/providers';

import { Icon } from 'components/common';

import { BineuralBeatsModal } from './BineuralBeatsModal';

export const BineuralBeatsPlayer: FC = () => {
  const {
    onSelectedAudio,
    onToggleAudio,
    currentAudio,
    isPlaying,
    audioIsLoading,
    onNextAudio,
    onPreviousAudio
  } = useContext(BineuralBeatsContext);

  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <ChakraFlex width="100%" gridGap="sm" justifyContent="space-between" alignItems="center">
        <ChakraFlex width="fit-content">
          <Icon name="library-music" cursor="pointer" onClick={onOpen} />
        </ChakraFlex>
        <ChakraFlex minWidth="200px" overflow="hidden" position="relative">
          <motion.div
            animate={{
              translateX: ['30%', '0%', '-100%'],
              opacity: [0, 1, 0.2]
            }}
            transition={{
              duration: 8,
              repeat: Infinity
            }}
          >
            <ChakraText isTruncated>{currentAudio?.title}</ChakraText>
          </motion.div>
        </ChakraFlex>
        <ChakraFlex width="fit-content">
          <Icon name="previous-track" color="gray.300" onClick={onPreviousAudio} cursor="pointer" />
          {audioIsLoading ? (
            <ChakraSpinner boxSize="15px" color="gray.300" />
          ) : (
            <Icon
              color="gray.300"
              cursor="pointer"
              name={isPlaying ? 'pause' : 'play_circle_outline'}
              onClick={onToggleAudio}
            />
          )}
          <Icon name="next-track" color="gray.300" cursor="pointer" onClick={onNextAudio} />
        </ChakraFlex>
      </ChakraFlex>
      <BineuralBeatsModal isOpen={isOpen} onClose={onClose} onMediaSelected={onSelectedAudio} />
    </>
  );
};
