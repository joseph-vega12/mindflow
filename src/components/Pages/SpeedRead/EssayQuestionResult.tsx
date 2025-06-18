import { Box, BoxProps, Flex, Text } from '@chakra-ui/react';
import { isEqual } from 'lodash';
import React, { FC } from 'react';

import { EssayAnswerOption, EssayQuestion } from 'types';
import { EssayResultCorrection } from './EssayResultCorrection';

interface Props extends BoxProps {
  question: EssayQuestion;
  index: number;
  answer?: EssayAnswerOption;
}

export const EssayQuestionResult: FC<Props> = ({ index, question, answer, ...rest }) => {
  const isCorrect = isEqual(question.correctAnswer, answer);

  return (
    <Box {...rest}>
      <Box my={2}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text textStyle="title-with-border-bottom" mb={0}>
            Question {index + 1}:
          </Text>
        </Flex>

        <Text>{question.label}</Text>

        <EssayResultCorrection question={question} answer={answer} isCorrect={isCorrect} />
      </Box>
    </Box>
  );
};
