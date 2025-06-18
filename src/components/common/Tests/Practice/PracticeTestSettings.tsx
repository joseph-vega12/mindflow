import React, { FC, useEffect, useState } from 'react';

import {
  Box,
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
  Radio as ChakraRadio,
  RadioGroup as ChakraRadioGroup,
  Select as ChakraSelect,
  Stack as ChakraStack,
  Text as ChakraText
} from '@chakra-ui/react';

import { Icon } from 'components/common/Icon';
import { InfoDescription, Slider } from 'components/common';
import { Loading } from 'components/common/Loading';

import { useAudio } from 'lib/customHooks';

import { EssayDocumentWithId } from 'types';
import { PracticeExplanation } from './PracticeExplanation';
import { PracticeTestConfig } from './index';

interface PracticeTestSettingsProps {
  isLoading?: boolean;
  essay?: EssayDocumentWithId;
  onStart: (args: PracticeTestConfig) => void;
}

export const PracticeTestSettings: FC<PracticeTestSettingsProps> = ({ essay, isLoading, onStart }) => {
  const [fontFamily, setFontFamily] = useState<string>('Roboto');
  const [fontSize, setFontSize] = useState<number>(18);
  const [numberOfRounds, setNumberOfRounds] = useState<PracticeTestConfig['numberOfRounds']>(5);
  const [practiceType, setPracticeType] = useState<PracticeTestConfig['practiceType']>('regular');

  const [hopping, setHopping] = useState<PracticeTestConfig['hopping']>('wide');
  const [numberOfColumns, setNumberofColumns] = useState<PracticeTestConfig['numberOfColumns']>(1);
  const [targetLines, setTargetLines] = useState<PracticeTestConfig['targetLines']>(5);

  const [soundUrl, setSoundUrl] = useState<string>(
    'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/audios%2Falarm.wav?alt=media&token=f3bc7be7-4289-4fb5-9741-22cbf26a67f2'
  );
  const [isPlaying, { onToggleAudio, setSource, audioIsLoading }] = useAudio();

  useEffect(() => {
    setSource(soundUrl, false);
  }, [soundUrl]);
  useEffect(() => {
    setNumberofColumns(1);
  }, [hopping]);

  const soundOptions = [
    {
      url:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/audios%2Falarm.wav?alt=media&token=f3bc7be7-4289-4fb5-9741-22cbf26a67f2',
      name: 'Alarm'
    },
    {
      url:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/audios%2Farcade.wav?alt=media&token=ad4c9ff7-3c84-4549-b00f-2fbdc2fa3c8b',
      name: 'Arcade'
    },
    {
      url:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/audios%2Fbird.wav?alt=media&token=9773a1f6-135d-4e72-ab36-684deabfc02e',
      name: 'Bird'
    },
    {
      url:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/audios%2Fdog.wav?alt=media&token=10ea50aa-f90e-4f5e-8638-d1514ca016e5',
      name: 'Dog Bark'
    },
    {
      url:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/audios%2Flion.wav?alt=media&token=761d6f7c-97c0-4874-8c4a-be4c5eda545d',
      name: 'Lion'
    },
    {
      url:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/audios%2Fretro-game.wav?alt=media&token=c0a64025-623d-41ec-be4e-6d84e4061cc5',
      name: 'Retro game'
    },
    {
      url:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/audios%2Ftropical-bird.wav?alt=media&token=e320146f-f442-4b49-ab7f-5726672fe664',
      name: 'Tropical bird'
    }
  ];

  return (
    <ChakraFlex height="100%" flexDirection="column">
      <ChakraFlex flexDirection="column">
        <ChakraFlex justifyContent="space-between">
          <ChakraFlex flexDirection="column" maxWidth="40%">
            <InfoDescription marginBottom="sm" label="Essay title" isLoading={isLoading} description={essay?.name} />
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
          <Box>
            <PracticeExplanation />
          </Box>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraDivider marginY="lg" borderColor="gray.400" />
      <ChakraFlex flexDirection="column">
        <ChakraHeading marginBottom="md" textStyle="title-with-border-bottom" fontSize="md">
          Essay Settings
        </ChakraHeading>
        <ChakraFlex flexDirection="column" width={{ lg: '80%', md: '100%' }}>
          <ChakraFlex marginBottom="md">
            <ChakraFlex marginRight="lg" flex="1" flexDirection="column">
              <ChakraFormLabel mb={5}>Number of rounds</ChakraFormLabel>
              <Slider
                min={5}
                max={20}
                step={5}
                value={numberOfRounds}
                // @ts-ignore
                onChange={setNumberOfRounds}
              />
            </ChakraFlex>
            <ChakraFlex flex="1" flexDirection="column">
              <ChakraFormLabel mb={2}>Round Duration</ChakraFormLabel>
              <ChakraRadioGroup
                value={practiceType}
                // @ts-ignore
                onChange={(val) => setPracticeType(val)}
              >
                <ChakraStack spacing={3} direction="row">
                  <ChakraRadio value="regular">1 minute</ChakraRadio>
                  <ChakraRadio value="oneTwenty">1 minute 20 seconds</ChakraRadio>
                </ChakraStack>
              </ChakraRadioGroup>
            </ChakraFlex>
          </ChakraFlex>
          <ChakraFlex marginBottom="md">
            <ChakraFlex marginRight="lg" flex="1" flexDirection="column">
              <ChakraFormLabel>Font Family</ChakraFormLabel>
              <ChakraSelect
                size="sm"
                value={fontFamily}
                disabled={isLoading}
                onChange={(ev) => setFontFamily(ev.target.value)}
              >
                <option value="arial">Arial</option>
                <option value="Roboto">Roboto</option>
                <option value="Montserrat">Montserrat</option>
              </ChakraSelect>
            </ChakraFlex>
            <ChakraFlex flex="1" flexDirection="column">
              <ChakraFormLabel flexDirection="column">Font Size</ChakraFormLabel>
              <ChakraNumberInput
                size="sm"
                min={13}
                max={40}
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

          <ChakraFlex marginBottom="md" alignItems="center">
            <ChakraFlex flex="1" flexDirection="column" mr="lg">
              <ChakraFormLabel whiteSpace="nowrap">Target Lines</ChakraFormLabel>
              <ChakraSelect
                value={targetLines}
                disabled={isLoading}
                onChange={(ev) => setTargetLines(Number(ev.target.value) as PracticeTestConfig['targetLines'])}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </ChakraSelect>
            </ChakraFlex>

            <ChakraFlex flex="1" flexDirection="column">
              <ChakraFormLabel mb={1}>Number of Columns</ChakraFormLabel>
              <ChakraSelect
                size="sm"
                disabled={isLoading}
                value={numberOfColumns}
                // @ts-ignore
                onChange={(ev) => setNumberofColumns(Number(ev.target.value))}
              >
                <option value={1}>One</option>
                <option value={2}>Two</option>
                {hopping === 'wide' && <option value={3}>Three</option>}
              </ChakraSelect>
            </ChakraFlex>
          </ChakraFlex>

          <ChakraFlex alignItems="center">
            <ChakraFlex marginRight="md" w="50%" flexDirection="column">
              <ChakraFormLabel mb={1}>Width of column</ChakraFormLabel>
              <ChakraRadioGroup
                value={hopping}
                // @ts-ignore
                onChange={(val) => setHopping(val)}
              >
                <ChakraStack spacing={3} direction="row">
                  <ChakraRadio value="wide">Wide</ChakraRadio>
                  <ChakraRadio value="narrow">Narrow</ChakraRadio>
                </ChakraStack>
              </ChakraRadioGroup>
            </ChakraFlex>

            <ChakraFlex width="33%" alignItems="flex-end">
              <ChakraFlex flex="1" flexDirection="column">
                <ChakraFormLabel>Sound</ChakraFormLabel>
                <ChakraSelect
                  size="sm"
                  disabled={isLoading}
                  value={soundUrl}
                  // @ts-ignore
                  onChange={(ev) => setSoundUrl(ev.target.value)}
                >
                  {soundOptions.map(({ url, name }) => (
                    <option key={url} value={url}>
                      {name}
                    </option>
                  ))}
                </ChakraSelect>
              </ChakraFlex>

              <Loading isLoading={audioIsLoading}>
                <Icon name="play-circle" ml="md" mb="xs" cursor="pointer" onClick={() => onToggleAudio()} />
              </Loading>
            </ChakraFlex>
          </ChakraFlex>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraFlex marginY="lg" alignItems="center">
        <ChakraButton
          size="sm"
          paddingX="lg"
          marginRight="xl"
          colorScheme="blue"
          onClick={() =>
            onStart({
              fontFamily,
              fontSize,
              practiceType,
              numberOfRounds,
              hopping,
              numberOfColumns,
              targetLines,
              soundUrl
            })
          }
        >
          Start
        </ChakraButton>
        <ChakraDivider borderColor="gray.400" />
      </ChakraFlex>

      <ChakraFlex flexDirection="column" alignItems="center">
        <ChakraHeading textStyle="title-with-border-bottom" fontSize="md" my="smm" mb="lg" textAlign="center">
          Sample text
        </ChakraHeading>
        <ChakraFlex width="80%" mx="auto" justifyContent="center" position="relative">
          <Box width={hopping === 'wide' ? '100%' : '60%'} mx="auto" position="relative">
            {numberOfColumns === 2 && (
              <Box position="absolute" top={0} bottom={0} left="50%" width="1px" bg="blue.500" borderRadius="sm" />
            )}

            {numberOfColumns === 3 && (
              <>
                <Box position="absolute" top={0} bottom={0} left="33%" width="2px" bg="blue.500" borderRadius="sm" />
                <Box position="absolute" top={0} bottom={0} left="66%" width="2px" bg="blue.500" borderRadius="sm" />
              </>
            )}
            <ChakraText fontFamily={fontFamily} fontSize={fontSize} style={{ textIndent: '30px' }} textAlign="justify">
              Sometimes, an admissions or certification test can feel like a “life or death” situation if you have your
              heart set on going to school or being granted the "right" to perform as a professional in your field, such
              as with the medical boards or the BAR exam. You also may have reasonable concerns about taking the a test
              now, particularly if you have not had a lot of time to study, if you have been away from school, tests,
              and academics for a while, or if you just don’t like taking tests. So, what level of stress is
              appropriate?
            </ChakraText>
          </Box>
        </ChakraFlex>
      </ChakraFlex>
    </ChakraFlex>
  );
};
