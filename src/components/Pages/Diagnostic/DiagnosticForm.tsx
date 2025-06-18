import { assign } from 'lodash';
import { Box, Button, Flex, FormLabel, Progress, Radio, RadioGroup } from '@chakra-ui/react';
import React, { FC, useEffect, useMemo, useState } from 'react';

import { capitalize } from 'lib/utils';
import { useTimer } from 'lib/customHooks';

import { DiagnosticAnswerOption, DiagnosticDocumentWithId } from 'types';

import { Icon } from 'components/common';

interface Props {
  time: number;
  diagnostic?: DiagnosticDocumentWithId;
  onFinish: (args: { answers: DiagnosticAnswerOption[]; answersTime: number[] }) => void;
  onTimeIsOver: (args: { answers: DiagnosticAnswerOption[]; answersTime: number[] }) => void;
  onSaveQuestion: (args: { answers: DiagnosticAnswerOption[]; answersTime: number[]; finished: boolean }) => void;
}

export const DiagnosticForm: FC<Props> = ({ time, diagnostic, onTimeIsOver, onFinish, onSaveQuestion }) => {
  const [questionTime, { restart: restartQuestionTimer, stop: stopQuestionTimer }] = useTimer({
    started: true
  });

  // Migrate this to react-hook-form
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<DiagnosticAnswerOption[]>(
    Array(diagnostic?.questions.length ?? 0).fill('')
  );
  const [answersTime, setAnswersTime] = useState<number[]>(Array(diagnostic?.questions.length ?? 0).fill(0));
  const currentQuestion = useMemo(() => {
    return diagnostic?.questions[currentQuestionIndex];
  }, [diagnostic, currentQuestionIndex]);

  // @ts-ignore
  const currentQuestionOptions = useMemo<[DiagnosticAnswerOption, string][]>(() => {
    if (!currentQuestion) return [];

    return Object.entries(currentQuestion.options).sort();
  }, [currentQuestion]);
  const nextQuestion = () => {
    if (!userAnswers[currentQuestionIndex]?.length || !diagnostic) return;

    if (currentQuestionIndex + 1 >= diagnostic?.questions?.length) {
      stopQuestionTimer();

      return onFinish({
        answers: userAnswers,
        answersTime
      });
    }

    onSaveQuestion({
      answersTime,
      answers: userAnswers,
      finished: false
    });

    setAnswersTime((prevState) => {
      const newAnswersTime = assign(prevState);
      newAnswersTime[currentQuestionIndex] = questionTime;

      return newAnswersTime;
    });

    restartQuestionTimer();

    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handleAnswer = (alternative: DiagnosticAnswerOption) => {
    setUserAnswers((prevState) => {
      const newAnswers = assign(prevState);
      newAnswers[currentQuestionIndex] = alternative;

      return newAnswers;
    });
  };

  const DIAGNOSTIC_LIMIT = 720000;

  useEffect(() => {
    if (time >= DIAGNOSTIC_LIMIT) {
      onTimeIsOver({
        answers: userAnswers,
        answersTime
      });
    }
  }, [time, userAnswers, answersTime]);
  return (
    <form onSubmit={(ev) => ev.preventDefault()}>
      <FormLabel mt={8} mb={6} as="legend" fontWeight="bold" fontSize="xl" lineHeight="1.4">
        {currentQuestionIndex + 1}) {currentQuestion?.label}
      </FormLabel>
      <RadioGroup
        colorScheme="blue"
        // @ts-ignore
        onChange={handleAnswer}
        key={currentQuestionIndex}
        value={userAnswers[currentQuestionIndex]}
      >
        {currentQuestionOptions.map(([letter, label]) => {
          if (!letter || !label) return null;
          const checked = userAnswers[currentQuestionIndex]?.includes(letter);
          return (
            <Radio key={letter} value={letter} borderColor="gray.300" checked={checked} my={1} display="flex">
              {capitalize(label)}
            </Radio>
          );
        })}
      </RadioGroup>

      <Flex justifyContent="space-between" my={2}>
        <Button mt={4} colorScheme="blue" width="40%" type="submit" onClick={nextQuestion}>
          <Box mr={2}>Next</Box>
          <Icon name="chevron-right" size="10" position="absolute" right={0} />
        </Button>
      </Flex>

      <Progress
        my={4}
        borderRadius={5}
        value={currentQuestionIndex}
        min={0}
        max={diagnostic?.questions?.length ?? 0}
        size="md"
        colorScheme="teal"
      />
    </form>
  );
};
