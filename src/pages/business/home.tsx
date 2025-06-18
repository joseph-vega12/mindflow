import { get } from 'lodash';
import React, { FC } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Grid as ChakraGrid,
  Text as ChakraText,
  useDisclosure
} from '@chakra-ui/react';

import { BusinessUsersAcitiviesCounters, TestResult, TestResultWithId } from 'types';

import { ActiveStudentsChart, AverageCard } from 'components/Pages/Business/Home';
import { ActivitiesResume, Rank, StudentsRanking } from 'components/analytics';
import { BaseCard } from 'components/common';
import { BuyLicensesModal } from 'components/Pages/Business/Home/BuyLicensesModal';
import { LicensesModal } from 'components/Pages/Business/Home/LicensesModal';

import { useAuthContext, useFirebaseContext } from 'lib/firebase';
import { useBusiness } from 'lib/customHooks';
import { useQuery } from 'react-query';

export const Home: FC = () => {
  const { user } = useAuthContext();
  const { firestore } = useFirebaseContext();

  const licensesModal = useDisclosure();
  const buyLicensesModal = useDisclosure();

  const { businessId, businessQuery } = useBusiness();
  const defaultCounters: BusinessUsersAcitiviesCounters = {
    brainEyeCoordination: 0,
    diagnostics: 0,
    practices: 0,
    speedRead: 0,
    videos: 0
  };

  const businessTestResults = useQuery(
    ['business', user?.uid, 'testResults'],
    async () => {
      const testResultsSnap = await firestore
        .collection('testResults')
        .where('timestamp', '<', +new Date())
        .where('businessId', '==', businessId)
        .orderBy('timestamp', 'desc')
        .limit(100)
        .withConverter<TestResultWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as TestResult)
            };
          },
          toFirestore: (doc: TestResult) => doc
        })
        .get();

      return testResultsSnap.docs.map((d) => ({
        ...d.data(),
        id: d.id
      }));
    },
    {
      enabled: businessQuery.isSuccess,
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  // useEffect(() => {
  // const inactiveLicenses = [];
  // const usersMap = _.keyBy(usersJson, 'id');
  // for (const license of licensesJson) {
  //   if (license.status === ELicenseStatus.INACTIVE) {
  //     inactiveLicenses.push(license);
  //     continue;
  //   }
  //   const user = usersMap[license.user?.id];
  //   if (!license.type) {
  //     licensesWithoutType.push({
  //       license: {
  //         ...license,
  //         orderId: ELicenseType.BETA_USER
  //       },
  //       user
  //     });
  //     continue;
  //   }
  //   def.push({ license, user });
  // }
  // console.log({ inactiveLicenses, licensesWithoutType, def });
  // }, []);

  const getSpeedReadingHistory = () => {
    if (!businessTestResults.data) return [];

    return businessTestResults.data
      ?.map((testResult) => {
        if (testResult?.type !== 'speed-read') return null;
        return {
          value: testResult.wordSpeed,
          user: testResult.user
        };
      })
      .filter((result) => result);
  };

  const getComprehensionHistory = () => {
    if (!businessTestResults.data) return [];
    return businessTestResults.data
      ?.map((testResult) => {
        if (!testResult?.comprehensionAnswers?.length) return null;
        return {
          value: `${testResult.comprehension}%`,
          user: testResult.user
        };
      })
      .filter((result) => result);
  };

  // @ts-ignore
  const speedReadingResults: Rank[] = getSpeedReadingHistory();
  // @ts-ignore
  const comprehensionResults: Rank[] = getComprehensionHistory();
  const businessCounters = get(businessQuery?.data, ['activity', 'counters'], defaultCounters);
  const businessStats = get(businessQuery?.data, ['activity', 'stats']);

  return (
    <ChakraGrid width="100%" gridGap="xl" gridTemplateColumns="2.5fr 3fr 3fr">
      <ChakraFlex gridGap="xl" height="100%" flexDirection="column">
        <BaseCard width="100%" title="Students Activities Resume">
          <ActivitiesResume
            finishedBrainEye={businessCounters.brainEyeCoordination}
            finishedDiagnostics={businessCounters.diagnostics}
            finishedPractices={businessCounters.practices}
            finishedSpeedReads={businessCounters.speedRead}
            finishedVideos={businessCounters.videos}
          />
        </BaseCard>
        <BaseCard width="100%" title="Licenses">
          <ChakraFlex width="100%" justifyContent="center" alignItems="center" gridGap="lg">
            <ChakraText color="blue.500" fontSize="4xl">
              {/* {activeLicenses?.length} */}
            </ChakraText>
            <ChakraText color="blue.500" fontSize="xl">
              Active licenses
            </ChakraText>
          </ChakraFlex>
          <ChakraFlex justifyContent="space-between" mt="md" flexDir="column">
            <ChakraButton borderRadius="sm" colorScheme="green" onClick={licensesModal.onOpen}>
              See Licenses
            </ChakraButton>
            <ChakraButton
              borderRadius="sm"
              colorScheme="blue"
              my="md"
              onClick={buyLicensesModal.onOpen}
              disabled={!businessQuery.data?.isBuyingEnabled}
            >
              Buy licenses
            </ChakraButton>
          </ChakraFlex>

          <LicensesModal isOpen={licensesModal.isOpen} onClose={licensesModal.onClose} />
          <BuyLicensesModal isOpen={buyLicensesModal.isOpen} onClose={buyLicensesModal.onClose} />
        </BaseCard>
      </ChakraFlex>
      <ChakraFlex width="100%" height="100%" gridGap="xl" flexDirection="column">
        <ChakraGrid width="100%" gridRowGap="md" gridColumnGap="md" gridTemplateColumns="repeat(2, 1fr)">
          {/* <AverageCard description="Average Level" color="red" icon="star" value="-" /> */}
          <AverageCard
            value={businessStats?.averageComprehension ? Math.floor(businessStats.averageComprehension) : '-'}
            description="Average Comprehension"
            color="red"
            icon="check"
          />
          <AverageCard
            value={businessStats?.averageWordSpeed ? Math.floor(businessStats?.averageWordSpeed) : '-'}
            description="Average Speed Reading"
            color="blue"
            icon="view"
          />
          {/* <AverageCard value="-" description="Average improvement" color="blue" icon="bar-chart" /> */}
        </ChakraGrid>
        <BaseCard width="100%" maxH="400px" pb="md" overflow="hidden" height="100%" title="Comprehension History">
          <StudentsRanking ranking={comprehensionResults} />
        </BaseCard>
      </ChakraFlex>
      <ChakraFlex width="100%" maxH="400px" pb="md" overflow="hidden" height="100%" gridGap="xl" flexDirection="column">
        <BaseCard width="100%" height="100%" title="Speed Reading History">
          <StudentsRanking ranking={speedReadingResults} />
        </BaseCard>
        <BaseCard width="100%" height="100%" title="Comprehension and Word speed per Date">
          {/* <ActiveStudentsChart data={[]} /> */}
        </BaseCard>
      </ChakraFlex>
    </ChakraGrid>
  );
};
