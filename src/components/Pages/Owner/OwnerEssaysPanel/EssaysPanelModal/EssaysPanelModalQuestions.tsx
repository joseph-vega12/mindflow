import React, { FC } from 'react';

import {
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
  Heading as ChakraHeading,
  Input as ChakraInput,
  Select as ChakraSelect,
  Text as ChakraText
} from '@chakra-ui/react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { EssayComprehensionQuestion, EssayDocumentWithId } from 'types';

import { Icon } from 'components/common';

export const EssaysPanelModalQuestions: FC = () => {
  const { control, register } = useFormContext<EssayDocumentWithId>();

  const { fields, append, remove } = useFieldArray<EssayComprehensionQuestion>({
    name: 'questions',
    control
  });

  const handleAddQuestion = () => {
    register('questions');

    append({
      label: `Question ${fields.length + 1}`,
      options: { a: '', b: '', c: '', d: '' },
      correctAnswer: 'a'
    });
  };

  return (
    <ChakraFlex width="100%" flexDirection="column">
      <ChakraFlex width="100%" justifyContent="space-between" alignItems="center">
        <ChakraHeading fontSize="lg">Essay questions</ChakraHeading>
        <ChakraText
          fontSize="lg"
          color="blue.500"
          cursor="pointer"
          textDecoration="underline"
          onClick={() => handleAddQuestion()}
        >
          New question +
        </ChakraText>
      </ChakraFlex>

      {fields.map((field, index) => (
        <ChakraFlex
          width="100%"
          padding="md"
          border="sm"
          borderColor="gray.300"
          background="gray.100"
          borderRadius="sm"
          flexDirection="column"
          marginTop="md"
          key={field.id}
        >
          <ChakraFlex alignItems="center" justifyContent="space-between" marginBottom="md">
            <ChakraHeading fontSize="sm">{`Question #${index + 1}`}</ChakraHeading>
            <Icon
              name="small-close"
              color="gray.500"
              cursor="pointer"
              _hover={{
                color: 'red.500'
              }}
              onClick={() => remove(index)}
            />
          </ChakraFlex>

          <ChakraFlex width="100%">
            <ChakraFlex width="100%" marginRight="sm" flexDirection="column">
              <ChakraFormLabel>Question name</ChakraFormLabel>
              <ChakraInput
                placeholder="Insert the question name..."
                borderRadius="sm"
                backgroundColor="white"
                name={`questions.[${index}].label`}
                {...register(`questions.${index}.label`, { required: true })}
              />
            </ChakraFlex>
            <ChakraFlex width="100%" marginLeft="sm" flexDirection="column">
              <ChakraFormLabel>Correct option</ChakraFormLabel>
              <ChakraSelect
                placeholder="Insert the question answer..."
                borderRadius="sm"
                backgroundColor="white"
                name={`questions.[${index}].correctAnswer`}
                {...register(`questions.${index}.correctAnswer`, { required: true })}
              >
                {['a', 'b', 'c', 'd'].map((option) => (
                  <option key={option} value={option}>
                    {option.toUpperCase()}
                  </option>
                ))}
              </ChakraSelect>
            </ChakraFlex>
          </ChakraFlex>

          <ChakraHeading fontSize="sm" marginY="md">
            Options
          </ChakraHeading>

          <ChakraFlex flexDirection="column">
            <ChakraFlex alignItems="center" marginBottom="md">
              <ChakraText as="span" fontWeight="bold" marginRight="sm">
                A:
              </ChakraText>
              <ChakraInput
                placeholder="Insert the option text..."
                borderRadius="sm"
                backgroundColor="white"
                name={`questions.[${index}].options.a`}
                {...register(`questions.${index}.options.a`, { required: true })}
              />
            </ChakraFlex>
            <ChakraFlex alignItems="center" marginBottom="md">
              <ChakraText as="span" fontWeight="bold" marginRight="sm">
                B:
              </ChakraText>
              <ChakraInput
                placeholder="Insert the option text..."
                borderRadius="sm"
                backgroundColor="white"
                name={`questions.[${index}].options.b`}
                {...register(`questions.${index}.options.b`, { required: true })}
              />
            </ChakraFlex>
            <ChakraFlex alignItems="center" marginBottom="md">
              <ChakraText as="span" fontWeight="bold" marginRight="sm">
                C:
              </ChakraText>
              <ChakraInput
                placeholder="Insert the option text..."
                borderRadius="sm"
                backgroundColor="white"
                name={`questions.[${index}].options.c`}
                {...register(`questions.${index}.options.c`, { required: true })}
              />
            </ChakraFlex>
            <ChakraFlex alignItems="center">
              <ChakraText as="span" fontWeight="bold" marginRight="sm">
                D:
              </ChakraText>
              <ChakraInput
                placeholder="Insert the option text..."
                borderRadius="sm"
                backgroundColor="white"
                name={`questions.[${index}].options.d`}
                {...register(`questions.${index}.options.d`, { required: true })}
              />
            </ChakraFlex>
          </ChakraFlex>
        </ChakraFlex>
      ))}
    </ChakraFlex>
  );
};
