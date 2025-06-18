import React, { FC, useEffect, useState } from 'react';

import {
  Divider as ChakraDivider,
  Flex as ChakraFlex,
  FormControl as ChakraFormControl,
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

import { DifficultLevel, EssayDocumentWithId, userFriendlyDifficultLevel } from 'types';
import { InfoDescription } from 'components/common';

export interface TextConfiguration {
  category: DifficultLevel;
  fontSize: number;
  fontFamily: string;
}

interface SpeedReadConfigurationProps {
  onChange: (configuration: TextConfiguration) => void;
  essay: EssayDocumentWithId;
}

export const SpeedReadConfiguration: FC<SpeedReadConfigurationProps> = ({ onChange, essay }) => {
  const [selectedCategory, setSelectedCategory] = useState<DifficultLevel>('adult');
  const [selectedFontSize, setSelectedFontSize] = useState<number>(18);
  const [selectedFontFamily, setSelectedFontFamily] = useState<string>('Roboto');

  useEffect(
    () =>
      onChange({
        category: selectedCategory,
        fontSize: selectedFontSize,
        fontFamily: selectedFontFamily
      }),
      [selectedCategory, selectedFontSize, selectedFontFamily]
  );

  return (
    <ChakraFlex marginTop="md" flexDirection="column">
      <ChakraHeading textStyle="title-with-border-bottom" fontSize="md">
        Speed Reading Test Settings
      </ChakraHeading>
      <ChakraFlex width="100%" flexDirection={{ xs: 'column', lg: 'row' }} marginY="lg">
        <ChakraFormControl marginBottom={{ xs: 'md', lg: 'none' }} maxWidth={{ xs: '100%', lg: '290px' }}>
          <ChakraFormLabel>Level</ChakraFormLabel>
          <ChakraSelect
            borderRadius="sm"
            value={selectedCategory}
            // @ts-ignore
            onChange={(ev) => setSelectedCategory(ev.target.value)}
          >
            {Object.entries(userFriendlyDifficultLevel).map(([difficultLevel, labelDifficultLevel]) => (
              <option value={difficultLevel} key={difficultLevel}>
                {labelDifficultLevel}
              </option>
            ))}
          </ChakraSelect>
        </ChakraFormControl>
        <ChakraFormControl maxWidth={{ xs: '100%', lg: '290px' }} marginX={{ xs: 'none', lg: 'lg' }}>
          <ChakraFormLabel>Font Size</ChakraFormLabel>
          <ChakraNumberInput
            min={13}
            max={35}
            value={selectedFontSize}
            onChange={(value) => setSelectedFontSize(Number(value))}
          >
            <ChakraNumberInputField borderRadius="sm" />
            <ChakraNumberInputStepper>
              <ChakraNumberIncrementStepper />
              <ChakraNumberDecrementStepper />
            </ChakraNumberInputStepper>
          </ChakraNumberInput>
        </ChakraFormControl>

        <ChakraFormControl marginBottom={{ xs: 'md', lg: 'none' }} maxWidth={{ xs: '100%', lg: '290px' }}>
          <ChakraFormLabel>Font Family</ChakraFormLabel>
          <ChakraSelect
            borderRadius="sm"
            value={selectedFontFamily}
            onChange={(ev) => setSelectedFontFamily(ev.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Roboto">Roboto</option>
            <option value="Montserrat">Montserrat</option>
          </ChakraSelect>
        </ChakraFormControl>
        
      </ChakraFlex>
      <ChakraFlex flexDirection="column" marginBottom="sm">
        <InfoDescription label="Essay Title" description={essay.name}/>
        <ChakraFlex marginTop="17px" >
          <InfoDescription
              marginRight="md"
              label="Number of words"
              description={essay?.totalOfSentences}
            />
          <InfoDescription label="Difficulty" description={essay?.difficult} />
        </ChakraFlex>
      </ChakraFlex>

      <ChakraDivider marginY="lg" borderColor="gray.400" />
      <ChakraText fontSize={selectedFontSize} fontFamily={selectedFontFamily} mb="md">
        Sample Text
      </ChakraText>
      <ChakraFlex>
        <ChakraText fontSize={selectedFontSize} fontFamily={selectedFontFamily}>
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
