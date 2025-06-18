import React, { FC, useMemo } from 'react';

import {
  Flex as ChakraFlex,
  FormControl as ChakraFormControl,
  FormLabel as ChakraFormLabel,
  Input as ChakraInput
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import _, { find, get, sortBy } from 'lodash';

import { ActivitiesListing } from 'components/Pages/Business/Activities';
import { ActivitiesResume } from 'components/analytics';
import { AverageCard } from 'components/Pages/Business/Home';
import { BaseCard } from 'components/common';
import { BasePage, BasePageTitle } from 'components/layout/Pages';
import { StudentDiagnosticResults } from 'components/Pages/Owner';
import { UserEvolutionChart } from 'components/Pages/Home/UserEvolutionChart';

import { formatTimestamp } from 'lib/utils';
import { useFirebaseContext } from 'lib/firebase';

import {
  Diagnostic,
  DiagnosticDocumentWithId,
  DiagnosticResult,
  DiagnosticResultDocumentWithId,
  FeedActivity,
  FeedActivityWithId,
  UserDetails,
  UserDetailsWithId,
  whereDidYouHearAboutUsOptions
} from 'types';
import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const StudentDetails: FC = () => {
  const { firestore } = useFirebaseContext();
  const { studentId } = useParams<{ studentId: string }>();

  const userQuery = useQuery(
    ['owner', 'students', studentId],
    async () => {
      const userSnap =
        await getDoc(doc(collection(db, 'users')
          .withConverter<UserDetailsWithId>({
            fromFirestore: (doc) => {
              return {
                id: doc.id,
                ...(doc.data() as UserDetails)
              };
            },
            toFirestore: (doc: UserDetailsWithId) => doc
          }), studentId
        ))

      return userSnap.data();
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: true
    }
  );

  const feedQuery = useQuery(
    ['owner', 'students', studentId, 'feed'],
    async () => {
      const feed = query(
        collection(db, 'feed')
          .withConverter<FeedActivityWithId>({
            fromFirestore: (doc) => {
              return {
                id: doc.id,
                ...(doc.data() as FeedActivity)
              };
            },
            toFirestore: (doc: FeedActivityWithId) => doc
          }), where('user.id', '==', studentId), limit(20)
      )

      const feedDocs = await getDocs(feed)
      const feedEvents = feedDocs.docs.map((doc) => doc.data());

      return sortBy(feedEvents, 'timestamp').reverse();
    },
    {
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  );

  const diagnosticsQuery = useQuery(
    ['owner', 'diagnostics'],
    async () => {
      const diagnosticsQuery = query(
        collection(db, 'diagnostics')
          .withConverter<DiagnosticDocumentWithId>({
            fromFirestore: (doc) => {
              const diagnostic = doc.data() as Diagnostic;

              return {
                id: doc.id,
                ...diagnostic
              };
            },
            toFirestore: (doc: DiagnosticDocumentWithId) => doc
          }), orderBy('order', 'asc')
      )

      const diagnosticsDocs = await getDocs(diagnosticsQuery)
      const diagnostics = diagnosticsDocs.docs.map((doc) => doc.data() as DiagnosticDocumentWithId);
      return diagnostics;
    },
    {
      enabled: userQuery.isSuccess,
      refetchOnMount: false,
      refetchOnWindowFocus: true
    }
  );

  const diagnosticResultsQuery = useQuery(
    ['owner', 'students', studentId, 'diagnosticResults'],
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
          }), where('category', '==', userQuery.data?.testType),
        where('userId', '==', studentId)
      )

      const diagnosticDocs = await getDocs(diagnosticResultsQuery)
      return diagnosticDocs.docs.map((doc) => doc.data());
    },
    {
      enabled: userQuery.isSuccess,
      refetchOnMount: true,
      refetchOnWindowFocus: true
    }
  );

  const queriesLoading =
    userQuery.isLoading || feedQuery.isLoading || diagnosticsQuery.isLoading || diagnosticResultsQuery.isLoading;

  const diagnosticResultsList = useMemo(() => {
    if (queriesLoading) return [];

    const diagnostics = _.sortBy(_.filter(diagnosticsQuery.data, { category: userQuery.data?.testType }), 'order');

    return diagnostics.map((diagnostic) => {
      const result = find(diagnosticResultsQuery.data, { diagnosticId: diagnostic.id });

      return {
        diagnostic,
        result
      };
    });
  }, [diagnosticsQuery.data, diagnosticResultsQuery.isLoading, queriesLoading, userQuery.data]);

  const user = userQuery.data;
  const userStats = get(user, ['activity', 'stats']);
  const userCounters = get(user, ['activity', 'counters']);

  return (
    <BasePage spacing="md">
      <BasePageTitle title="Student Details" paddingX="lg" paddingBottom="lg" showGoBack={true} />
      <ChakraFlex gridGap="xl" flexDirection="column">
        <ChakraFlex gridGap="lg">
          <ChakraFormControl>
            <ChakraFormLabel>First Name</ChakraFormLabel>
            <ChakraInput borderRadius="sm" borderColor="gray.400" isDisabled={true} value={user?.firstName} />
          </ChakraFormControl>
          <ChakraFormControl>
            <ChakraFormLabel>Last Name</ChakraFormLabel>
            <ChakraInput borderRadius="sm" borderColor="gray.400" isDisabled={true} value={user?.lastName} />
          </ChakraFormControl>
          <ChakraFormControl>
            <ChakraFormLabel>Program</ChakraFormLabel>
            <ChakraInput borderRadius="sm" borderColor="gray.400" isDisabled={true} value={user?.testType} />
          </ChakraFormControl>
          <ChakraFormControl>
            <ChakraFormLabel>E-mail</ChakraFormLabel>
            <ChakraInput borderRadius="sm" borderColor="gray.400" isDisabled={true} value={user?.email} />
          </ChakraFormControl>
        </ChakraFlex>
        <ChakraFlex gridGap="lg">
          <ChakraFormControl>
            <ChakraFormLabel>License Status</ChakraFormLabel>
            <ChakraInput borderRadius="sm" borderColor="gray.400" isDisabled={true} value={user?.license?.status} />
          </ChakraFormControl>

          <ChakraFormControl>
            <ChakraFormLabel>Start Date</ChakraFormLabel>
            <ChakraInput
              borderRadius="sm"
              borderColor="gray.400"
              isDisabled={true}
              value={formatTimestamp(user?.license.purchaseDate)}
            />
          </ChakraFormControl>

          <ChakraFormControl>
            <ChakraFormLabel>Expiration Date</ChakraFormLabel>
            <ChakraInput
              borderRadius="sm"
              borderColor="gray.400"
              isDisabled={true}
              value={formatTimestamp(user?.license.expirationDate)}
            />
          </ChakraFormControl>

          <ChakraFormControl>
            <ChakraFormLabel>Last seen</ChakraFormLabel>
            <ChakraInput
              borderRadius="sm"
              borderColor="gray.400"
              isDisabled={true}
              value={formatTimestamp(user?.lastSeen)}
            />
          </ChakraFormControl>
        </ChakraFlex>

        {!!user?.whereDidYouHearAboutUs && (
          <ChakraFlex gridGap="lg">
            <ChakraFormControl>
              <ChakraFormLabel>Where did you hear about us?</ChakraFormLabel>
              <ChakraInput
                borderRadius="sm"
                borderColor="gray.400"
                isDisabled={true}
                value={whereDidYouHearAboutUsOptions[user?.whereDidYouHearAboutUs]}
              />
            </ChakraFormControl>

            {!!user?.whereDidYouHearAboutUsObservation && (
              <ChakraFormControl>
                <ChakraFormLabel>Where/Who</ChakraFormLabel>
                <ChakraInput
                  borderRadius="sm"
                  borderColor="gray.400"
                  isDisabled={true}
                  value={user?.whereDidYouHearAboutUsObservation}
                />
              </ChakraFormControl>
            )}
          </ChakraFlex>
        )}

        <ChakraFlex width="100%" gridGap="lg" flexDirection="column">
          <ChakraFlex gridGap="lg">
            <AverageCard value={user?.level ?? 1} color="red" description="Level" icon="star" />
            <AverageCard
              value={Math.round(userStats?.comprehension?.averageComprehension) ?? '-'}
              color="red"
              description="Average Comprehension"
              icon="check"
            />
            {/* <AverageCard value="0" color="orange" description="Days Till Completion" icon="calendar" /> */}
            <AverageCard
              value={Object.keys(userStats?.videos ?? {}).length}
              color="orange"
              description="Videos Watched"
              icon="videos_watched"
            />
          </ChakraFlex>

          <ChakraFlex gridGap="lg">
            <AverageCard
              value={userStats?.wordSpeed?.bestWordSpeed ?? '-'}
              color="blue"
              description="Best Reading Speed"
              icon="view"
            />
            <AverageCard
              value={userStats?.wordSpeed?.firstWordSpeed ?? '-'}
              color="blue"
              description="Initial Reading Speed"
              icon="flag"
            />
            {/* <AverageCard value="-" color="blue" description="Improvement" icon="bar-chart" /> */}
            <AverageCard
              value={Math.round(userStats?.wordSpeed?.averageWordSpeed) ?? '-'}
              color="blue"
              description="Average Reading Speed"
              icon="view"
            />
          </ChakraFlex>
        </ChakraFlex>
        <ChakraFlex height="100%" gridGap="lg">
          <BaseCard width="fit-content" title="Student Activities Resume">
            <ActivitiesResume
              finishedBrainEye={userCounters?.brainEyeCoordination ?? 0}
              finishedDiagnostics={userCounters?.diagnostics ?? 0}
              finishedPractices={userCounters?.practices ?? 0}
              finishedSpeedReads={userCounters?.speedRead ?? 0}
              finishedVideos={userCounters?.videos ?? 0}
            />
          </BaseCard>
          <BaseCard title="Reading Speed and Comprehension History" width="100%">
            <ChakraFlex width="100%" height="250px">
              <UserEvolutionChart stats={user?.activity?.stats} />
            </ChakraFlex>
          </BaseCard>
        </ChakraFlex>
        <BaseCard title="Diagnostics">
          <StudentDiagnosticResults data={diagnosticResultsList} isLoading={diagnosticResultsQuery.isLoading} />
        </BaseCard>
        <BaseCard>
          <ActivitiesListing data={feedQuery.data ?? []} user={user} />
        </BaseCard>
      </ChakraFlex>
    </BasePage>
  );
};
