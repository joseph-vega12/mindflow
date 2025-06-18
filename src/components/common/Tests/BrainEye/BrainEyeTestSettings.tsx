import React, { FC, useState } from 'react';

import {
  Box as ChakraBox,
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

import { InfoDescription, Slider } from 'components/common';

import { BrainEyeTestConfig } from './index';
import { EssayDocumentWithId } from 'types';

interface BrainEyeTestSettingsProps {
  isLoading?: boolean;
  essay?: EssayDocumentWithId;
  onStart: (args: BrainEyeTestConfig) => void;
}

export const BrainEyeTestSettings: FC<BrainEyeTestSettingsProps> = ({ essay, isLoading = false, onStart }) => {
  const [fontFamily, setFontFamily] = useState<string>('Roboto');
  const [fontSize, setFontSize] = useState<number>(24);
  const [wordSpeed, setWordSpeed] = useState<number>(250);
  const [wordsNumber, setWordsNumber] = useState<number>(2);

  return (
    <ChakraFlex height="100%" flexDirection="column">
      <ChakraFlex flexDirection="column">
        <ChakraHeading marginBottom="md" textStyle="title-with-border-bottom" fontSize="md">
          Brain Eye Coordination Details
        </ChakraHeading>
        <ChakraFlex flexDirection="column">
          <InfoDescription marginBottom="sm" label="Essay title" description={essay?.name} isLoading={isLoading} />
          <ChakraFlex>
            <InfoDescription
              marginRight="md"
              label="Number of words"
              isLoading={isLoading}
              description={essay?.totalOfSentences}
            />
            <InfoDescription label="Level" description={essay?.difficult} isLoading={isLoading} />
          </ChakraFlex>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraDivider marginY="lg" borderColor="gray.400" />
      <ChakraFlex flexDirection="column">
        <ChakraHeading marginBottom="md" textStyle="title-with-border-bottom" fontSize="md">
          Brain Eye Coordination Settings
        </ChakraHeading>
        <ChakraFlex marginBottom="md" width="50%" flexDirection="column">
          <ChakraFlex marginBottom="md">
            <ChakraFlex flex="1" flexDirection="column">
              <ChakraFormLabel whiteSpace="nowrap">Font Family</ChakraFormLabel>
              <ChakraSelect value={fontFamily} disabled={isLoading} onChange={(ev) => setFontFamily(ev.target.value)}>
                <option value="arial">Arial</option>
                <option value="Roboto">Roboto</option>
                <option value="Montserrat">Montserrat</option>
              </ChakraSelect>
            </ChakraFlex>
            <ChakraFlex flex="1" flexDirection="column" mx="xl">
              <ChakraFormLabel whiteSpace="nowrap">Font Size</ChakraFormLabel>
              <ChakraNumberInput
                min={13}
                max={100}
                value={fontSize}
                disabled={isLoading}
                onChange={(valueString) => setFontSize(Number(valueString))}
              >
                <ChakraNumberInputField />
                <ChakraNumberInputStepper>
                  <ChakraNumberIncrementStepper />
                  <ChakraNumberDecrementStepper />
                </ChakraNumberInputStepper>
              </ChakraNumberInput>
            </ChakraFlex>
          </ChakraFlex>

          <ChakraFlex>
            <ChakraFlex marginRight="xl" flex="1" flexDirection="column">
              <ChakraFormLabel>Words Speed</ChakraFormLabel>
              <Slider min={100} max={1000} step={50} value={wordSpeed} onChange={setWordSpeed} />
            </ChakraFlex>
            <ChakraFlex flex="1" flexDirection="column">
              <ChakraFormLabel>Number of Words</ChakraFormLabel>
              <Slider min={1} max={5} step={1} value={wordsNumber} onChange={setWordsNumber} />
            </ChakraFlex>
          </ChakraFlex>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraFlex marginY="lg" alignItems="center">
        <ChakraButton
          size="sm"
          color="white"
          paddingX="lg"
          marginRight="lg"
          colorScheme="blue"
          borderRadius="sm"
          onClick={() => onStart({ fontFamily, fontSize, wordSpeed, wordsNumber })}
        >
          Start
        </ChakraButton>
        <ChakraDivider borderColor="gray.400" />
      </ChakraFlex>
      <ChakraFlex justifyContent="center">
        <ChakraBox w="900px">
          <ChakraText width="100%" fontFamily={fontFamily} fontSize={fontSize} textAlign="center">
            {'Mindflow will help me improve'
              .split(' ')
              .filter((w, index) => index < wordsNumber)
              .join(' ')}
          </ChakraText>
        </ChakraBox>
      </ChakraFlex>
    </ChakraFlex>
  );
};
