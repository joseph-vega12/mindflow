import React, { FC, useState } from 'react';

import {
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Icon as ChakraIcon,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement
} from '@chakra-ui/react';
import { useQuery } from 'react-query';

import { Essay, EssayDocumentWithId } from 'types';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { Indicator } from 'components/common';
import { TextsTable } from 'components/Pages/Library/TextsTables';

import { useAuthContext, useFirebaseContext, useTestResultList } from 'lib/firebase';
import { useDebounce } from 'lib/customHooks';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const Library: FC = () => {
  const { firestore } = useFirebaseContext();
  const { user } = useAuthContext();

  const [searchValue, setSearchValue] = useState<string>('');
  const [essays, setEssays] = useState<EssayDocumentWithId[]>([]);

  const userDifficultLevel = user?.userDetails?.difficultLevel;

  const { data: rawEssays, isFetching } = useQuery(
    ['library', 'essays', userDifficultLevel],
    async () => {
      const essayRef = collection(db, 'essays')
        .withConverter<EssayDocumentWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as Essay)
            };
          },
          toFirestore: (doc: EssayDocumentWithId) => doc
        })

      const essayQuery = query(essayRef, where('category', '==', userDifficultLevel))
      const essaySnap = await getDocs(essayQuery)

      return essaySnap.docs.map((doc) => doc.data());
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

  const practiceResultsQuantity = useTestResultList(['practice']).length;
  const brainEyeResultsQuantity = useTestResultList(['brain-eye-coordination']).length;

  return (
    <BasePage spacing="md">
      <BasePageTitle title="Practice Exercises" paddingX="lg" paddingBottom="lg" />
      <ChakraFlex height="100%" flexDirection="column">
        <ChakraFlex marginBottom="md" justifyContent="space-between" alignItems="center">
          <Indicator marginRight="md" color="blue.500" label="Practice Completed" value={practiceResultsQuantity} />
          <Indicator
            marginRight="md"
            color="blue.500"
            label="Brain-Eye Coordination Completed"
            value={brainEyeResultsQuantity}
          />
          <Indicator
            marginRight="md"
            color="blue.500"
            label="Total Completed"
            value={practiceResultsQuantity + brainEyeResultsQuantity}
          />
        </ChakraFlex>
        <ChakraFlex marginBottom="lg" alignItems="center">
          <ChakraHeading fontSize="md" marginRight="md" whiteSpace="nowrap" textStyle="title-with-border-bottom">
            Essays List
          </ChakraHeading>
          <ChakraFlex>
            <ChakraInputGroup size="sm">
              <ChakraInput
                borderRadius="sm"
                borderColor="gray.400"
                placeholder="Search"
                value={searchValue}
                onChange={(ev) => setSearchValue(ev.target.value)}
              />
              <ChakraInputRightElement>
                <ChakraIcon name="search" />
              </ChakraInputRightElement>
            </ChakraInputGroup>
          </ChakraFlex>
        </ChakraFlex>
        <ChakraFlex>
          <TextsTable data={essays ?? []} isLoading={isFetching} />
        </ChakraFlex>
      </ChakraFlex>
    </BasePage>
  );
};
