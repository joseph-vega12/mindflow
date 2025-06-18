import { Box, Button, Radio, RadioGroup, FormLabel, Heading } from '@chakra-ui/react';
import { cloneDeep, get } from 'lodash';
import React, { FC, useEffect, useState } from 'react';

import { EssayComprehensionAnswerOption, EssayDocumentWithId } from 'types';
import { percentage } from 'lib/utils';

interface Props {
  essay?: EssayDocumentWithId;

  onSubmit: (answers: EssayComprehensionAnswerOption[], percentage: number) => void;
  onSkip: () => void;
}

// Only once about the question
export const ComprehensionEvaluation: FC<Props> = ({ essay, onSubmit, onSkip }) => {
  const [answers, setAnswers] = useState<EssayComprehensionAnswerOption[]>([]);

  const handleSubmit = () => {
    if (answers.filter((ans) => ans).length !== essay?.questions?.length) return null;

    const correctAnswers = answers
      .map((ans, idx) => ans === get(essay, ['questions', idx, 'correctAnswer']))
      .filter((ans) => ans);

    const comprehensionPercentage = percentage(correctAnswers.length, essay?.questions?.length ?? 0);

    onSubmit(answers, comprehensionPercentage);
  };

  useEffect(() => {
    if (!essay?.questions?.length) {
      onSkip();
    }
  }, [essay?.questions]);

  const handleAnswer = (idx: number, value: EssayComprehensionAnswerOption) => {
    setAnswers((prevState) => {
      const newAnswers = cloneDeep(prevState);

      newAnswers[idx] = value;

      return newAnswers;
    });
  };

  return (
    <Box height="100%">
      <Heading textStyle="title-with-border-bottom" fontSize="md" px={2} mb={3}>
        Test your comprehension
      </Heading>

      <Box width="50%" my={8} mx={1}>
        {essay?.questions?.map((question, idx) => {
          const questionsKeys = ['a', 'b', 'c', 'd'];

          return (
            <Box key={idx} mb="md">
              <FormLabel mt={8} mb={6} as="legend" fontWeight="bold" fontSize="xl" lineHeight="1.4">
                <b>{idx + 1})</b> {question?.label}:
              </FormLabel>
              <RadioGroup
                colorScheme="blue"
                // @ts-ignore
                onChange={(val) => handleAnswer(idx, val)}
                value={answers[idx]}
              >
                {questionsKeys.map((alternative) => {
                  return (
                    <Radio
                      key={alternative}
                      value={alternative}
                      borderColor="gray.300"
                      checked={answers[idx] === alternative}
                      my={1}
                      display="flex"
                    >
                      {get(question, ['options', alternative])}
                    </Radio>
                  );
                })}
              </RadioGroup>
            </Box>
          );
        })}
      </Box>

      <Box width="50%" display="flex" justifyContent="flex-end" my={6}>
        <Button colorScheme="gray" mr={4} onClick={onSkip}>
          Skip
        </Button>
        <Button colorScheme="green" onClick={handleSubmit}>
          Submit
        </Button>
      </Box>
    </Box>
  );
};
