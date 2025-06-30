import React, { FC, useMemo, useState } from 'react';

import { Box, BoxProps, Button, Grid, Heading, SimpleGrid, Spinner, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import _, { get } from 'lodash';

import {
  DiagnosticDocumentWithId,
  DiagnosticResult,
  DiagnosticResultDocumentWithId,
  EssayDocumentWithId,
  UserTutorial
} from 'types';
import { Icon } from 'components/common';

import { TutorialVideoType } from './TutorialContainer';

import { DiagnosticConfirmationModal } from '../Diagnostic';
import { db } from 'lib/firebase/firebaseInit';
import { toast } from 'react-toastify';
import { useAuthContext } from 'lib/firebase';
import { useQuery } from 'react-query';
import { collection, DocumentData, getDocs, query, where, WithFieldValue } from 'firebase/firestore';

interface Props {
  tutorial: UserTutorial;
  handleStartVideo: (videoType: TutorialVideoType) => void;

  diagnostic: DiagnosticDocumentWithId;
  essay: EssayDocumentWithId;
  wordSpeed?: number;

  isLoading?: boolean;
}

export const TutorialTimeline: FC<Props> = ({
  diagnostic,
  essay,
  handleStartVideo,
  isLoading,
  tutorial,
  wordSpeed
}) => {
  const { user, isLoading: isLoadingUser } = useAuthContext();

  const [isDiagnosticConfirmOpen, setIsDiagnosticConfirmOpen] = useState(false);

  const navigate = useNavigate();

  const diagnosticResultsQuery = useQuery(
    ['diagnosticResults'],
    async () => {
      const diagnosticRef = collection(db, 'diagnosticResults');

      const diagnosticResultsQuery = query(
        diagnosticRef,
        where('category', '==', user.userDetails.testType),
        where('userId', '==', user.uid),
        where('order', '==', 0)
      ).withConverter<DiagnosticResultDocumentWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as DiagnosticResult)
          };
        },
        toFirestore: (doc: DiagnosticResultDocumentWithId) => {
          return { ...doc };
        },
      })

      const diagnosticResultsSnap = await getDocs(diagnosticResultsQuery);

      const diagnosticResults = diagnosticResultsSnap.docs.map((doc) => doc.data());

      return diagnosticResults;
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  );

  const handleSpeedReadClick = () => {
    navigate(`/speed-read/${essay.id}`);
    toast.info('Now we are going to test your speed reading skills');
  };

  const handleDiagnosticClick = () => {
    navigate(`/diagnostics/${diagnostic.id}`);
    toast.info('Now we are going to start our diagnostic test');
  };

  if (isLoading || isLoadingUser) {
    return (
      <Box h="50%" position="sticky" top="0" display="flex" justifyContent="center" alignItems="center">
        <Spinner boxSize="100px" thickness="4px" speed="0.8s" emptyColor="gray.100" color="blue.800" />
      </Box>
    );
  }

  let scorePercentage = null;

  if (diagnosticResultsQuery.data.length !== 0) {
    console.log(diagnosticResultsQuery?.data, `data from here`)
    scorePercentage = _.find(diagnosticResultsQuery?.data)?.result?.scorePercentage;
  }

  return (
    <Grid templateColumns="9fr 3fr">
      <Box display="flex" flexDirection="column" top="0" position="sticky" alignSelf="flex-start" height="auto">
        <TutorialTimelineItem
          idx={1}
          tutorial={tutorial}
          tutorialKey="welcomeVideo"
          onClick={() => handleStartVideo('welcome')}
          dependsOn={[]}
        >
          <Text>
            Watch the <b>"Welcome to MindFlow program"</b> video on the left side.
          </Text>
        </TutorialTimelineItem>

        <TutorialTimelineItem
          idx={2}
          tutorial={tutorial}
          tutorialKey="speedReadingTest"
          dependsOn={['welcomeVideo']}
          onClick={handleSpeedReadClick}
        >
          <Icon name="speed-reading-test" size="14" mr={4} />

          <Text fontWeight="bold" fontSize="xl">
            Speed
            <br /> Reading <br /> Test
          </Text>
        </TutorialTimelineItem>

        <TutorialTimelineItem
          idx={3}
          tutorial={tutorial}
          tutorialKey="diagnosticTest"
          dependsOn={['welcomeVideo', 'speedReadingTest']}
          onClick={() => setIsDiagnosticConfirmOpen(true)}
        >
          <Icon name="diagnostic-test" size="14" mr={4} />

          <Text fontWeight="bold" fontSize="xl">
            Diagnostic <br />
            Test
          </Text>
        </TutorialTimelineItem>

        <DiagnosticConfirmationModal
          title="Confirmation Message"
          isOpen={isDiagnosticConfirmOpen}
          onClose={() => setIsDiagnosticConfirmOpen(false)}
          onConfirmation={() => handleDiagnosticClick()}
        />

        <TutorialTimelineItem
          idx={4}
          tutorial={tutorial}
          tutorialKey="tutorialVideo"
          dependsOn={['welcomeVideo', 'speedReadingTest', 'diagnosticTest']}
          onClick={() => handleStartVideo('tutorial')}
        >
          <Text>
            Watch the video
            <br />
            <b>"How does MindFlow work?"</b>
          </Text>
        </TutorialTimelineItem>

        <TutorialTimelineItem
          idx={5}
          tutorial={tutorial}
          isLastItem={true}
          dependsOn={['welcomeVideo', 'speedReadingTest', 'diagnosticTest', 'tutorialVideo']}
          onClick={() => navigate('/')}
        >
          <Icon name="complete-onboarding" size="14" mr={4} />

          <Text fontWeight="bold" fontSize="xl">
            Complete
            <br /> Onboarding
          </Text>
        </TutorialTimelineItem>
      </Box>

      <Box
        display="flex"
        flexDirection="column"
        top="0"
        position="sticky"
        alignSelf="flex-start"
        height="auto"
        pt="40"
        mt="6"
        textAlign="center"
      >
        {wordSpeed && (
          <>
            <Heading as="h2" size="16" fontWeight="normal">
              Your Reading Speed is:
            </Heading>
            <Heading as="h2" color="green.500" size="lg" fontWeight="300" mb="2">
              {wordSpeed} wpm
            </Heading>
          </>
        )}
        {scorePercentage && (
          <>
            <Heading as="h2" size="16" fontWeight="normal" mt="10" mb="1">
              Diagnostic Result:
            </Heading>
            <Heading as="h2" color="green.500" size="xl" fontWeight="300" mb="2">
              {scorePercentage}%
            </Heading>
            <Button
              variant="outline"
              colorScheme="blue"
              size="sm"
              onClick={() => navigate(`/diagnostics/${diagnostic.id}/result`)}
            >
              Check result
            </Button>
          </>
        )}
      </Box>
    </Grid>
  );
};
interface TutorialTimelineItemProps extends BoxProps {
  idx: number;
  tutorial: UserTutorial;
  tutorialKey?: keyof UserTutorial;
  isLastItem?: boolean;
  dependsOn?: string[];
}
const TutorialTimelineItem: FC<TutorialTimelineItemProps> = ({
  children,
  idx,
  isLastItem,
  tutorial,
  tutorialKey,
  dependsOn,
  onClick,
  ...rest
}) => {
  const isCompleted = useMemo(() => {
    if (!tutorialKey) return false;

    return tutorial[tutorialKey];
  }, [tutorial, tutorialKey]);

  const isNextStep = useMemo(() => {
    return !isCompleted && dependsOn?.every((key) => tutorial[key]);
  }, [dependsOn, isCompleted, tutorial]);
  const bgColor = useMemo(() => {
    if (isCompleted) return 'green.500';
    if (isNextStep) return 'blue.500';

    return 'gray.500';
  }, [isCompleted]);

  return (
    <Box
      mb={10}
      d="flex"
      alignItems="center"
      _after={
        !isLastItem && {
          content: "''",
          position: 'absolute',
          left: '20px',
          height: '60%',
          top: '85%',
          border: '2px dashed #94D4D6'
        }
      }
      position="relative"
      color="white"
      cursor={isNextStep && onClick ? 'pointer' : 'default'}
      onClick={isNextStep ? onClick : undefined}
      {...rest}
    >
      <Box
        height="45px"
        width="45px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mr="lg"
        fontWeight="bold"
        borderRadius="100%"
        bgColor={bgColor}
        fontSize="2xl"
      >
        {idx}
      </Box>

      <Box
        width="300px"
        height="135px"
        display="flex"
        alignItems="center"
        py="7"
        px="12"
        bgColor={bgColor}
        borderRadius="3xl"
        shadow="lg"
        fontSize="lg"
      >
        {children}
      </Box>
    </Box>
  );
};
