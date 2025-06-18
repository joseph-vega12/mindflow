import React, { FC } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Text as ChakraText
} from '@chakra-ui/react';

import { EssayDocumentWithId } from 'types';

import { HtmlRender, Icon } from 'components/common';
import { TextConfiguration } from '.';

export interface SpeedReadTestProps extends TextConfiguration {
  essay: EssayDocumentWithId;
  onFinishTest: () => void;
}
export const SpeedReadTest: FC<SpeedReadTestProps> = ({ fontSize, category, fontFamily, essay, onFinishTest }) => {
  return (
    <ChakraFlex flexDirection="column">
      <ChakraHeading marginBottom="md" textStyle="title-with-border-bottom" fontSize="md">
        {essay.name}
      </ChakraHeading>
      <ChakraFlex marginBottom={{ xs: 'none', lg: 'xl' }} position="relative">
        <HtmlRender
          html={`
              <style>
                .htmlRender {
                  text-indent: 25px;
                  font-size: ${fontSize}px;
                  font-family:${fontFamily};
                }
              </style>
              <div class='htmlRender'>
                ${essay?.textHtml}
              </div>
            `}
        />
        <ChakraFlex
          top="0"
          left="-50px"
          padding="sm"
          cursor="pointer"
          width="fit-content"
          position="absolute"
          background="green.500"
          borderRadius="12px"
          boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19)"
          display={{ xs: 'none', lg: 'flex' }}
          onClick={() => onFinishTest()}
        >
          <Icon size="sm" name="assignment" color="white" />
        </ChakraFlex>
      </ChakraFlex>

      <ChakraFlex
        alignItems="center"
        flexDirection={{ xs: 'column-reverse', lg: 'row' }}
        justifyContent={{ xs: 'center', lg: 'flex-start' }}
        marginBottom="xxlarge"
      >
        <ChakraButton
          colorScheme="green"
          width={{ xs: '100%', lg: '160px' }}
          marginBottom={{ xs: 'md', lg: 'none' }}
          marginRight={{ xs: 'none', lg: 'md' }}
          leftIcon={<Icon size="sm" marginRight="sm" name="assignment" />}
          boxShadow="0 4px 6px 0 rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.19)"
          onClick={() => onFinishTest()}
        >
          Finish
        </ChakraButton>
        <ChakraText marginY={{ xs: 'md', lg: 'none' }} color="gray.600" fontWeight="bold">
          Hit the button in the left when you have read the essay above
        </ChakraText>
      </ChakraFlex>
    </ChakraFlex>
  );
};
