import React, { FC, useMemo } from 'react';

import { Flex as ChakraFlex } from '@chakra-ui/react';
import { useFormContext } from 'react-hook-form';
import { useQuery } from 'react-query';

import { StudentsPanelFilters, StudentsPanelListing } from 'components/Pages/Owner/OwnerStudentsPanel';

import { UserDetails, UserDetailsWithId } from 'types';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from 'lib/firebase/firebaseInit';

export const OwnerStudentsPanel: FC = () => {
  const form = useFormContext();

  const values = form.watch();

  const showCleverOnly = values?.showCleverStudents === true;

  const studentsQuery = useQuery(
    [
      'owner',
      'students',
      showCleverOnly ? 'clever' : values.difficultLevel,
      showCleverOnly ? null : values.testType,
      showCleverOnly ? null : values.whereDidYouHearAboutUs
    ],
    async () => {
      const { difficultLevel, testType, whereDidYouHearAboutUs } = values;

      if (showCleverOnly) {
        const usersQuery = query(
          collection(db, 'users').withConverter<UserDetailsWithId>({
            fromFirestore: (doc) => ({
              id: doc.id,
              ...(doc.data() as UserDetails)
            }),
            toFirestore: (doc: UserDetailsWithId) => doc
          })
        );
        const studentDocs = await getDocs(usersQuery);
        return studentDocs.docs.map((doc) => doc.data());
      }

      if (difficultLevel || testType || whereDidYouHearAboutUs) {
        const queryKey = difficultLevel ? 'difficultLevel' : testType ? 'testType' : 'whereDidYouHearAboutUs';
        const queryValue = difficultLevel || testType || whereDidYouHearAboutUs;

        const usersQuery = query(
          collection(db, 'users')
            .withConverter<UserDetailsWithId>({
              fromFirestore: (doc) => {
                return {
                  id: doc.id,
                  ...(doc.data() as UserDetails)
                };
              },
              toFirestore: (doc: UserDetailsWithId) => doc
            }),
          where(queryKey, '==', queryValue)
        );

        const studentDocs = await getDocs(usersQuery);
        const students = studentDocs.docs.map((doc) => doc.data());
        return students;
      }

      const usersQuery = query(
        collection(db, 'users').withConverter<UserDetailsWithId>({
          fromFirestore: (doc) => ({
            id: doc.id,
            ...(doc.data() as UserDetails)
          }),
          toFirestore: (doc: UserDetailsWithId) => doc
        })
      );

      const studentDocs = await getDocs(usersQuery);
      return studentDocs.docs.map((doc) => doc.data());
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  const cleverOnlyList = useMemo(() => {
    const list = studentsQuery?.data ?? [];
    return list.filter((student) => Boolean(student.cleverUserId));
  }, [studentsQuery.data]);

  const uniqueDistrictIds = useMemo(
    () => [...new Set(cleverOnlyList.map((s) => s.schoolName).filter(Boolean))] as string[],
    [cleverOnlyList]
  );

  const getFilteredStudents = useMemo(() => {
    let list = studentsQuery?.data ?? [];
    if (showCleverOnly) {
      list = list.filter((student) => Boolean(student.cleverUserId));
      const districtIdFilter = values?.districtIdFilter;
      if (districtIdFilter) {
        list = list.filter((student) => student.schoolName === districtIdFilter);
      }
    }
    const search = values?.searchStudents?.toLocaleLowerCase() ?? '';
    const filteredStudentsBySearch = list.filter((student) => {
      const firstName = (student?.firstName ?? '').toLocaleLowerCase();
      const lastName = (student?.lastName ?? '').toLocaleLowerCase();
      const cleverId = (student?.cleverUserId ?? '').toLocaleLowerCase();
      if (!search) return true;
      return firstName.includes(search) || lastName.includes(search) || cleverId.includes(search);
    });
    return filteredStudentsBySearch;
  }, [
    studentsQuery.data,
    values?.searchStudents,
    values?.showCleverStudents,
    values?.districtIdFilter
  ]);

  return (
    <ChakraFlex flexDirection="column">
      <ChakraFlex width="100%" flexDirection="column" marginBottom="lg">
        <StudentsPanelFilters
          students={getFilteredStudents}
          uniqueDistrictIds={uniqueDistrictIds}
          showCleverOnly={showCleverOnly}
        />
      </ChakraFlex>
      <StudentsPanelListing isLoading={studentsQuery.isLoading} students={getFilteredStudents} />
    </ChakraFlex>
  );
};
