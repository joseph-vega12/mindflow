import { Box, BoxProps, Flex, Text } from '@chakra-ui/react';
import { isEqual } from 'lodash';
import React, { FC } from 'react';

import { DiagnosticAnswerOption, DiagnosticQuestion } from 'types';
import { DiagnosticResultCorrection } from './DiagnosticResultCorrection';
import { Icon, Timer } from 'components/common';

interface Props extends BoxProps {
  question: DiagnosticQuestion;
  index: number;
  answer?: DiagnosticAnswerOption;
  time: number;
}

export const DiagnosticQuestionResult: FC<Props> = ({ index, question, time, answer, ...rest }) => {
  const isCorrect = isEqual(question.correctAnswer, answer);

  const color = isCorrect ? 'green' : 'red';

  return (
    <Box {...rest}>
      <Box my={2}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text textStyle="title-with-border-bottom" mb={0}>
            Question {index + 1}:
          </Text>
          <Flex alignItems="center">
            <Timer color={`${color}.500`} time={time} fontSize="xl" />

            <Icon color={`${color}.500`} name={isCorrect ? 'check-circle' : 'close'} size="sm" ml={2} />
          </Flex>
        </Flex>

        <Text>{question.label}</Text>

        <DiagnosticResultCorrection question={question} answer={answer} isCorrect={isCorrect} />
      </Box>
    </Box>
  );
};
