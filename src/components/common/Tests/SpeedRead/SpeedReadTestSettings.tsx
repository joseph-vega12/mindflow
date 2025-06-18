import {
  Badge,
  Button as ChakraButton,
  Divider as ChakraDivider,
  Flex as ChakraFlex,
  FormLabel as ChakraFormLabel,
  Heading as ChakraHeading,
  NumberDecrementStepper as ChakraNumberDecrementStepper,
  NumberIncrementStepper as ChakraNumberIncrementStepper,
  NumberInput as ChakraNumberInput,
  NumberInputField as ChakraNumberInputField,
  NumberInputStepper as ChakraNumberInputStepper,
  Select as ChakraSelect,
  Text as ChakraText
} from '@chakra-ui/react';
import React, { FC, useState } from 'react';

import { EssayOrCustomEssayDocumentWithId } from 'types';
import { InfoDescription } from 'components/common';

interface Props {
  essay?: EssayOrCustomEssayDocumentWithId;
  isLoading?: boolean;

  onStart: ({ fontFamily, fontSize }: { fontFamily: string; fontSize: number }) => void;
}

export const SpeedReadTestSettings: FC<Props> = ({ essay, isLoading = false, onStart }) => {
  const [fontFamily, setFontFamily] = useState<string>('Roboto');
  const [fontSize, setFontSize] = useState<number>(16);

  return (
    <ChakraFlex height="100%" flexDirection="column">
      <ChakraFlex flexDirection="column">
        {essay?.isCustom && (
          <Badge
            width="fit-content"
            paddingX="sm"
            paddingY="xs"
            lineHeight="12px"
            colorScheme="orange"
            marginBottom="sm"
            borderRadius="xs"
          >
            Custom text
          </Badge>
        )}
        <ChakraFlex flexDirection="column">
          <InfoDescription marginBottom="sm" label="Essay Title" description={essay?.name} isLoading={isLoading} />
          <ChakraFlex marginBottom="sm">
            <InfoDescription
              marginRight="md"
              label="Number of words"
              description={essay?.totalOfSentences}
              isLoading={isLoading}
            />
            {/* @ts-ignore */}
            {!essay?.isCustom && <InfoDescription label="Level" description={essay?.difficult} isLoading={isLoading} />}
          </ChakraFlex>
          {essay?.author && (
            <InfoDescription marginBottom="sm" label="Essay Author" description={essay?.author} isLoading={isLoading} />
          )}
          {essay?.source && (
            <ChakraFlex>
              <ChakraText color="gray.500" fontWeight="bolder">
                Essay Source:{' '}
                <ChakraText
                  color="blue.500"
                  as="span"
                  fontWeight="normal"
                  textDecoration="underline"
                  cursor="pointer"
                  onClick={() => window.open(essay.source, '_blank')}
                >
                  Link
                </ChakraText>
              </ChakraText>
            </ChakraFlex>
          )}
        </ChakraFlex>
      </ChakraFlex>
      <ChakraDivider marginY="lg" borderColor="gray.400" />
      <ChakraFlex flexDirection="column">
        <ChakraHeading marginBottom="md" textStyle="title-with-border-bottom" fontSize="md">
          Set Your Settings
        </ChakraHeading>
        <ChakraFlex width={{ lg: '50%', md: '80%' }}>
          <ChakraFlex marginRight="md" flex="1" flexDirection="column">
            <ChakraFormLabel>Font Family</ChakraFormLabel>
            <ChakraSelect
              borderRadius="sm"
              value={fontFamily}
              disabled={isLoading}
              onChange={(ev) => setFontFamily(ev.target.value)}
            >
              <option value="arial">Arial</option>
              <option value="Roboto">Roboto</option>
              <option value="Montserrat">Montserrat</option>
            </ChakraSelect>
          </ChakraFlex>
          <ChakraFlex flexDirection="column">
            <ChakraFormLabel>Font Size</ChakraFormLabel>
            <ChakraNumberInput
              min={13}
              max={35}
              value={fontSize}
              disabled={isLoading}
              onChange={(valueString) => setFontSize(Number(valueString))}
            >
              <ChakraNumberInputField borderRadius="sm" />
              <ChakraNumberInputStepper>
                <ChakraNumberIncrementStepper />
                <ChakraNumberDecrementStepper />
              </ChakraNumberInputStepper>
            </ChakraNumberInput>
          </ChakraFlex>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraFlex marginY="lg" alignItems="center">
        <ChakraButton
          size="sm"
          color="white"
          paddingX="lg"
          marginRight="md"
          borderRadius="sm"
          colorScheme="blue"
          onClick={() => onStart({ fontFamily, fontSize })}
        >
          Start
        </ChakraButton>
        <ChakraDivider borderColor="gray.400" />
      </ChakraFlex>
      <ChakraFlex justifyContent="center">
        <ChakraText width="80%" fontFamily={fontFamily} fontSize={fontSize} style={{ textIndent: '30px' }}>
          Sometimes, an admissions or certification test can feel like a “life or death” situation if you have your
          heart set on going to school or being granted the "right" to perform as a professional in your field, such as
          with the medical boards or the BAR exam. You also may have reasonable concerns about taking the a test now,
          particularly if you have not had a lot of time to study, if you have been away from school, tests, and
          academics for a while, or if you just don’t like taking tests. So, what level of stress is appropriate?
        </ChakraText>
      </ChakraFlex>
    </ChakraFlex>
  );
};
