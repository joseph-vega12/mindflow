import React, { FC, useContext } from 'react';

import {
  Divider as ChakraDivider,
  Flex as ChakraFlex,
  FormControl as ChakraFormControl,
  FormLabel as ChakraFormLabel,
  Heading as ChakraHeading,
  Modal as ChakraModal,
  ModalBody as ChakraModalBody,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalHeader as ChakraModalHeader,
  ModalOverlay as ChakraModalOverlay,
  Progress as ChakraProgress,
  SimpleGrid as ChakraSimpleGrid,
  Switch as ChakraSwitch,
  Text as ChakraText
} from '@chakra-ui/react';

import { BineuralBeatsContext } from 'lib/providers';
import { secondsParser } from 'lib/utils';

import { Icon, Slider, Table } from 'components/common';

interface BineuralBeatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMediaSelected: (mediaid: string) => void;
}

export const BineuralBeatsModal: FC<BineuralBeatsModalProps> = ({
  isOpen,
  onClose,
  onMediaSelected
}) => {
  const {
    playlist,
    audio,
    volume,
    duration,
    setVolume,
    currentAudio,
    isPlaying,
    isPlaylistLoading,
    onToggleAudio
  } = useContext(BineuralBeatsContext);

  const audios = playlist?.playlist ?? [];

  const tableColumns = [
    {
      Header: 'Title',
      width: '30%',
      accessor: (row: any) => {
        const isCurrentAudio = row.mediaid === currentAudio?.mediaid;

        const handleMediaSelect = () => {
          if (isCurrentAudio) {
            return onToggleAudio();
          }

          return onMediaSelected(row.mediaid);
        };

        return (
          <ChakraFlex>
            <Icon
              mr={2}
              onClick={handleMediaSelect}
              name={isCurrentAudio && isPlaying ? 'pause' : 'play_circle_outline'}
            />
            <ChakraText isTruncated>{row.title}</ChakraText>
          </ChakraFlex>
        );
      }
    },
    {
      Header: 'Description',
      width: '40%',
      accessor: (row: any) => {
        return (
          <ChakraText whiteSpace="break-spaces" noOfLines={2}>
            {row.description}
          </ChakraText>
        );
      }
    },
    {
      Header: 'Duration',
      width: '30%',
      accessor: 'duration'
    }
  ];

  const prepareTableData = () => {
    if (isPlaylistLoading && !audios?.length) {
      return [];
    }

    return audios.map(({ title, description, duration, mediaid }) => ({
      title,
      mediaid,
      description,
      duration: secondsParser(duration)
    }));
  };

  const data = prepareTableData();

  return (
    <ChakraModal blockScrollOnMount={false} isOpen={isOpen} isCentered onClose={onClose} size="5xl">
      <ChakraModalOverlay />
      <ChakraModalContent paddingX="xl" borderRadius="lg">
        <ChakraModalHeader paddingTop="xl">
          <ChakraFlex marginBottom="lg" justifyContent="space-between" alignItems="center">
            <ChakraFlex display="flex" alignItems="center">
              <Icon name="library-music" size="sm" mr={3} color="blue.500" />
              <ChakraHeading fontSize="2xl" color="blue.500">
                Resonant Mindful Audio
              </ChakraHeading>
            </ChakraFlex>
            <Icon name="small-close" cursor="pointer" color="gray.500" onClick={onClose} />
          </ChakraFlex>
          <ChakraDivider borderColor="gray.500" />
        </ChakraModalHeader>
        <ChakraModalBody>
          <ChakraSimpleGrid columns={2} mb={4}>
            <ChakraFlex>
              <ChakraHeading fontSize="xl" textStyle="title-with-border-bottom">
                Track List
              </ChakraHeading>
            </ChakraFlex>
            <ChakraFormControl display="flex" alignItems="center">
              <ChakraFormLabel htmlFor="auto-play" mb="0" fontSize="sm" ml="auto" mr={2}>
                Autoplay
              </ChakraFormLabel>
              <ChakraSwitch id="auto-play" size="sm" />
            </ChakraFormControl>
          </ChakraSimpleGrid>
          <Table data={data} columns={tableColumns} />
        </ChakraModalBody>
        <ChakraModalFooter
          gridGap="md"
          paddingTop="xl"
          paddingBottom="xxl"
          justifyContent="space-between"
        >
          <ChakraFlex width="100%" flexDirection="column">
            <ChakraText color="gray.600" fontWeight="bold" fontSize="md" mb={2}>
              {currentAudio?.title ?? 'No audio being played'}
            </ChakraText>
            <ChakraFlex alignItems="center">
              <ChakraProgress
                min={0}
                width="80%"
                size="sm"
                color="red"
                borderRadius="md"
                max={audio?.duration}
                value={audio?.currentTime}
              />
              <ChakraText width="20%" pl={2} fontSize="sm" fontWeight="light" m={0}>
                {secondsParser(duration)}
              </ChakraText>
            </ChakraFlex>
          </ChakraFlex>
          <ChakraFlex width="100%" flexDirection="column">
            <ChakraText color="gray.600" fontWeight="bold" fontSize="md" mb={2}>
              Volume
            </ChakraText>
            <Slider
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              step={5}
              onChange={(newVol) => setVolume(newVol / 100)}
            />
          </ChakraFlex>
        </ChakraModalFooter>
      </ChakraModalContent>
    </ChakraModal>
  );
};
