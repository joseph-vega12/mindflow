import React, { FC } from 'react';

import {
  Box,
  Flex,
  Heading,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { Button } from '@chakra-ui/react';
import { Icon, Modal, VideoPlayer } from 'components/common';

interface Props {}
export const PracticeExplanation: FC<Props> = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box>
      <Modal isOpen={isOpen} onClose={onClose} title="Video Instruction">
        <Box>
          <Box mb="md">
            <Heading textStyle="title-with-border-bottom" fontSize="md" my="md">
              One Minute Practice
            </Heading>
            <VideoPlayer videoUrl="https://cdn.jwplayer.com/videos/LxbMK8sh.mp4" />
          </Box>

          <Box mb="md">
            <Heading textStyle="title-with-border-bottom" fontSize="md" my="md">
              One Minute 20 Second Practice
            </Heading>
            <VideoPlayer videoUrl="https://cdn.jwplayer.com/videos/PSinJUQ6.mp4" />
          </Box>

          <Box mb="md">
            <Heading textStyle="title-with-border-bottom" fontSize="md" my="md">
              Hopping Practice
            </Heading>
            <VideoPlayer videoUrl="https://cdn.jwplayer.com/videos/G0szGxhZ.mp4" />
          </Box>
        </Box>
      </Modal>

      <Popover placement="left-start">
        <PopoverTrigger>
          <Flex alignItems="center" color="blue.500" cursor="pointer" mr="sm">
            <Icon name="info-outline" size="sm" mr="xs" />
            <Text>Help</Text>
          </Flex>
        </PopoverTrigger>
        <PopoverContent bg="blue.500" color="white" minWidth="450px" px="md">
          <PopoverCloseButton />
          <PopoverHeader border="none">
            <Text display="inline-block" fontSize="lg" borderBottom="sm" borderColor="white">
              Instructions
            </Text>
          </PopoverHeader>
          <PopoverBody>
            <Box width="100%" mb="md">
              <Text fontSize="sm" fontWeight="bold">
                You have two timing options and two style options for Practice.
                <br />
                1 minute intervals stay constant and each time you read you’ll read further than the
                time before. You set up how many rounds and how many lines further you’ll read.
                <br />
                1 minute and 20 seconds decreases each round, and you need to stay the same or read
                further, even though you have less time;.
                <br />
                Regular speed reading involves your finger or you can put up a sheet of paper to
                read down the page each line. You’re reading across the line smoothly. <br />
                The “hopping’ or “bopping’ you set up the number of columns and you ‘chunk’ the
                words rather than reading words in succession.
                <br />
                Once you have saved your settings, press the ’Start’ button on the application's
                toolbar to start practicing. Follow the instructions on the page to move through
                each cycle.
                <br />
              </Text>
            </Box>

            <Box textAlign="right" my="sm">
              <Button colorScheme="green" size="sm" onClick={onOpen}>
                Check instructional videos
              </Button>
            </Box>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Box>
  );
};
