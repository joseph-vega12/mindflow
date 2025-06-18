import React, { FC, useEffect, useState } from 'react';
import {
  Button as ChakraButton,
  CloseButton as ChakraModalCloseButton,
  Modal as ChakraModal,
  ModalBody as ChakraModalBody,
  ModalContent as ChakraModalContent,
  ModalFooter as ChakraModalFooter,
  ModalHeader as ChakraModalHeader,
  ModalOverlay as ChakraModalOverlay,
  Text
} from '@chakra-ui/react';


import { groupBy, isEmpty } from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';

import { toast } from 'react-toastify';

import {
  BrainEyeTestResult,
  CustomEssay,
  CustomEssayDocumentWithId,
  EssayComprehensionAnswerOption,
  EssayDocumentWithId,
  PracticeTestResult,
  SpeedTestResult
} from 'types';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import {
  ComprehensionEvaluation,
  SpeedReadTest,
  SpeedReadTestConfig,
  SpeedReadTestSettings
} from 'components/common/Tests';
import { Timer } from 'components/common';

import { useAuthContext } from 'lib/firebase';
import { useTestResultList } from 'lib/firebase';
import { useTimer } from 'lib/customHooks';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const SpeedReadText: FC = () => {
  const { user, refetchUserDetails, isLoading: loadingUser } = useAuthContext();
  const { essayId } = useParams<{ essayId: string }>();
  const navigate = useNavigate();
  const [timeAgreementIsOpen, setTimeAgreementIsOpen] = useState<boolean>(false);

  const [started, setStarted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);
  const [essayTutorialId, setEssayTutorialId] = useState<string>('');

  const location = useLocation();

  const [wordSpeed, setWordSpeed] = useState<number>(0);
  const [testConfig, setTestConfig] = useState<SpeedReadTestConfig>({
    fontFamily: 'Roboto',
    fontSize: 16
  });

  const practiceAndBrainEyeTestResults = useTestResultList<(BrainEyeTestResult | PracticeTestResult)[]>([
    'brain-eye-coordination',
    'practice',
    'speed-read'
  ]);

  const blockedTests = groupBy(practiceAndBrainEyeTestResults, 'essayId');

  useEffect(() => {
    // @ts-ignore
    if (essay && !essay.preTest && blockedTests[essayId]) {
      navigate('/speed-read');
      // toast.error('You are not allowed use this text');
    }
  }, [blockedTests, essayId]);

  useEffect(() => {
    let backButtonPrevented: boolean = false;

    if (location.pathname === `/speed-read/${essayTutorialId}` && started) {
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
  }, [started]);

  const { data: essay, isLoading } = useQuery(
    ['essays', essayId],
    async () => {
      const systemEssayRef = doc(db, 'essays', essayId);
      const systemEssaySnap = await getDoc(systemEssayRef);

      if (systemEssaySnap.exists()) {
        return {
          ...systemEssaySnap.data(),
          id: systemEssaySnap.id
        } as EssayDocumentWithId;
      }

      const customEssayRef = doc(db, 'customEssays', essayId).withConverter<CustomEssayDocumentWithId>({
        fromFirestore: (doc) => ({
          id: doc.id,
          isCustom: true,
          ...(doc.data() as CustomEssayDocumentWithId)
        }),
        toFirestore: (doc: CustomEssayDocumentWithId) => doc
      });

      const customEssaySnap = await getDoc(customEssayRef);

      if (!isEmpty(customEssaySnap)) {
        return customEssaySnap.data();
      }
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSettled(data, error) {
        if (!data || error) {
          toast.error('An error has occurred, please contact us');
          navigate('/speed-read');
        }
      },
      onSuccess: (es) => {
        const value = Object.keys(es).find((key) => key === 'preTest');
        if (es[value]) {
          setEssayTutorialId(essayId);
        }
      }
    }
  );

  const { mutate: createSpeedTestResult, isSuccess } = useMutation(
    ['createSpeedTestResult'],
    async (testResult: SpeedTestResult) => {
      const docRef = await addDoc(collection(db, 'testResults'), testResult);
      return docRef;
    },
    {
      async onSuccess() {
        toast.success('Congratulations!');
        await refetchUserDetails();
      }
    }
  );

  useEffect(() => {
    if (isSuccess && !loadingUser) {
      // @ts-ignore
      if (essay?.preTest) {
        return navigate('/tutorial');
      }

      navigate('/speed-read');
    }
  }, [isSuccess, loadingUser]);

  const [time, { start: startTimer, stop: stopTimer }] = useTimer({
    interval: 1000,
    started: false
  });

  const onStartTest = (args: { fontFamily: string; fontSize: number }) => {
    if (!user.userDetails.activity.tutorial.finished) {
      setTimeAgreementIsOpen(true);
    } else {
      setStarted(true);
      startTimer();
    }
    setTestConfig(args);
  };

  const proceedToTestOnAgreement = () => {
    setStarted(true);
    startTimer();
  };

  const onFinishTest = () => {
    const timeInMinutes = time / (60 * 1000);

    const wordsPerMinute = Math.round((essay?.totalOfSentences ?? 0) / (timeInMinutes ?? 1));

    if (wordsPerMinute > 1000) {
      toast.error('This is way too fast!');
      return null;
    }

    stopTimer();
    setWordSpeed(wordsPerMinute);

    setFinished(true);
  };

  const onComprehensionInput = async (
    comprehensionAnswers?: EssayComprehensionAnswerOption[],
    comprehension?: number
  ) => {
    // @ts-ignore
    if (!essay?.isCustom) {
      const testSpeedResult: SpeedTestResult = {
        essayId,
        wordSpeed,
        type: 'speed-read',
        wordsNumber: essay?.totalOfSentences ?? 0,
        timestamp: +new Date(),
        // @ts-ignore
        category: essay?.category,

        user: {
          id: user?.uid ?? null,
          firstName: user?.userDetails?.firstName,
          lastName: user?.userDetails?.lastName,
          picture: user?.userDetails?.picture ?? null
        },
        userId: user?.uid ?? ''
      };

      if (comprehensionAnswers?.length) {
        testSpeedResult.comprehension = comprehension;
        testSpeedResult.comprehensionAnswers = comprehensionAnswers;
      }

      if (user?.userDetails?.businessId) {
        testSpeedResult.businessId = user?.userDetails?.businessId;
      }

      createSpeedTestResult(testSpeedResult);
    }

    // @ts-ignore
    if (essay?.preTest) {
      await refetchUserDetails();
      navigate('/tutorial');
    }
  };
  return (
    <BasePage spacing="md">
      <BasePageTitle
        showGoBack
        started={started}
        width="100%"
        display="flex"
        paddingBottom="md"
        alignItems="baseline"
        justifyContent="space-between"
        title="Speed Assessment"
      >
        <Timer time={time} px={0} />
      </BasePageTitle>
      {!started && <SpeedReadTestSettings essay={essay} isLoading={isLoading} onStart={onStartTest} />}
      {started && !finished && <SpeedReadTest essay={essay} testConfig={testConfig} onFinishTest={onFinishTest} />}
      {finished && (
        <ComprehensionEvaluation
          // @ts-ignore
          essay={essay}
          onSubmit={onComprehensionInput}
          onSkip={onComprehensionInput}
        />
      )}
      <ChakraModal isOpen={timeAgreementIsOpen} isCentered onClose={() => { }}>
        <ChakraModalOverlay />
        <ChakraModalContent borderRadius="sm">
          <ChakraModalHeader color="blue.500" fontWeight="bold" borderBottom="sm" borderBottomColor="gray.300">
            Confirmation
          </ChakraModalHeader>
          <ChakraModalBody>
            <Text color="gray.600">
              You'll only be able to take the SpeedReadTest one time in the Mindflow program. You will have {''}
              <Text as="span" fontWeight="bold">
                10 minutes {''}
              </Text>
              to complete this exercise. Please set aside some time to complete the test.
              <Text as="span" fontWeight="bold">
                Once you begin you will not be able to go back!
              </Text>
            </Text>
          </ChakraModalBody>
          <ChakraModalFooter borderTop="sm" borderTopColor="gray.300">
            <ChakraButton
              borderRadius="sm"
              marginRight="sm"
              colorScheme="gray"
              onClick={() => {
                setTimeAgreementIsOpen(false);
              }}
            >
              Cancel
            </ChakraButton>
            <ChakraButton
              borderRadius="sm"
              colorScheme="blue"
              onClick={() => {
                setTimeAgreementIsOpen(false);
                proceedToTestOnAgreement();
              }}
            >
              Proceed to Test
            </ChakraButton>
          </ChakraModalFooter>
        </ChakraModalContent>
      </ChakraModal>
    </BasePage>
  );
};
