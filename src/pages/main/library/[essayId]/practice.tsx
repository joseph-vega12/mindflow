import React, { FC, useEffect, useState } from 'react';

import { Box } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';

import { EssayDocumentWithId, PracticeTestResult } from 'types';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { PracticeTest, PracticeTestConfig, PracticeTestSettings } from 'components/common/Tests';
import { Timer } from 'components/common';

import { useAuthContext, useFirebaseContext } from 'lib/firebase';
import { useCountdown } from 'lib/customHooks';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const PracticePageTest: FC = () => {
  const { essayId } = useParams<{ essayId: string }>();
  const navigate = useNavigate();

  const [started, setStarted] = useState<boolean>(false);

  const [testConfig, setTestConfig] = useState<PracticeTestConfig>({
    numberOfRounds: 5,
    practiceType: 'regular',
    numberOfColumns: 1,
    hopping: 'wide',
    fontFamily: 'Roboto',
    fontSize: 18,
    soundUrl: 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/sport_air_horn_reverb.mp3?_=1',
    targetLines: 5
  });

  const { state: countdownState, actions: countdownActions } = useCountdown({
    countdownTime: testConfig.practiceType === 'regular' ? 60_000 : 80_000,
    interval: 1000
  });

  const { user, refetchUserDetails } = useAuthContext();

  const essayQuery = useQuery(
    ['essays', essayId],
    async () => {
      const essay = await getDoc(doc(collection(db, 'essays'), essayId))

      return {
        ...essay.data(),
        id: essay.id
      } as EssayDocumentWithId;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      onSettled(essayDocument) {
        if (!essayDocument) {
          toast.error('This essay was not found');
          navigate('/library');
        }
      }
    }
  );

  const createTestResultMutation = useMutation(
    async (testResult: PracticeTestResult) => await addDoc(collection(db, 'testResults'), testResult),
    {
      async onSuccess() {
        toast.success('Congratulations!');
        await refetchUserDetails();
        navigate('/library');
      }
    }
  );

  const onStartTest = (args: PracticeTestConfig) => {
    setTestConfig(args);
    countdownActions.reset(args.practiceType === 'regular' ? 60_000 : 80_000);
    setStarted(true);
  };

  const onFinishTest = async () => {
    if (createTestResultMutation.isLoading) return;

    countdownActions.pause();

    const practiceTestResult: PracticeTestResult = {
      essayId,
      type: 'practice',
      timestamp: +new Date(),
      category: essayQuery.data?.category,
      numberOfRounds: testConfig.numberOfRounds,
      practiceType: testConfig.practiceType,
      numberOfColumns: testConfig.numberOfColumns,
      targetLines: testConfig.targetLines,
      businessId: null,
      user: {
        id: user?.uid ?? null,
        firstName: user?.userDetails?.firstName,
        lastName: user?.userDetails?.lastName,
        picture: user?.userDetails?.picture ?? null
      },
      userId: user?.uid ?? ''
    };

    if (user?.userDetails?.businessId) {
      practiceTestResult.businessId = user?.userDetails?.businessId;
    }

    createTestResultMutation.mutate(practiceTestResult);
  };

  const onGiveUp = () => {
    countdownActions.pause();
    toast.error('You were not able to finish this practice');
    navigate('/library');
  };

  useEffect(() => {
    const hornAudio = new Audio(testConfig.soundUrl);

    if (countdownState.time === 1_000) {
      hornAudio.play();
    }
  }, [countdownState.time]);

  return (
    <BasePage spacing="md">
      <BasePageTitle
        showGoBack
        width="100%"
        display="flex"
        title="Practice"
        paddingBottom="md"
        alignItems="baseline"
        justifyContent="space-between"
      >
        <Timer time={countdownState.time} px={0} />
      </BasePageTitle>
      {!started && (
        <PracticeTestSettings essay={essayQuery.data} isLoading={essayQuery.isLoading} onStart={onStartTest} />
      )}
      <Box width={testConfig.hopping === 'wide' ? '100%' : '60%'} mx="auto">
        {started && (
          <PracticeTest
            isLoading={createTestResultMutation.isLoading}
            countdownState={countdownState}
            countdownActions={countdownActions}
            essay={essayQuery.data}
            testConfig={testConfig}
            onFinishTest={onFinishTest}
            onGiveUp={onGiveUp}
          />
        )}
      </Box>
    </BasePage>
  );
};
