import React, { FC, useEffect, useState } from 'react';

import { Box, Flex } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { DiagnosticForm } from 'components/Pages/Diagnostic';
import { HtmlRender, Loading, Timer } from 'components/common';

import {
  Diagnostic,
  DiagnosticAnswerOption,
  DiagnosticDocumentWithId,
  DiagnosticResult,
  DiagnosticResultDocumentWithId
} from 'types';
import { useAuthContext } from 'lib/firebase';
import { useTimer } from 'lib/customHooks';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

interface Props { }

export const DiagnosticTest: FC<Props> = () => {
  const { user, refetchUserDetails } = useAuthContext();

  const navigate = useNavigate();

  const { diagnosticId } = useParams<{ diagnosticId: string }>();
  const queryClient = useQueryClient();

  const [timeIsOver, setTimeIsOver] = useState<boolean>(false);
  const [tutorialDiagnosticId, setTutorialDiagnosticId] = useState<string>();

  const [time] = useTimer({
    started: true
  });

  useEffect(() => {
    let backButtonPrevented: boolean = false;
    if (location.pathname === `/diagnostics/${tutorialDiagnosticId}`) {
      history.pushState(null, document.title, window.location.href);

      const popStateListener = (event) => {
        if (backButtonPrevented === false) {
          history.pushState(null, document.title, window.location.href);
          toast.error('You can not go back during a test.');
        } else {
          window.removeEventListener('popstate', popStateListener);
        }
      };
      window.addEventListener('popstate', popStateListener);
    }
    return () => {
      backButtonPrevented = true;
    };
  }, [timeIsOver, tutorialDiagnosticId]);

  const diagnosticQuery = useQuery(
    ['diagnostics', diagnosticId],
    async () => {
      const diagnosticDoc = await getDoc(doc(
        collection(db, 'diagnostics')
          .withConverter<DiagnosticDocumentWithId>({
            fromFirestore: (doc) => {
              return {
                id: doc.id,
                ...(doc.data() as Diagnostic)
              };
            },
            toFirestore: (doc: DiagnosticDocumentWithId) => doc
          }), diagnosticId)
      )

      return diagnosticDoc.data();
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: true,
      onSuccess: (diagnostic) => {
        if (diagnostic.order === 0) {
          setTutorialDiagnosticId(diagnostic.id);
        }
      }
    }
  );

  const createDiagnosticResult = useMutation(
    async () => {
      const defaultDiagnosticResult = {
        finished: false,

        diagnosticId: diagnosticQuery.data.id,

        name: diagnosticQuery.data.name,
        category: diagnosticQuery.data.category,
        order: diagnosticQuery.data.order,

        answers: [],
        answersTime: [],

        userId: user?.uid,
        user: {
          id: user?.uid,
          firstName: user?.userDetails?.firstName ?? '',
          lastName: user?.userDetails?.lastName ?? '',
          email: user?.userDetails?.email ?? '',
          picture: user?.userDetails?.picture ?? ''
        },
        timestamp: +new Date()
      } as DiagnosticResult;

      if (user?.userDetails?.businessId) {
        defaultDiagnosticResult.businessId = user?.userDetails?.businessId;
      }

      addDoc(collection(db, 'diagnosticResults'), defaultDiagnosticResult);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(['diagnosticResults', diagnosticId]);
      }
    }
  );

  const diagnosticResultQuery = useQuery(
    ['diagnosticResults', diagnosticId],
    async () => {
      const diagnosticResultsQuery = query(
        collection(db, 'diagnosticResults')
          .withConverter<DiagnosticResultDocumentWithId>({
            fromFirestore: (doc) => {
              return {
                id: doc.id,
                ...(doc.data() as DiagnosticResult)
              };
            },
            toFirestore: (doc: DiagnosticResultDocumentWithId) => doc
          }), where('diagnosticId', '==', diagnosticId),
        where('userId', '==', user?.uid)
      )

      const diagnosticResultDocs = await getDocs(diagnosticResultsQuery);
      const [resultSnap] = diagnosticResultDocs.docs;
      const result = resultSnap?.data();

      return result ?? null;
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      onSuccess(result: DiagnosticResultDocumentWithId | null) {
        if (!result) {
          createDiagnosticResult.mutate();
          return;
        }

        if (result.finished) {
          toast.info('You already done this diagnostic!');
          return navigate(`/diagnostics/${result?.diagnosticId}/result`);
        }

        return result;
      }
    }
  );

  const { mutate: updateDiagnosticResult } = useMutation(
    ['updateDiagnosticResult'],
    async (data: DiagnosticResultDocumentWithId) => {
      const firestore = getFirestore();

      const { id, ...updateData } = data as DiagnosticResultDocumentWithId;


      if (!id) {
        throw new Error('Missing diagnosticResult ID');
      }

      const docRef = doc(firestore, 'diagnosticResults', id);
      await updateDoc(docRef, updateData);
    },
    {
      async onSuccess() {
        refetchUserDetails();
      }
    }
  );

  const handleSaveQuestion = async ({
    answers,
    answersTime,
    finished
  }: {
    answers: DiagnosticAnswerOption[];
    answersTime: number[];
    finished: boolean;
  }) => {
    if (!diagnosticResultQuery.data) {
      return toast.error('An error has occurred');
    }

    const diagnosticResult: DiagnosticResult = {
      ...diagnosticResultQuery.data,
      finished,
      answers,
      answersTime
    };

    updateDiagnosticResult(diagnosticResult);
  };

  const handleSaveAndFinish = async ({
    answers,
    answersTime
  }: {
    answers: DiagnosticAnswerOption[];
    answersTime: number[];
  }) => {
    await handleSaveQuestion({
      answers,
      answersTime,
      finished: true
    });

    toast.success('Congratulations!');

    if (diagnosticQuery.data?.order === 0) {
      return navigate('/tutorial');
    }

    navigate(`/diagnostics/${diagnosticId}/result`);
  };

  const handleTimeIsOver = async ({
    answers,
    answersTime
  }: {
    answers: DiagnosticAnswerOption[];
    answersTime: number[];
  }) => {
    if (!timeIsOver) {
      setTimeIsOver(true);

      await handleSaveQuestion({
        answers,
        answersTime,
        finished: true
      });

      toast.info('Time is over! The diagnostic is finished and the results are saved.');

      if (diagnosticQuery.data?.order === 0) {
        return navigate('/tutorial');
      }

      navigate(`/diagnostics/${diagnosticId}/result`);
    }
  };

  return (
    <BasePage spacing="md">
      <Loading width="100%" height="100%" flexDirection="column" isLoading={diagnosticQuery.isLoading || timeIsOver}>
        <BasePageTitle d="flex" width="100%" title={diagnosticQuery.data?.name ?? ''}>
          <Box d="flex" justifyContent="flex-end" flexGrow={1}>
            <Timer time={time} />
          </Box>
        </BasePageTitle>
        <Flex justifyContent="space-between">
          <Box width={['100%', '45%']} mb={1}>
            <HtmlRender
              html={`
              <style>
                .htmlRender {
                  text-indent: 1em;
                }
              </style>
              <div class='htmlRender'>
                ${diagnosticQuery.data?.text.replace(/<strong>[\s\S]*?<\/strong>/g, '')}
              </div>
            `}
            />
          </Box>
          <Box width={['100%', '45%']}>
            <DiagnosticForm
              time={time}
              diagnostic={diagnosticQuery.data}
              onFinish={handleSaveAndFinish}
              onSaveQuestion={handleSaveQuestion}
              onTimeIsOver={handleTimeIsOver}
            />
          </Box>
        </Flex>
      </Loading>
    </BasePage>
  );
};
