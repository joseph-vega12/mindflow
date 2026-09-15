import React, { FC, useEffect, useMemo, useState } from 'react';

import { get } from 'lodash';
import { SimpleGrid } from '@chakra-ui/react';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from 'react-query';

import { useNavigate } from 'react-router-dom';

import { Diagnostic, DiagnosticDocumentWithId, Essay, EssayDocumentWithId, UserTutorial } from 'types';

import { BasePage } from 'components/layout/Pages';

import { TutorialInstructions, TutorialTimeline } from './index';
import { useAuthContext } from 'lib/firebase';
import { collection, doc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

interface Props {}

export type TutorialVideoType = 'welcome' | 'tutorial';

const EMPTY_TUTORIAL: UserTutorial = {
  welcomeVideo: false,
  speedReadingTest: false,
  diagnosticTest: false,
  tutorialVideo: false,
  finished: false
};

export const TutorialContainer: FC<Props> = ({}) => {
  const { isLoading: isLoadingUser, refetchUserDetails, user } = useAuthContext();

  const navigate = useNavigate();

  const remoteTutorial = useMemo(
    () => get(user, ['userDetails', 'activity', 'tutorial'], EMPTY_TUTORIAL) as UserTutorial,
    [user]
  );

  // Optimistic overlay so timeline unlocks immediately after video/test completion,
  // without waiting on a slow/stale user refetch.
  const [optimisticTutorial, setOptimisticTutorial] = useState<Partial<UserTutorial>>({});

  useEffect(() => {
    setOptimisticTutorial((prev) => {
      const next = { ...prev };
      (Object.keys(EMPTY_TUTORIAL) as (keyof UserTutorial)[]).forEach((key) => {
        if (remoteTutorial[key]) {
          delete next[key];
        }
      });
      return next;
    });
  }, [remoteTutorial]);

  const tutorial = useMemo(
    () => ({
      ...EMPTY_TUTORIAL,
      ...remoteTutorial,
      ...optimisticTutorial
    }),
    [remoteTutorial, optimisticTutorial]
  );

  const userDifficultLevel = user?.userDetails?.difficultLevel;
  const testType = user?.userDetails?.testType ?? '';

  const updateTutorialKeyMutation = useMutation(async (update: keyof UserTutorial | Partial<UserTutorial>) => {
    if (!user?.uid) {
      throw new Error('User is required to update tutorial progress');
    }

    const patch = typeof update === 'string' ? { [update]: true } : update;

    setOptimisticTutorial((prev) => ({ ...prev, ...patch }));

    const tutorialPatch = Object.entries(patch).reduce((acc, [key, value]) => {
      acc[`activity.tutorial.${key}`] = value as boolean;
      return acc;
    }, {} as Record<string, boolean>);

    await updateDoc(doc(db, 'users', user.uid), tutorialPatch);

    try {
      await refetchUserDetails();
    } catch (e) {
      console.error('Failed to refetch user details after tutorial update', e);
    }
  });

  const pretestEssayQuery = useQuery(
    ['pretest', 'essay', userDifficultLevel],
    async () => {
      const essayRef = collection(db, 'essays');

      const preTestQuery = query(
        essayRef.withConverter<EssayDocumentWithId>({
          fromFirestore: (doc) => ({
            id: doc.id,
            ...(doc.data() as EssayDocumentWithId)
          }),
          toFirestore: (doc: EssayDocumentWithId) => doc
        }),
        where('preTest', '==', true),
        where('category', '==', userDifficultLevel),
        limit(1)
      );

      const snapshot = await getDocs(preTestQuery);
      const [essay] = snapshot.docs.map((doc) => doc.data());

      if (!essay) {
        throw new Error(`A pretest was not found for this request ${userDifficultLevel}`);
      }

      return essay;
    },
    {
      refetchOnWindowFocus: false,
      onError(e) {
        toast.error("We've had a problem, please contact our support!");
        console.error(e);

        navigate('/');
      }
    }
  );

  const diagnosticQuery = useQuery(
    ['pretest', 'diagnostic', userDifficultLevel],
    async () => {
      const diagnosticsQuery = query(
        collection(db, 'diagnostics').withConverter<DiagnosticDocumentWithId>({
          fromFirestore: (doc) => ({
            id: doc.id,
            ...(doc.data() as Diagnostic)
          }),
          toFirestore: (doc: Diagnostic) => doc
        }),
        where('category', '==', testType),
        where('order', '==', 0),
        limit(1)
      );

      const snapshot = await getDocs(diagnosticsQuery);

      const [diagnostic] = snapshot.docs.map((doc) => doc.data());

      return diagnostic;
    },
    {
      refetchOnWindowFocus: false,
      onError(e) {
        toast.error("We've had a problem, please contact our support!");
        console.error(e);

        navigate('/');
      }
    }
  );

  const checkTestResult = useQuery(
    ['testResult', 'user', userDifficultLevel],
    async () => {
      const testResultQuery = query(
        collection(db, 'testResults'),
        where('userId', '==', user?.uid),
        where('essayId', '==', pretestEssayQuery.data?.id)
      );

      const snapshot = await getDocs(testResultQuery);

      return snapshot.empty ? null : snapshot.docs[0].data();
    },
    {
      enabled: !!pretestEssayQuery.data,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      onSuccess(result) {
        if (result && !tutorial.speedReadingTest) {
          updateTutorialKeyMutation.mutate('speedReadingTest');
        }
      }
    }
  );

  const checkDiagnosticResult = useQuery(
    ['diagnostic', 'user', userDifficultLevel],
    async () => {
      const diagnosticResultQuery = query(
        collection(db, 'diagnosticResults'),
        where('userId', '==', user?.uid),
        where('diagnosticId', '==', diagnosticQuery.data?.id)
      );

      const snapshot = await getDocs(diagnosticResultQuery);

      return snapshot.empty ? null : snapshot.docs[0].data();
    },
    {
      enabled: !!diagnosticQuery.data,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      onSuccess(result) {
        if (result && !tutorial.diagnosticTest) {
          updateTutorialKeyMutation.mutate('diagnosticTest');
        }
      }
    }
  );

  const handleStartVideo = (videoType: TutorialVideoType) => {
    const videoEl = document.getElementById(videoType);

    if (videoEl) {
      // I tried to find a better way, but the lib doesnt seem to have a way to play a video
      const [playerEl] = videoEl.getElementsByClassName('jw-icon jw-icon-display jw-button-color jw-reset');

      if (playerEl) {
        playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // @ts-ignore
        playerEl.click();

        return;
      }
    }

    toast.info(`You can proceed and play the ${videoType} video!`);
  };

  const onVideoFinish = (videoType: TutorialVideoType) => {
    if (videoType === 'welcome' && !tutorial.welcomeVideo) {
      updateTutorialKeyMutation.mutate('welcomeVideo');
      return;
    }

    if (videoType === 'tutorial' && !tutorial.tutorialVideo) {
      updateTutorialKeyMutation.mutate({ tutorialVideo: true });
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      if (!tutorial.finished) {
        await updateTutorialKeyMutation.mutateAsync({ finished: true });
      }
      navigate('/');
    } catch (e) {
      toast.error("We couldn't complete onboarding. Please try again.");
      console.error(e);
    }
  };

  const isLoading =
    pretestEssayQuery.isLoading || isLoadingUser || checkDiagnosticResult.isLoading || checkTestResult.isLoading;

  return (
    <BasePage boxShadow="none" spacing="md">
      <SimpleGrid columns={2} spacing={10}>
        <TutorialInstructions onVideoFinish={onVideoFinish} />
        <TutorialTimeline
          isLoading={isLoading}
          handleStartVideo={handleStartVideo}
          handleCompleteOnboarding={handleCompleteOnboarding}
          tutorial={tutorial}
          diagnostic={diagnosticQuery.data}
          essay={pretestEssayQuery.data}
          wordSpeed={checkTestResult.data?.wordSpeed}
        />
      </SimpleGrid>
    </BasePage>
  );
};
