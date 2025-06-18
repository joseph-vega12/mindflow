import React, { FC, useMemo } from 'react';

import { Box, Flex as ChakraFlex, Text as ChakraText } from '@chakra-ui/react';
import { filter, get } from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { BaseTestCard, BrainEyeTestResultsTable, PracticeTestResultsTable } from 'components/Pages/Library';
import { Loading } from 'components/common';

import { Essay } from 'types';
import { useTestResultList } from 'lib/firebase';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

const boxStyle = {
  overflowY: 'scroll',
  height: '220px'
};

export const LibraryEssay: FC = () => {
  const { essayId } = useParams<{ essayId: string }>();
  const navigate = useNavigate();

  const { data: essay, isLoading } = useQuery(['essays', essayId], async () => {
    const essay = await getDoc(doc(collection(db, 'essays'), essayId))

    return essay.data() as Essay;
  });
  const results = useTestResultList(['brain-eye-coordination', 'practice']);

  const { practiceTestResults, brainEyeTestResults } = useMemo(() => {
    const textTestResults = filter(results, { essayId });

    return {
      practiceTestResults: filter(textTestResults, { type: 'practice' }),
      brainEyeTestResults: filter(textTestResults, { type: 'brain-eye-coordination' })
    };
  }, [results]);

  const infos = useMemo<{ label: string; key: string; default?: any }[]>(() => {
    const dataKeys = [
      { label: 'Title', key: 'name' },
      { label: 'Number of words', key: 'wordsNumber' },
      { label: 'Difficulty', key: 'difficulty' }
    ];

    return dataKeys
      .map((keyStructure) => ({ ...keyStructure, value: get(essay, keyStructure.key) }))
      .filter((d) => d.value);
  }, [essay]);

  return (
    <BasePage width="100%" spacing="sm">
      <BasePageTitle
        paddingX="xl"
        paddingBottom="md"
        display="flex"
        alignItems="baseline"
        title="Library"
        showGoBack={true}
      >
        <ChakraFlex marginLeft="md" gridGap="lg" alignItems="center">
          {infos.map(({ label, key }) => (
            <ChakraText key={key} color="gray.500" fontWeight="bold">
              {label}:
              <ChakraText as="span" paddingLeft="xs" color="black" fontWeight="400">
                {get(essay, key)}
              </ChakraText>
            </ChakraText>
          ))}
        </ChakraFlex>
      </BasePageTitle>
      <Loading isLoading={isLoading}>
        <ChakraFlex justifyContent="center" gridGap="lg">
          <BaseTestCard
            icon="practice_test"
            label="Practice"
            completed={!!practiceTestResults.length}
            onClick={() => navigate(`/library/${essayId}/practice`)}
          >
            <Box sx={boxStyle}>
              {/* @ts-ignore */}
              <PracticeTestResultsTable data={practiceTestResults} isLoading={false} />
            </Box>
          </BaseTestCard>

          <BaseTestCard
            icon="brain_eye_coordination"
            label="Brain-Eye Coordination"
            completed={!!brainEyeTestResults.length}
            onClick={() => navigate(`/library/${essayId}/brain-eye-coordination`)}
          >
            <Box sx={boxStyle}>
              {/* @ts-ignore */}
              <BrainEyeTestResultsTable data={brainEyeTestResults} />
            </Box>
          </BaseTestCard>
        </ChakraFlex>
      </Loading>
    </BasePage>
  );
};
