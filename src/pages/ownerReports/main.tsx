import React, { FC, useEffect, useMemo, useState } from 'react';

import { Flex as ChakraFlex, Grid as ChakraGrid, Text as ChakraText, GridItem } from '@chakra-ui/react';
import { colors } from 'theme/foundations';
import { useFormContext, useWatch } from 'react-hook-form';
import { useQuery } from 'react-query';

import { AverageCard } from 'components/Pages/Business/Home';
import { BaseCard } from 'components/common';
import { StudentsRanking } from 'components/analytics';

import { toast } from 'react-toastify';

import { useFirebaseContext } from 'lib/firebase';

import { AnalyticDateSnapshot } from 'types/firestoreDb/Analytics';
import {
  Business,
  BusinessDocumentWithId,
  DiagnosticResult,
  DiagnosticResultDocumentWithId,
  FeedActivity,
  FeedActivityWithId,
  UserDetails,
  UserDetailsWithId,
  UserDocumentWithId
} from 'types';

import { AnalyticsFilterForm, getSummedAnalyticSnapshot } from 'components/Pages/Owner';
import { ReportsPanelFilters } from 'components/Pages/Owner/OwnerReportsPanel';
import { StudentReadingImprovementData } from 'components/analytics/StudentReadingImprovementData';
import {
  TestTypeBarChart,
  TimeToImproveVerticalCard,
  BusinessActivitiesResume,
  BusinessStudentHourLineChart,
  BusinessStudentRanking
} from 'components/Pages/BusinessDashboard';
import { isArray } from 'lodash';
import { date } from 'joi';
import { collection, collectionGroup, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const ReportsMainPanel: FC = () => {
  const { firestore } = useFirebaseContext();
  const { getValues } = useFormContext();

  const today: Date = new Date();
  const yearAgo = new Date(today.getTime() - 365 * 86400000);
  const [selectedDates, setSelectedDates] = useState<Date[]>([yearAgo, new Date()]);
  const [dateChanged, setDateChanged] = useState(false);

  const handleSelectedDates = (selectedDates) => {
    setSelectedDates(selectedDates);
    setDateChanged(true);
  };

  const selectedDatesTimestamp = selectedDates.map((date) => date.getTime());
  const [startDateTimestamp, endDateTimestamp] = selectedDatesTimestamp;

  const values = getValues();

  // We will need to accomadate this according to the selected businesses etc...
  const businessQuery = useQuery(
    ['businesses'],
    async () => {
      const businessSnap =
        collection(db, 'business')
          .withConverter<BusinessDocumentWithId>({
            fromFirestore: (doc) => {
              return {
                id: doc.id,
                ...(doc.data() as Business)
              };
            },
            toFirestore: (doc: Business) => doc
          })

      const businessDocs = await getDocs(businessSnap)
      const businesses = businessDocs.docs.map((doc) => doc.data());
      return businesses;
    },
    {
      refetchOnMount: false,
      onError: (err: Error) => {
        toast.error(err?.message);
      }
    }
  );

  const selectedBusinesses = values.selectedClients?.map((client) => client.value);
  const selectedTests = values.selectedTests?.map((test) => test.value);
  const searchStudents = values.searchStudents;

  const studentsQuery = useQuery(
    ['students'],
    async () => {
      const constraints = [];

      if (isArray(selectedTests) && selectedTests.length > 0) {
        constraints.push(where('testType', 'in', selectedTests));
      }

      constraints.push(orderBy('firstName'));

      const converter = {
        fromFirestore: (snapshot) => ({
          id: snapshot.id,
          ...(snapshot.data() as UserDetails)
        }),
        toFirestore: (user: UserDetails) => user
      };

      const usersQuery = query(
        collection(db, 'users').withConverter(converter),
        ...constraints
      );

      const usersSnap = await getDocs(usersQuery);
      let students = usersSnap.docs.map((doc) => doc.data());

      if (isArray(selectedBusinesses) && selectedBusinesses.length > 0) {
        students = students.filter((student) => selectedBusinesses.includes(student.businessId));
      }

      if (searchStudents && searchStudents.length > 0) {
        const searchLower = searchStudents.toLowerCase();
        students = students.filter(
          (student) =>
            student.firstName.toLowerCase().includes(searchLower) ||
            student.lastName.toLowerCase().includes(searchLower)
        );
      }

      if (dateChanged) {
        students = students.filter(
          (student) =>
            student.license &&
            student.license.activationDate >= startDateTimestamp &&
            student.license.activationDate <= endDateTimestamp
        );
      }

      return students;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  const refetchAllQueries = () => {
    studentsQuery.refetch();
    getAllDiagnosticResults.refetch();
    getAllDiagnostics.refetch();
    getAllWatchedVideos.refetch();
    getAllPractices.refetch();
    getAllSpeedRead.refetch();
    getAllBrainEye.refetch();
  };

  useEffect(() => {
    refetchAllQueries();
  }, [selectedTests, selectedBusinesses, selectedDates, searchStudents]);

  let getAverageStudentLevel = 0;
  let getAverageStudentComprehension = 0;
  let getAverageStudentWordSpeed = 0;

  if (Array.isArray(studentsQuery.data) && studentsQuery.data.length > 0) {
    getAverageStudentLevel =
      studentsQuery.data?.reduce((acc, curr) => acc + curr.level, 0) / studentsQuery.data?.length;

    getAverageStudentComprehension =
      studentsQuery.data?.reduce((acc, curr) => acc + curr.activity.stats.comprehension.averageComprehension, 0) / 100;

    getAverageStudentWordSpeed =
      studentsQuery.data?.reduce((acc, curr) => acc + curr.activity.stats.wordSpeed.averageWordSpeed, 0) / 100;
  }

  const getAverageImprovement = useMemo(() => {
    let averageImprovement = 0;
    const arrAverageImprovement = [];
    if (Array.isArray(studentsQuery.data) && studentsQuery.data.length > 0) {
      for (const user of studentsQuery.data) {
        arrAverageImprovement.push(
          user.activity?.stats.wordSpeed.bestWordSpeed - user.activity?.stats.wordSpeed.firstWordSpeed
        );
      }
    }

    if (arrAverageImprovement.length > 0) {
      averageImprovement =
        Math.abs(arrAverageImprovement.reduce((acc, current) => acc + current, 0)) / arrAverageImprovement.length;
    }

    return averageImprovement;
  }, [studentsQuery.data]);

  let highestComprehension = 0;
  let lowestComprehension = Number.POSITIVE_INFINITY;

  if (Array.isArray(studentsQuery.data)) {
    for (const user of studentsQuery.data) {
      const averageComprehension = user.activity.stats.comprehension.averageComprehension;

      if (averageComprehension > highestComprehension) {
        highestComprehension = averageComprehension;
      }

      if (averageComprehension < lowestComprehension && averageComprehension > 0) {
        lowestComprehension = averageComprehension;
      }
    }
  }

  if (lowestComprehension === Number.POSITIVE_INFINITY) {
    lowestComprehension = 0;
  }

  const getAllDiagnostics = useQuery(
    ['owner', 'reports', 'diagnostics'],
    async () => {
      let diagnosticSnap;
      const feedRef = collection(db, 'feed');
      let filterQuery;

      if (isArray(selectedBusinesses) && selectedBusinesses.length > 0) {
        filterQuery = where('businessId', 'in', selectedBusinesses);
      }

      diagnosticSnap = query(feedRef
        .withConverter<FeedActivityWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as FeedActivity)
            };
          },
          toFirestore: (doc: FeedActivityWithId) => doc
        }), filterQuery && filterQuery, where('type', '==', 'diagnostic')
      )

      const diagnosticDocs = await getDocs(diagnosticSnap)
      const diagnostic = diagnosticDocs.docs.map((doc) => doc.data());
      return diagnostic;
    },
    {
      refetchOnMount: false,
      onError: (err: Error) => {
        toast.error(err?.message);
      }
    }
  );

  const getAllDiagnosticResults = useQuery(
    ['owner', 'reports', 'diagnosticResults'],
    async () => {
      const categories = ['gmat', 'high school', 'sat', 'shsat', 'gre'];

      const diagnosticQuery = query(
        collection(db, 'diagnosticResults').withConverter<DiagnosticResultDocumentWithId>({
          fromFirestore: (doc) => ({
            id: doc.id,
            ...(doc.data() as DiagnosticResult),
          }),
          toFirestore: (doc: DiagnosticResultDocumentWithId) => doc,
        }),
        where('category', 'in', categories)
      );

      const diagnosticDocs = await getDocs(diagnosticQuery);

      let diagnosticResults = diagnosticDocs.docs.map((doc) => doc.data());

      if (isArray(selectedBusinesses) && selectedBusinesses.length > 0) {
        diagnosticResults = diagnosticResults.filter((result) =>
          selectedBusinesses.includes(result.businessId)
        );
      }

      const categorizedResults: Record<string, DiagnosticResult[]> = {};

      categories.forEach((category) => {
        categorizedResults[category] = diagnosticResults.filter(
          (result) => result.category === category
        );
      });


      return categorizedResults;
    },
    {
      refetchOnMount: false,
      onError: (err: Error) => {
        toast.error(err?.message);
      }
    }
  );

  const getAllSpeedRead = useQuery(
    ['owner', 'reports', 'speedRead'],
    async () => {
      let speedTestSnap;
      let filterQuery;

      const feedRef = collection(db, 'feed')

      if (isArray(selectedBusinesses) && selectedBusinesses.length > 0) {
        filterQuery = where('businessId', 'in', selectedBusinesses);
      }


      speedTestSnap = await query(feedRef
        .withConverter<FeedActivityWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as FeedActivity)
            };
          },
          toFirestore: (doc: FeedActivityWithId) => doc
        }), filterQuery && filterQuery, where('type', '==', 'speed-read')
      )

      const speedReadDocs = await getDocs(speedTestSnap)
      const speedRead = speedReadDocs.docs.map((doc) => doc.data());

      return speedRead;
    },
    {
      refetchOnMount: false,
      onError: (err: Error) => {
        toast.error(err?.message);
      }
    }
  );

  const getAllPractices = useQuery(
    ['owner', 'reports', 'practices'],
    async () => {
      let practicesTestSnap;
      let filterQuery;
      const feedRef = collection(db, 'feed')

      if (isArray(selectedBusinesses) && selectedBusinesses.length > 0) {
        filterQuery = where('businessId', 'in', selectedBusinesses);
      }


      practicesTestSnap = query(feedRef
        .withConverter<FeedActivityWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as FeedActivity)
            };
          },
          toFirestore: (doc: FeedActivityWithId) => doc
        }), filterQuery && filterQuery, where('type', '==', 'practice')
      )

      const practicesDocs = await getDocs(practicesTestSnap)
      const practices = practicesDocs.docs.map((doc) => doc.data());
      return practices;
    },
    {
      refetchOnMount: false,
      onError: (err: Error) => {
        toast.error(err?.message);
      }
    }
  );

  const getAllBrainEye = useQuery(
    ['owner', 'reports', 'brain-eye-coordination'],
    async () => {
      let brainEyeSnap;
      const feedRef = collection(db, 'feed');
      let filterQuery;

      if (isArray(selectedBusinesses) && selectedBusinesses.length > 0) {
        filterQuery = where('businessId', 'in', selectedBusinesses);
      }

      brainEyeSnap = await query(
        feedRef
          .withConverter<FeedActivityWithId>({
            fromFirestore: (doc) => {
              return {
                id: doc.id,
                ...(doc.data() as FeedActivity)
              };
            },
            toFirestore: (doc: FeedActivityWithId) => doc
          }), filterQuery && filterQuery, where('type', '==', 'brain-eye-coordination')
      )
      const brainEyeDocs = await getDocs(brainEyeSnap)
      const brainEye = brainEyeDocs.docs.map((doc) => doc.data());
      return brainEye;
    },
    {
      refetchOnMount: false,
      onError: (err: Error) => {
        toast.error(err?.message);
      }
    }
  );

  const getAllWatchedVideos = useQuery(
    ['owner', 'reports', 'video'],
    async () => {
      let watchedVideosSnap;
      let filterQuery;
      const feedRef = collection(db, 'feed');

      if (isArray(selectedBusinesses) && selectedBusinesses.length > 0) {
        filterQuery = where('businessId', 'in', selectedBusinesses);
      }

      watchedVideosSnap = query(feedRef
        .withConverter<FeedActivityWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as FeedActivity)
            };
          },
          toFirestore: (doc: FeedActivityWithId) => doc
        }), filterQuery && filterQuery, where('type', '==', 'video'))

      const watchedVideoDocs = await getDocs(watchedVideosSnap)
      const watchedVideos = watchedVideoDocs.docs.map((doc) => doc.data());
      return watchedVideos;
    },
    {
      refetchOnMount: false,
      onError: (err: Error) => {
        toast.error(err?.message);
      }
    }
  );

  const averageDiagnosticsPerStudent = useMemo(() => {
    if (!getAllDiagnostics.data) {
      return 0;
    }

    const totalDiagnostics = getAllDiagnostics.data.length;
    const totalStudents = studentsQuery.data?.length || 0;

    if (totalStudents === 0) {
      return 0;
    }

    const average = totalDiagnostics / totalStudents;
    return Number(average.toFixed());
  }, [getAllDiagnostics.data, studentsQuery.data]);

  const averageSpeedTestPerStudent = useMemo(() => {
    if (!getAllSpeedRead.data) {
      return 0;
    }

    const totalSpeed = getAllSpeedRead.data.length;
    const totalStudents = studentsQuery.data?.length || 0;

    if (totalStudents === 0) {
      return 0;
    }

    const average = totalSpeed / totalStudents;
    return Number(average.toFixed());
  }, [getAllSpeedRead.data, studentsQuery.data]);

  const averagePracticesPerStudent = useMemo(() => {
    if (!getAllPractices.data) {
      return 0;
    }

    const totalSpeed = getAllPractices.data.length;
    const totalStudents = studentsQuery.data?.length || 0;

    if (totalStudents === 0) {
      return 0;
    }

    const average = totalSpeed / totalStudents;
    return Number(average.toFixed());
  }, [getAllPractices.data, studentsQuery.data]);

  const averageBrainEyePerStudent = useMemo(() => {
    if (!getAllBrainEye.data) {
      return 0;
    }

    const totalSpeed = getAllBrainEye.data.length;
    const totalStudents = studentsQuery.data?.length || 0;

    if (totalStudents === 0) {
      return 0;
    }

    const average = totalSpeed / totalStudents;
    return Number(average.toFixed());
  }, [getAllBrainEye.data, studentsQuery.data]);

  const averageVideosPerStudent = useMemo(() => {
    if (!getAllWatchedVideos.data) {
      return 0;
    }

    const totalSpeed = getAllWatchedVideos.data.length;
    const totalStudents = studentsQuery.data?.length || 0;

    if (totalStudents === 0) {
      return 0;
    }

    const average = totalSpeed / totalStudents;
    return Number(average.toFixed());
  }, [getAllWatchedVideos.data, studentsQuery.data]);

  const highestScoresPerCategory = useMemo(() => {
    const scores = [];

    if (getAllDiagnosticResults.data) {
      const color = ['orange', 'blue', 'red', 'teal', 'green'];
      let colorIndex = 0;

      for (const [category, diagnostics] of Object.entries(getAllDiagnosticResults.data)) {
        let latestDiagnostic = null;

        for (const diagnostic of diagnostics) {
          const timestamp = diagnostic.timestamp;
          const scorePercentage = diagnostic?.result?.scorePercentage || 0;

          if (category === 'shsat' && scorePercentage === 0) {
            continue; // Skip diagnostics with scorePercentage 0 for "shsat" category
          }

          if (!latestDiagnostic || timestamp > latestDiagnostic.timestamp) {
            latestDiagnostic = diagnostic;
          }
        }

        const score = {
          name: category.toLocaleUpperCase(),
          score: latestDiagnostic?.result?.scorePercentage || 0,
          fill: colors[color[colorIndex]][500]
        };

        scores.push(score);

        colorIndex = (colorIndex + 1) % color.length;
      }
    }

    return scores;
  }, [getAllDiagnosticResults.data]);

  const averageSpeedReadImprovement = useMemo(() => {
    const scores = [];
    const testTypesToShow = ['gmat', 'sat', 'shsat', 'gre'];

    if (studentsQuery.data) {
      const color = ['orange', 'blue', 'red', 'teal', 'green'];
      let colorIndex = 0;

      const testTypeData = {};

      studentsQuery.data.forEach((item) => {
        const testType = item.testType;
        const averageWordSpeed = item.activity?.stats.wordSpeed.averageWordSpeed;

        if (testTypesToShow.includes(testType) && averageWordSpeed !== undefined) {
          if (!testTypeData[testType]) {
            testTypeData[testType] = {
              sum: averageWordSpeed,
              count: 1
            };
          } else {
            testTypeData[testType].sum += averageWordSpeed;
            testTypeData[testType].count += 1;
          }
        }
      });

      testTypesToShow.forEach((testType, index) => {
        if (testTypeData[testType] && testTypeData[testType].count > 0) {
          const averageBestWordSpeed = testTypeData[testType].sum / testTypeData[testType].count;

          const score = {
            name: testType.toUpperCase(),
            score: Number(averageBestWordSpeed.toFixed()), // Round to 2 decimal places
            fill: colors[color[colorIndex]][500]
          };

          scores.push(score);
          colorIndex = (colorIndex + 1) % color.length;
        }
      });
    }

    return scores;
  }, [studentsQuery.data]);

  const averageSpeedReadImprovementStartingBest = useMemo(() => {
    const scores = [];
    const testTypesToShow = ['gmat', 'sat', 'shsat', 'gre'];

    if (studentsQuery.data) {
      const testTypeData = {};
      studentsQuery.data.forEach((item) => {
        const testType = item.testType;
        const averageWordSpeed = item.activity?.stats.wordSpeed.averageWordSpeed;
        const bestWordSpeed = item.activity?.stats.wordSpeed.bestWordSpeed;

        if (testTypesToShow.includes(testType) && averageWordSpeed !== undefined && bestWordSpeed !== undefined) {
          if (!testTypeData[testType]) {
            testTypeData[testType] = {
              averageWordSpeedSum: averageWordSpeed,
              averageWordSpeedCount: 1,
              bestWordSpeed: bestWordSpeed
            };
          } else {
            testTypeData[testType].averageWordSpeedSum += averageWordSpeed;
            testTypeData[testType].averageWordSpeedCount += 1;
            testTypeData[testType].bestWordSpeed = Math.max(testTypeData[testType].bestWordSpeed, bestWordSpeed);
          }
        }
      });

      testTypesToShow.forEach((testType) => {
        const testData = testTypeData[testType];
        if (testData && testData.averageWordSpeedCount > 0) {
          const averageBestWordSpeed = testData.averageWordSpeedSum / testData.averageWordSpeedCount;

          const score = {
            name: testType.toUpperCase(),
            StartingSpeed: Number(averageBestWordSpeed.toFixed()), // Round to 2 decimal places
            BestSpeed: testData.bestWordSpeed
          };

          scores.push(score);
        }
      });
    }

    return scores;
  }, [studentsQuery.data]);

  const highestSpeedImprovementData = useMemo(() => {
    let student = '';
    let bestImprovement = 0;
    let firstWordSpeed = 0;
    let bestWordSpeed = 0;
    let speedReadingImprovementPercentage = 0;
    let scores = {};

    if (studentsQuery.data) {
      studentsQuery.data.forEach((item) => {
        const studentBestImprovement =
          item.activity?.stats.wordSpeed.firstWordSpeed - item.activity?.stats.wordSpeed.bestWordSpeed;
        if (
          bestImprovement <
          item.activity?.stats.wordSpeed.firstWordSpeed - item.activity?.stats.wordSpeed.bestWordSpeed
        ) {
          student = item.firstName + ' ' + item.lastName;
          firstWordSpeed = item.activity?.stats.wordSpeed.firstWordSpeed;
          bestWordSpeed = item.activity?.stats.wordSpeed.bestWordSpeed;
          bestImprovement =
            item.activity?.stats.wordSpeed.firstWordSpeed - item.activity?.stats.wordSpeed.bestWordSpeed;
          speedReadingImprovementPercentage = 100 - (bestWordSpeed * 100) / firstWordSpeed;
        }
      });

      scores = {
        student: student,
        firstWordSpeed: firstWordSpeed,
        bestWordSpeed: bestWordSpeed,
        speedReadingImprovement: bestImprovement,
        speedReadingImprovementPercentage: speedReadingImprovementPercentage.toFixed(2)
      };
    }
    return scores;
  }, [studentsQuery.data]);

  const studentsPerTestType = useMemo(() => {
    const testTypeCounts = {};
    const testTypesToShow = ['gmat', 'sat', 'shsat', 'gre'];
    const color = ['orange', 'blue', 'red', 'teal', 'green'];

    studentsQuery.data?.forEach((item) => {
      const testType = item.testType;
      if (testType && testTypesToShow.includes(testType)) {
        const uppercaseTestType = testType;
        testTypeCounts[uppercaseTestType] = (testTypeCounts[uppercaseTestType] || 0) + 1;
      }
    });

    return Object.entries(testTypeCounts).map(([name, students], index) => ({
      name,
      score: students,
      fill: colors[color[index]][500] // Use modulo to cycle through colors
    }));
  }, [studentsQuery.data]);

  const highestReadingSpeedImprovement = useMemo(() => {
    const scores = [];
    const testTypesToShow = ['gmat', 'sat', 'shsat', 'gre'];
    const color = ['orange', 'blue', 'red', 'teal', 'green'];

    if (studentsQuery.data) {
      const testTypeData = {};

      studentsQuery.data.forEach((item) => {
        const testType = item.testType;
        const startingSpeed = item.activity?.stats.wordSpeed.firstWordSpeed;
        const currentSpeed = item.activity?.stats.wordSpeed.lastWordSpeed;

        if (testTypesToShow.includes(testType) && startingSpeed !== undefined && currentSpeed !== undefined) {
          if (!testTypeData[testType]) {
            testTypeData[testType] = {
              highestSpeedImprovement: startingSpeed - currentSpeed
            };
          } else {
            const speedImprovement = startingSpeed - currentSpeed;
            testTypeData[testType].highestSpeedImprovement = Math.max(
              testTypeData[testType].highestSpeedImprovement,
              speedImprovement
            );
          }
        }
      });

      testTypesToShow.forEach((testType, index) => {
        const testData = testTypeData[testType];
        if (testData) {
          const speedImprovement = testData.highestSpeedImprovement;

          const score = {
            name: testType.toUpperCase(),
            score: speedImprovement,
            fill: colors[color[index]][500]
          };

          scores.push(score);
        }
      });
    }

    return scores;
  }, [studentsQuery.data]);

  const sortedUsersByComprehensionRanking = useMemo(() => {
    const users = [];
    const testTypesToShow = ['gmat', 'sat', 'shsat', 'gre'];

    if (studentsQuery.data) {
      studentsQuery.data.forEach((item) => {
        const testType = item.testType;
        const averageComprehension = item.activity?.stats.comprehension.lastComprehension;

        if (testTypesToShow.includes(testType) && averageComprehension !== undefined) {
          users.push({ ...item, rank: item.activity?.stats.comprehension.lastComprehension });
        }
      });

      users.sort(
        (a, b) =>
          b.activity?.stats.comprehension.averageComprehension - a.activity?.stats.comprehension.averageComprehension
      );
    }

    return users;
  }, [studentsQuery.data]);

  const sortedUsersBySpeedReadRanking = useMemo(() => {
    const users = [];
    const testTypesToShow = ['gmat', 'sat', 'shsat', 'gre'];

    if (studentsQuery.data) {
      studentsQuery.data.forEach((item) => {
        const testType = item.testType;
        const averageSpeedReadRanking = item.activity?.stats.wordSpeed.lastWordSpeed;

        if (testTypesToShow.includes(testType) && averageSpeedReadRanking !== undefined) {
          users.push({ ...item, rank: item.activity?.stats.wordSpeed.lastWordSpeed });
        }
      });

      users.sort((a, b) => b.activity?.stats.wordSpeed.lastWordSpeed - a.activity?.stats.wordSpeed.lastWordSpeed);
    }

    return users;
  }, [studentsQuery.data]);

  return (
    <ChakraGrid height="100%" gridRowGap="md" gridColumnGap="md" gridTemplateColumns="300px 1fr 1fr">
      <ChakraFlex flexDirection="column">
        <ReportsPanelFilters selectedDates={selectedDates} setSelectedDates={handleSelectedDates} />
      </ChakraFlex>
      <ChakraGrid
        gridRowGap="md"
        gridColumnGap="md"
        gridColumn={{ lg: '2/3', md: '1/4' }}
        gridTemplateColumns="repeat(2, 1fr)"
      >
        <AverageCard
          width="100%"
          value={studentsQuery.data?.length}
          icon="students"
          description="Total Students"
          color="blue"
        />
        <AverageCard
          width="100%"
          value={businessQuery.data?.length}
          icon="company"
          description="Total Companies"
          color="blue"
        />
        <AverageCard
          width="100%"
          value={Math.floor(getAverageStudentLevel)}
          icon="star"
          description="Average Level"
          color="red"
        />
        <AverageCard
          width="100%"
          value={getAverageStudentComprehension.toFixed()}
          icon="assignment"
          description="Average Comprehension"
          color="red"
        />
        <AverageCard
          width="100%"
          value={getAverageStudentWordSpeed.toFixed()}
          icon="view"
          description="Average Speed Reading"
          color="orange"
        />
        <AverageCard
          width="100%"
          value={getAverageImprovement.toFixed()}
          icon="bar-chart"
          description="Average Improvement"
          color="orange"
        />
        <AverageCard
          width="100%"
          value={lowestComprehension.toFixed()}
          icon="arrow-up"
          description="Lowest comprehension "
          color="gray"
        />
        <AverageCard
          width="100%"
          value={highestComprehension.toFixed()}
          icon="arrow-down"
          description="Highest comprehension"
          color="gray"
        />
      </ChakraGrid>
      <BaseCard
        background="linear-gradient(180deg, #05314A 20.65%, #94D4D6 100%);"
        borderRadius={10}
        width="fit-content"
        title="Highest Speed reading improvement data"
        alignText="start"
        color="white"
      >
        <StudentReadingImprovementData data={highestSpeedImprovementData} />
      </BaseCard>
      <ChakraGrid
        gridTemplateColumns={'490px 1fr'}
        gridTemplateRows="repeat(2, 350px)"
        gridColumn="1/4"
        gridGap={8}
        rowGap={6}
      >
        <TestTypeBarChart
          title="Highest reading speed score per test type"
          data={highestScoresPerCategory}
          compareSpeed={true}
        />
        <TestTypeBarChart
          title="Highest reading speed improvement per test type"
          data={highestReadingSpeedImprovement}
          compareSpeed={true}
        />
        <TestTypeBarChart
          title="Speed reading average improvement per test type"
          data={averageSpeedReadImprovement}
          compareSpeed={true}
        />
        <TestTypeBarChart
          title="Average speed reading starting and best score per test type"
          data={averageSpeedReadImprovementStartingBest}
          compareSpeed={false}
        />
      </ChakraGrid>
      <ChakraGrid gridTemplateColumns={'490px 1fr'} gridColumn="1/4" gridGap={8}>
        <BusinessActivitiesResume
          title="Total of Activities completed"
          color="blue.500"
          iconColor="teal.500"
          finishedDiagnostics={getAllDiagnostics.data?.length}
          finishedSpeedReads={getAllSpeedRead.data?.length}
          finishedPractices={getAllPractices.data?.length}
          finishedBrainEye={getAllBrainEye.data?.length}
          finishedVideos={getAllWatchedVideos.data?.length}
        />
        <BusinessActivitiesResume
          title="Average number of activities completed per student"
          color="red.500"
          iconColor="orange.500"
          finishedDiagnostics={averageDiagnosticsPerStudent}
          finishedSpeedReads={averageSpeedTestPerStudent}
          finishedPractices={averagePracticesPerStudent}
          finishedBrainEye={averageBrainEyePerStudent}
          finishedVideos={averageVideosPerStudent}
        />
      </ChakraGrid>
      <ChakraGrid gridTemplateColumns={'490px 1fr'} gridTemplateRows="500px" gridColumn="1/4" gridGap={8}>
        <BusinessStudentRanking title="Comprehension Ranking" data={sortedUsersByComprehensionRanking.slice(0, 8)} />
        <BusinessStudentRanking title="Speed Reading Ranking" data={sortedUsersBySpeedReadRanking.slice(0, 8)} />
      </ChakraGrid>
      <ChakraGrid
        gridTemplateColumns={'600px 1fr'}
        gridTemplateRows="repeat(1, 350px)"
        gridColumn="1/4"
        gridGap={8}
        rowGap={6}
        mb={5}
      >
        <TestTypeBarChart title="Number of students per test type" data={studentsPerTestType} compareSpeed={true} />
        <BusinessStudentHourLineChart title="Active Students and Hours during per Date" businesses={[]} />
      </ChakraGrid>
    </ChakraGrid>
  );
};
