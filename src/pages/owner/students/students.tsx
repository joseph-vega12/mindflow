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

  const studentsQuery = useQuery(
    ['owner', 'students', values.difficultLevel, values.testType, values.whereDidYouHearAboutUs],
    async () => {
      const { difficultLevel, testType, whereDidYouHearAboutUs } = values;

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
            }), where(queryKey, '==', queryValue),
          orderBy('firstName')
        )

        const studentDocs = await getDocs(usersQuery)
        const students = studentDocs.docs.map((doc) => doc.data());

        return students;
      }

      const usersQuery = await query(collection(db, 'users')
        .withConverter<UserDetailsWithId>({
          fromFirestore: (doc) => {
            return {
              id: doc.id,
              ...(doc.data() as UserDetails)
            };
          },
          toFirestore: (doc: UserDetailsWithId) => doc
        }), orderBy('firstName')
      )

      const studentDocs = await getDocs(usersQuery);
      const students = studentDocs.docs.map((doc) => doc.data());

      return students;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  const getFilteredStudents = useMemo(() => {
    const filteredStudentsBySearch = studentsQuery?.data?.filter(
      (student) =>
        student.firstName.toLocaleLowerCase().match(values?.searchStudents?.toLocaleLowerCase()) ||
        student.lastName.toLocaleLowerCase().match(values?.searchStudents?.toLocaleLowerCase())
    );
    return filteredStudentsBySearch ?? [];
  }, [studentsQuery.data, values.searchStudents]);

  return (
    <ChakraFlex flexDirection="column">
      <ChakraFlex width="100%" flexDirection="column" marginBottom="lg">
        <StudentsPanelFilters students={getFilteredStudents} />
      </ChakraFlex>
      <StudentsPanelListing isLoading={studentsQuery.isLoading} students={getFilteredStudents} />
    </ChakraFlex>
  );
};
