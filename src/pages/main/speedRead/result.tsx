import { get } from 'lodash';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import React, { FC, useMemo, useState } from 'react';

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Heading,
  Text
} from '@chakra-ui/react';
import { HtmlRender } from 'components/common/HtmlRender';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { EssayQuestionResult } from 'components/Pages/SpeedRead/EssayQuestionResult';
import { InfoDescription, Timer } from 'components/common';

import { Essay, EssayDocumentWithId, EssayResultDocumentWithId, EssayResult } from 'types';
import { useAuthContext, useFirebaseContext } from 'lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const SpeedReadResult: FC<{}> = () => {
  const { user } = useAuthContext();
  const [totalOfCorrectQuestion, setTotalOfCorrectQuestion] = useState(0);
  const { essayId } = useParams<{ essayId: string }>();

  const essayResultQuery = useQuery(
    ['essays', essayId, 'result'],
    async () => {
      const essayResultQuery = query(collection(db, 'testResults').withConverter<EssayResultDocumentWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as EssayResult)
          };
        },
        toFirestore: (doc: EssayResultDocumentWithId) => doc
      }), where('userId', '==', user?.uid), where('essayId', '==', essayId))

      const essayResultDocs = await getDocs(essayResultQuery)

      const [result] = essayResultDocs.docs.map((d) => d.data());

      return result;
    },
    {
      refetchOnWindowFocus: false
    }
  );
  const essayQuery = useQuery(
    ['essayId', essayId],
    async () => {
      const essaySnap = await getDoc(doc(collection(db, 'essays')
        .withConverter<EssayDocumentWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as Essay)
            };
          },
          toFirestore: (doc: EssayDocumentWithId) => doc
        }), essayId))

      return essaySnap.data();
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  const questionsResults = useMemo(() => {
    let totalOfCorrect = 0;
    return (essayQuery.data?.questions ?? []).map((question, index) => {
      const answer = get(essayResultQuery.data, ['comprehensionAnswers', index]);

      const count =
        question.correctAnswer === essayResultQuery.data.comprehensionAnswers?.[index]
          ? (totalOfCorrect += 1)
          : totalOfCorrect;

      setTotalOfCorrectQuestion(count);

      return {
        answer,
        question,
        index
      };
    });
  }, [essayResultQuery.data, essayQuery.data]);

  const essayText = useMemo(() => {
    const text = get(essayQuery.data, ['textHtml']);
    return text;
  }, [essayQuery]);

  return (
    <BasePage width="100%" spacing="sm">
      <BasePageTitle
        showGoBack
        width="100%"
        display="flex"
        paddingBottom="md"
        alignItems="baseline"
        justifyContent="space-between"
        title="Speed Read Test"
      ></BasePageTitle>
      {essayResultQuery.data && (
        <>
          <Box display="flex" flexDir="column" alignItems="center">
            <Heading textStyle="title-with-border-bottom" mb={4}>
              Results
            </Heading>

            <Heading fontSize="xl">Your Score</Heading>

            <Box my={4}>
              <CircularProgress value={totalOfCorrectQuestion ?? 0} color="green.400" size="100px" max={3}>
                <CircularProgressLabel max={3}>{totalOfCorrectQuestion ?? 0}</CircularProgressLabel>
              </CircularProgress>
            </Box>
            <Box my={4}>
              <Text as="span" pl={1} color="black" fontWeight="400">
                {essayQuery.data?.name}
              </Text>
              <InfoDescription
                label="Diagnostic"
                description={essayQuery.data?.name}
                isLoading={essayQuery.isLoading}
                fontSize="sm"
              />
              <InfoDescription label="Questions" fontSize="sm" isLoading={essayQuery.isLoading} />
            </Box>
          </Box>
          <Divider my={4} />
          <Box width={{ lg: '70%', md: '100%' }} mx="auto">
            <Box>
              <Accordion allowToggle bg="blue.100">
                <AccordionItem>
                  <h2>
                    <AccordionButton fontWeight="500">
                      <Box flex="1" textAlign="left">
                        Read Essay
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <HtmlRender
                      html={`
              <style>
              .htmlRender {
                  text-indent: 25px;
                  font-size: 16px;
                }
              </style>
              <div class='htmlRender'>
                ${essayText}
              </div>
            `}
                    />
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Box>
            {questionsResults.map((questionResult, index) => {
              return <EssayQuestionResult {...questionResult} key={index} my={4} />;
            })}
          </Box>
        </>
      )}
    </BasePage>
  );
};
