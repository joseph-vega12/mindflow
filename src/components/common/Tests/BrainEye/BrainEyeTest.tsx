import { Box, Button, Text as ChakraText, Grid, Progress } from '@chakra-ui/react';
import { useInterval } from 'lib/customHooks/useInterval';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { BrainEyeTestConfig } from './index';

interface Props {
  testConfig: BrainEyeTestConfig;
  text: string;

  onFinishTest: () => void;
  onGiveUp: () => void;
}

export const BrainEyeTest: FC<Props> = ({ text, onFinishTest, onGiveUp, testConfig }) => {
  const { wordSpeed, wordsNumber } = testConfig;
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);

  const sentences = useMemo(() => {
    const wordsArray = text.split(' ');

    const sentences = [];
    do {
      sentences.push(wordsArray.splice(0, wordsNumber).join(' '));
    } while (wordsArray.length);

    return sentences;
  }, [text, wordsNumber]);

  const interval = (60 * 1000) / wordSpeed;

  const { stop } = useInterval(
    () => {
      setCurrentSentenceIndex((prevState) => prevState + 1);
    },
    { interval, started: true }
  );

  useEffect(() => {
    if (currentSentenceIndex === sentences.length) {
      stop();
      onFinishTest();
    }
  }, [currentSentenceIndex]);

  const handleGiveUp = () => {
    stop();
    onGiveUp();
  };

  return (
    <Grid templateColumns="3fr 6fr 3fr" alignItems="center">
      <Box></Box>
      <Box textAlign="center" w="1200px">
        <Button colorScheme="gray" onClick={handleGiveUp} mx="auto">
          Cancel
        </Button>
        <Box my={4}>
          <ChakraText {...testConfig}>{sentences[currentSentenceIndex] ?? ''}</ChakraText>
        </Box>
        <Box my={6}>
          <Progress min={0} max={sentences.length} value={currentSentenceIndex} colorScheme="teal" my={4} mx="auto" />
        </Box>
      </Box>
    </Grid>
  );
};
