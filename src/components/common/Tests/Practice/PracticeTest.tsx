import { Badge, Box, Button, Flex, Grid, Heading, Spinner, Text } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { EssayDocumentWithId } from 'types';
import { PercentageProgress } from 'components/common';
import { PracticeTestConfig } from './index';
import { PracticeTestText } from './PracticeTestText';

import { useCountdown, UseCountdown } from 'lib/customHooks';

interface Props {
  isLoading: boolean;

  testConfig: PracticeTestConfig;
  essay?: EssayDocumentWithId;

  countdownState: UseCountdown['state'];
  countdownActions: UseCountdown['actions'];

  onFinishTest: () => void;
  onGiveUp: () => void;
}

export const PracticeTest: FC<Props> = ({
  isLoading,
  essay,
  onFinishTest,
  onGiveUp,
  testConfig,
  countdownActions,
  countdownState
}) => {
  const [beforeTestCountdownVal, setBeforeTestCountdownVal] = useState<number>(4);
  const [round, setRound] = useState<number>(1);
  const [totalLines, setTotalLines] = useState<number>(0);
  const [willRedo, setWillRedo] = useState(false);

  const [currentUserLine, setCurrentUserLine] = useState<number>(0);
  const [currentTargetLine, setCurrentTargetLine] = useState<number>(0);
  const [previousTargetLine, setPreviousTargetLine] = useState<number>(0);

  const { state: beforeTestCountdownState, actions: beforeTestCountdownActions } = useCountdown({
    countdownTime: 2100,
    interval: 700,
    started: true
  });

  const isOneTwenty = testConfig.practiceType === 'oneTwenty';
  const isRegular = testConfig.practiceType === 'regular';
  const isFirstRound = round === 1;

  const canSelectLine = useMemo(() => countdownState.time === 0 || willRedo, [countdownState.time, willRedo]);

  const onRedo = (selectedTargetLine?: number) => {
    countdownActions.pause();

    setWillRedo(true);

    if (!!currentTargetLine || !!selectedTargetLine) {
      setPreviousTargetLine(selectedTargetLine);
      setCurrentUserLine(0);

      handleCountdownReset(true);

      setBeforeTestCountdownVal(4);
      setWillRedo(false);

      beforeTestCountdownActions.reset();
      beforeTestCountdownActions.start();
    }
  };

  const onSelectLine = ({ current }: { current: number }) => {
    if (willRedo) {
      setCurrentUserLine(current);

      if (totalLines - current < testConfig.targetLines) {
        setCurrentUserLine(totalLines - testConfig.targetLines - 2);
        return setCurrentTargetLine(totalLines - testConfig.targetLines);
      }

      setCurrentTargetLine(current + testConfig.targetLines);

      return onRedo(current);
    }

    if ((!isFirstRound || !!previousTargetLine) && current < previousTargetLine) {
      toast.info('You were not able to meet the target line, you must redo this round');
      return onRedo();
    }

    if (round === testConfig.numberOfRounds) {
      return onFinishTest();
    }

    const newCurrentLine = current;
    let newTargetLine = current + testConfig.targetLines;

    if (newTargetLine > totalLines) {
      const remainingLines = newTargetLine - totalLines;
      newTargetLine = remainingLines <= testConfig.targetLines ? remainingLines : testConfig.targetLines;
    }

    setCurrentUserLine(newCurrentLine);
    setCurrentTargetLine(newTargetLine);
  };

  const handleCountdownReset = (redo: boolean) => {
    let newCountdownTime = countdownState.countdownTime;
    if (isOneTwenty && !redo) {
      const fiveSeconds = 5 * 1000;
      newCountdownTime = newCountdownTime - fiveSeconds;
    }

    countdownActions.reset(newCountdownTime);
  };

  const onNextRound = () => {
    if (!currentUserLine) {
      return toast.error('You must select the line where you stopped!');
    }

    if (isOneTwenty) {
      setCurrentTargetLine(currentUserLine);
      setPreviousTargetLine(currentUserLine);
    }

    if (isRegular) {
      setPreviousTargetLine(currentTargetLine);
    }

    setCurrentUserLine(0);

    setRound((prevState) => prevState + 1);

    handleCountdownReset(false);

    setBeforeTestCountdownVal(4);
    beforeTestCountdownActions.reset();
    beforeTestCountdownActions.start();
  };

  useEffect(() => {
    if (beforeTestCountdownState.time) {
      setBeforeTestCountdownVal((prevState) => prevState - 1);
    }

    if (!beforeTestCountdownState.time) {
      countdownActions.start();
    }
  }, [beforeTestCountdownState.time]);

  const onFinishRound = () => {
    if (round === testConfig.numberOfRounds) {
      return onFinishTest();
    }

    onSelectLine({ current: totalLines });

    setRound((prevState) => prevState + 1);

    handleCountdownReset(false);

    setBeforeTestCountdownVal(4);
    beforeTestCountdownActions.reset();
    beforeTestCountdownActions.start();
  };

  if (isLoading) {
    return (
      <Box display="flex" minH="50vh" justifyContent="center" alignItems="center">
        <Spinner
          // @ts-ignore
          boxSize="100px"
          thickness="4px"
          speed="0.8s"
          emptyColor="gray.100"
          color="blue.800"
        />
      </Box>
    );
  }

  if (beforeTestCountdownState.time) {
    return (
      <Box display="flex" minH="50vh" justifyContent="center" alignItems="center">
        <Text fontSize="6xl">{beforeTestCountdownVal}</Text>
      </Box>
    );
  }

  return (
    <Grid templateColumns="9fr 3fr" columnGap="lg">
      <Box my={4}>
        <Box display="flex" alignItems="baseline">
          <Heading textStyle="title-with-border-bottom" fontSize="md" px={2} mb={3}>
            {essay?.name}
          </Heading>
          <Box mx={3}>
            <Badge colorScheme="gray" fontSize="sm" width="100px" variant="solid" textAlign="center">
              Round {round}/{testConfig.numberOfRounds}
            </Badge>
          </Box>
        </Box>
        <Box>
          <PracticeTestText
            essay={essay}
            testConfig={testConfig}
            canSelectLine={canSelectLine}
            onSelectLine={onSelectLine}
            onTotalLinesCount={setTotalLines}
            currentUserLine={currentUserLine}
            currentTargetLine={currentTargetLine}
          />

          <Flex justifyContent="center" mt={5}>
            <Button size="sm" colorScheme="blue" onClick={onFinishRound}>
              I've finished this round
            </Button>
          </Flex>
        </Box>
      </Box>

      <Box py={4}>
        <Box position="sticky" top="50%" transform="translateY(-50%)" fontWeight="bold">
          {canSelectLine && (
            <Box my={2}>
              <Text>Please select the last line that you have read!</Text>

              <Box my={3}>
                <Text>You've read:</Text>
                <PercentageProgress value={currentUserLine} min={0} max={totalLines} />
              </Box>
            </Box>
          )}

          <Box display="flex" flexDirection={{ lg: 'row', md: 'column' }} justifyContent="space-evenly">
            <Button size="sm" colorScheme="red" onClick={onGiveUp}>
              Quit
            </Button>

            <Button
              marginY={{ lg: 'none', md: 'sm' }}
              marginX={{ lg: 'sm', md: 'none' }}
              size="sm"
              onClick={() => onRedo()}
            >
              Redo
            </Button>

            <Button size="sm" colorScheme="blue" isDisabled={!!countdownState.time} onClick={onNextRound}>
              Next
            </Button>
          </Box>
        </Box>
      </Box>
    </Grid>
  );
};
