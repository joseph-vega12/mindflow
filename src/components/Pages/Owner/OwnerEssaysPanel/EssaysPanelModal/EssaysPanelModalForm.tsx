import React, { FC } from 'react';

import {
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
  Input as ChakraInput,
  Select as ChakraSelect
} from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';

import { EssayDocumentWithId, userFriendlyDifficultLevel } from 'types';
import { HtmlEditor } from 'components/common';

export const EssaysPanelModalForm: FC = () => {
  const { register, watch, setValue } = useFormContext<EssayDocumentWithId>();

  const formValues = watch();

  const handleTextInput = (html: string, raw: string) => {
    register('content');
    register('textHtml');

    setValue('content', raw);
    setValue('textHtml', html);
  };

  return (
    <>
      <ChakraFlex width="100%" marginBottom="md" flexDirection="column">
        <ChakraFormLabel>Essay name</ChakraFormLabel>
        <ChakraInput
          name="name"
          borderRadius="sm"
          placeholder="Insert the essay name..."
          {...register("name", { required: true })}
        />
      </ChakraFlex>

      <ChakraFlex width="100%" alignItems="center" marginBottom="md">
        <ChakraFlex width="100%" flexDirection="column">
          <ChakraFormLabel>Essay author</ChakraFormLabel>
          <ChakraInput
            name="author"
            borderRadius="sm"
            placeholder="Insert the essay author..."
            {...register("author", { required: true })}
          />
        </ChakraFlex>
        <ChakraFlex width="100%" marginLeft="sm" flexDirection="column">
          <ChakraFormLabel>Essay category</ChakraFormLabel>
          <ChakraSelect
            name="category"
            borderRadius="sm"
            placeholder="Insert the essay category..."
            {...register("category", { required: true })}
          >
            {Object.entries(userFriendlyDifficultLevel).map(([key, value], index) => (
              <option key={index} value={key}>
                {value}
              </option>
            ))}
          </ChakraSelect>
        </ChakraFlex>
      </ChakraFlex>

      <ChakraFlex width="100%" marginBottom="md" flexDirection="column">
        <ChakraFormLabel>Essay text</ChakraFormLabel>
        <HtmlEditor textHtml={formValues.textHtml} onChange={(html, raw) => handleTextInput(html, raw)} />
      </ChakraFlex>
    </>
  );
};
