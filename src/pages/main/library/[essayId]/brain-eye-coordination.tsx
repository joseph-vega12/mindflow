import React, { FC, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';

import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { BrainEyeTest } from 'components/common/Tests/BrainEye/BrainEyeTest';
import { BrainEyeTestConfig, BrainEyeTestSettings, ComprehensionEvaluation } from 'components/common/Tests';
import { Timer } from 'components/common';

import { BrainEyeTestResult, EssayComprehensionAnswerOption, EssayDocumentWithId, UserTestType } from 'types';
import { useAuthContext, useFirebaseContext } from 'lib/firebase';
import { useTimer } from 'lib/customHooks';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const BrainEyeCoordinationTest: FC<{}> = () => {
  const { essayId } = useParams<{ essayId: string; test: UserTestType }>();
  const navigate = useNavigate();

  const { user, refetchUserDetails } = useAuthContext();

  const [started, setStarted] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);

  useEffect(() => {
    if (finished) {
      onComprehensionInput();
      navigate('/library');
    }
  }, [finished]);

  const [testConfig, setTestConfig] = useState<BrainEyeTestConfig>({
    fontFamily: 'Roboto',
    fontSize: 16,
    wordSpeed: 250,
    wordsNumber: 2
  });

  const [time, { start: startTimer, stop: stopTimer }] = useTimer({
    interval: 1000,
    started: false
  });

  const { data: essay, isLoading } = useQuery(
    ['essays', essayId],
    async () => {
      const essay = await getDoc(doc(collection(db, 'essays'), essayId))

      return {
        ...essay.data(),
        id: essay.id
      } as EssayDocumentWithId;
    },
    {
      onSettled(essayDocument) {
        if (!essayDocument) {
          toast.error('This essay was not found');
          navigate('/library');
        }
      }
    }
  );

  const { mutate: createBrainEyeResult } = useMutation(
    ['createBrainEyeResult'],
    (testResult: BrainEyeTestResult) => addDoc(collection(db, 'testResults'), testResult),
    {
      async onSuccess() {
        toast.success('Congratulations!');
        await refetchUserDetails();
        navigate('/library');
      }
    }
  );

  const onStartTest = (args: BrainEyeTestConfig) => {
    setStarted(true);
    setTestConfig(args);
    startTimer();
  };

  const onFinishTest = () => {
    stopTimer();
    setFinished(true);
  };

  const onGiveUp = () => {
    toast.error('You were not able to finish this brain eye');
    navigate('/library');
  };

  const onComprehensionInput = async () => {
    const brainEyeResult: BrainEyeTestResult = {
      essayId,
      type: 'brain-eye-coordination',
      wordSpeed: testConfig.wordSpeed,
      wordsNumber: essay?.totalOfSentences ?? 0,
      timestamp: +new Date(),
      userId: user?.uid ?? '',
      category: essay?.category,
      user: {
        id: user?.uid ?? null,
        firstName: user?.userDetails?.firstName,
        lastName: user?.userDetails?.lastName,
        picture: user?.userDetails?.picture ?? null
      }
    };

    if (user?.userDetails?.businessId) {
      brainEyeResult.businessId = user?.userDetails?.businessId;
    }

    createBrainEyeResult(brainEyeResult);
  };

  return (
    <BasePage spacing="md" width="100%">
      <BasePageTitle
        showGoBack
        width="100%"
        display="flex"
        paddingBottom="md"
        alignItems="baseline"
        justifyContent="space-between"
        title="Brain-Eye Coordination"
      >
        <Timer time={time} px={0} />
      </BasePageTitle>
      {!started && <BrainEyeTestSettings essay={essay} isLoading={isLoading} onStart={onStartTest} />}
      {started && !finished && (
        <BrainEyeTest
          text={essay?.content ?? ''}
          testConfig={testConfig}
          onFinishTest={onFinishTest}
          onGiveUp={onGiveUp}
        />
      )}
    </BasePage>
  );
};
