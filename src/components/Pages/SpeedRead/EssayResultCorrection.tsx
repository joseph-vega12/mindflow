import { Box, Heading, Text } from '@chakra-ui/react';
import React, { FC } from 'react';

import { EssayAnswerOption, EssayQuestion } from 'types';

interface Props {
  question: EssayQuestion;
  answer?: EssayAnswerOption;

  isCorrect: boolean;
}

export const EssayResultCorrection: FC<Props> = ({ question, answer, isCorrect }) => {
  return (
    <Box>
      <Box bg="green.100" py={2} px={5} borderRadius="md" my={2}>
        <Heading color="green.500" fontSize="lg" mb={2}>
          Correct Answers:
        </Heading>
        <Text fontSize="sm" my={1}>
          <Text as="b" mr={1}>
            {question.correctAnswer})
          </Text>
          {question.options[question.correctAnswer] ?? ''}
        </Text>
      </Box>
      {!isCorrect && (
        <Box bg="red.100" py={2} px={3} borderRadius="md" my={2}>
          <Heading color="red.500" fontSize="lg" mb={2}>
            Your Answers:
          </Heading>
          {answer ? (
            <Text fontSize="sm" my={1}>
              <Text as="b" mr={1}>
                {answer})
              </Text>
              {question.options[answer]}
            </Text>
          ) : (
            <Text fontSize="sm" mr={1}>
              You didn't submited an answer to this question
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
};
