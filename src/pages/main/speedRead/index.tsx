import React, { FC, useEffect, useMemo, useState } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement,
  useDisclosure
} from '@chakra-ui/react';
import { get, sortBy } from 'lodash';
import { useQuery } from 'react-query';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { Icon, Indicator } from 'components/common';
import { TextsTable } from 'components/Pages/SpeedRead';
import { UploadCustomEssayModal } from 'components/Pages/SpeedRead/UploadCustomEssayModal';

import {
  CustomEssay,
  CustomEssayDocumentWithId,
  Essay,
  EssayDocumentWithId,
  EssayOrCustomEssayDocumentWithId,
  SpeedTestResult
} from 'types';
import { useAuthContext, useFirebaseContext, useTestResultList } from 'lib/firebase';
import { useDebounce } from 'lib/customHooks';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

interface Props { }

export const SpeedReadLibrary: FC<Props> = () => {
  const { user, refetchUserDetails } = useAuthContext();

  const [essays, setEssays] = useState<EssayOrCustomEssayDocumentWithId[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [userDifficultLevel] = useState<string>(() => {
    return user?.userDetails?.difficultLevel ?? 'middle_school';
  });

  useEffect(() => {
    refetchUserDetails();
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: rawEssays, isFetching, refetch: refetchEssays } = useQuery(
    ['speed-read', 'essays', userDifficultLevel],
    async () => {
      const essaysQuery = query(collection(db, 'essays').withConverter<EssayDocumentWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as Essay)
          };
        },
        toFirestore: (doc: EssayDocumentWithId) => doc
      }), where('category', '==', userDifficultLevel), where('speedTestOnly', '!=', true)
      )

      const customTextsQuery = query(collection(db, 'customEssays').withConverter<CustomEssayDocumentWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as CustomEssay)
          };
        },
        toFirestore: (doc: CustomEssayDocumentWithId) => doc
      }), where('userId', '==', user?.uid))

      const essaysSnap = await getDocs(essaysQuery)
      const essays = essaysSnap.docs.map((doc) => doc.data());
      const customTextsSnap = await getDocs(customTextsQuery)
      const customTexts = customTextsSnap.docs.map((doc) => doc.data());

      return [...customTexts.map((t) => ({ ...t, isCustom: true })), ...essays.map((t) => ({ ...t, isCustom: false }))];
    },
    {
      enabled: !!userDifficultLevel,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSuccess(textsResp) {
        setEssays(textsResp);
      }
    }
  );

  // Filter after update in the search string
  useDebounce(
    () => {
      if (!rawEssays) return;

      const treatSearchString = (str: string): string => str.toLocaleLowerCase().split(' ').join('_');
      const treatedSearchValue = treatSearchString(searchValue);

      if (!treatedSearchValue) {
        // @ts-ignore
        return setEssays(rawEssays);
      }

      setEssays(
        // @ts-ignore
        rawEssays.filter((text) => {
          return treatSearchString(text.name).includes(treatedSearchValue);
        })
      );
    },
    500,
    [rawEssays, searchValue]
  );

  const speedTestsResults = useTestResultList<SpeedTestResult>(['speed-read']);

  const { numberOfTests, averageSpeedRead, bestSpeedRead /*, averageComprehension */ } = useMemo<{
    numberOfTests: number;
    averageSpeedRead: number;
    averageComprehension?: number;
    bestSpeedRead: number;
  }>(() => {
    const testsLength = speedTestsResults.length;
    const averageSpeed = get(user, ['userDetails', 'activity', 'stats', 'wordSpeed', 'averageWordSpeed']);

    // const averageComprehension = sumBy(testsWithComprehension, 'comprehension') / (testsWithComprehension.length || 1);

    const [bestResult] = sortBy(speedTestsResults, 'wordSpeed').reverse();

    return {
      numberOfTests: testsLength ?? 0,
      averageSpeedRead: Math.floor(averageSpeed ?? 0),
      bestSpeedRead: Math.floor(bestResult?.wordSpeed ?? 0)
      // averageComprehension: Math.floor(averageComprehension)
    };
  }, [speedTestsResults]);

  const handleUploadModalClose = () => {
    onClose();
    refetchEssays();
  };

  return (
    <BasePage spacing="md">
      <BasePageTitle title="Test your speed" paddingBottom="md" />
      <UploadCustomEssayModal isOpen={isOpen} onOpen={onOpen} onClose={() => handleUploadModalClose()} />
      <ChakraFlex height="100%" flexDirection="column">
        <ChakraFlex marginBottom="md" justifyContent="space-between" alignItems="center">
          <Indicator
            flex="1"
            color="blue.500"
            label="Assessments Completed"
            isLoading={isFetching}
            value={numberOfTests ?? '-'}
          />
          <Indicator
            flex="1"
            color="blue.500"
            label="Best WPM Speed"
            isLoading={isFetching}
            value={bestSpeedRead ?? '-'}
          />
          <Indicator
            flex="1"
            color="orange.500"
            label="Average WPM Speed"
            isLoading={isFetching}
            value={averageSpeedRead ?? '-'}
          />
          <Indicator
            flex="1"
            color="orange.500"
            label="Average Comprehension"
            isLoading={isFetching}
            // value={averageComprehension ?? '-'}
            value="-"
          />
        </ChakraFlex>
        <ChakraFlex marginBottom="lg" alignItems="center" justifyContent="space-between">
          <ChakraHeading fontSize="md" whiteSpace="nowrap" textStyle="title-with-border-bottom">
            Tests List
          </ChakraHeading>

          <ChakraFlex>
            <ChakraFlex marginX="md">
              <ChakraInputGroup size="sm">
                <ChakraInput
                  borderRadius="sm"
                  placeholder="Search"
                  borderColor="gray.400"
                  value={searchValue}
                  onChange={(ev) => setSearchValue(ev.target.value)}
                />
                <ChakraInputRightElement>
                  <Icon name="search" size="sm" />
                </ChakraInputRightElement>
              </ChakraInputGroup>
            </ChakraFlex>

            <ChakraButton borderRadius="sm" color="white" colorScheme="orange" size="sm" px={5} onClick={onOpen}>
              <Icon name="upload" marginRight="sm" size="sm" />
              Upload Text
            </ChakraButton>
          </ChakraFlex>
        </ChakraFlex>

        <ChakraFlex>
          {/* @ts-ignore */}
          <TextsTable data={essays} isLoading={isFetching} />
        </ChakraFlex>
      </ChakraFlex>
    </BasePage>
  );
};
