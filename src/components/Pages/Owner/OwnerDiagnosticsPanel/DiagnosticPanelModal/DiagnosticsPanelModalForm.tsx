import React, { FC } from 'react';

import {
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
  Input as ChakraInput,
  Select as ChakraSelect
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { DiagnosticDocumentWithId, testTypeOptions } from 'types';
import { HtmlEditor } from 'components/common';

export const DiagnosticsPanelModalForm: FC = () => {
  const { register, watch, setValue } = useFormContext<DiagnosticDocumentWithId>();

  const formValues = watch();
  const handleTextInput = (html: string, raw: string) => {
    register('content');
    register('text');

    setValue('content', raw);
    setValue('text', html);
  };

  return (
    <>
      <ChakraFlex width="100%" alignItems="center" marginBottom="md">
        <ChakraFlex width="100%" flexDirection="column">
          <ChakraFormLabel>Diagnostic title</ChakraFormLabel>
          <ChakraInput
            name="title"
            borderRadius="sm"
            placeholder="Insert the diagnostic title..."
            {...register("title", { required: false })}
          />
        </ChakraFlex>
        <ChakraFlex width="100%" flexDirection="column" marginLeft="sm">
          <ChakraFormLabel>Diagnostic author</ChakraFormLabel>
          <ChakraInput
            name="author"
            borderRadius="sm"
            placeholder="Insert the diagnostic author..."
            {...register("author", { required: true })}
          />
        </ChakraFlex>
      </ChakraFlex>
      <ChakraFlex width="100%" alignItems="center" marginBottom="md">
        <ChakraFlex width="100%" flexDirection="column">
          <ChakraFormLabel>Test Type</ChakraFormLabel>
          <ChakraInput
            disabled
            name="name"
            borderRadius="sm"
            placeholder="Insert the diagnostic name..."
            {...register("name", { required: true })}
          />
        </ChakraFlex>
        <ChakraFlex width="100%" marginLeft="sm" flexDirection="column">
          <ChakraFormLabel>Diagnostic category</ChakraFormLabel>
          <ChakraSelect
            disabled
            name="category"
            borderRadius="sm"
            placeholder="Insert the diagnostic category..."
            {...register("category", { required: true })}
          >
            {Object.entries(testTypeOptions).map(([key, value], index) => (
              <option key={index} value={key}>
                {value}
              </option>
            ))}
          </ChakraSelect>
        </ChakraFlex>
      </ChakraFlex>

      <ChakraFlex width="100%" marginBottom="md" flexDirection="column">
        <ChakraFormLabel>Diagnostic text</ChakraFormLabel>
        <HtmlEditor textHtml={formValues.text} onChange={(html, raw) => handleTextInput(html, raw)} />
      </ChakraFlex>
    </>
  );
};
