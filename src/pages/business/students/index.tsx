import React, { FC, useMemo } from 'react';

import { Flex as ChakraFlex, Heading as ChakraHeading, Text as ChakraText } from '@chakra-ui/react';
import { useQuery } from 'react-query';

import { StudentsListing } from 'components/Pages/Business/Students/StudentsListing';

import { useAuthContext } from 'lib/firebase';
import { useBusiness } from 'lib/customHooks';
import { UserDetails, UserDetailsWithId } from 'types';
import { db } from 'lib/firebase/firebaseInit';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

export const StudentsPanel: FC = () => {
  const { user } = useAuthContext();
  const { businessId } = useBusiness();

  const studentsQuery = useQuery(
    ['business', businessId, 'students'],
    async () => {
      const usersRef = collection(db, 'users')

      const usersQuery = query(usersRef, where('businessId', '==', businessId), orderBy('firstName')).withConverter<UserDetailsWithId>({
        fromFirestore: (doc) => {
          return {
            id: doc.id,
            ...(doc.data() as UserDetails)
          };
        },
        toFirestore: (doc: UserDetailsWithId) => doc
      })

      const usersResults = await getDocs(usersQuery)

      const students = usersResults.docs.map((doc) => doc.data());
      return students;
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false
    }
  );

  // filters out the business user activities from populating in the dashboard
  const filteredStudents = useMemo(() => studentsQuery.data?.filter((students) => students?.id !== user.uid) ?? [], [
    studentsQuery.data
  ]);

  return (
    <ChakraFlex flexDirection="column">
      <ChakraFlex width="100%" flexDirection="column" marginBottom="lg">
        <ChakraFlex
          width="100%"
          marginBottom="lg"
          justifyContent="space-between"
          flexDirection={{ md: 'column', lg: 'row' }}
        >
          <ChakraFlex width="100%" alignItems="center">
            <ChakraHeading marginRight="md" fontSize="3xl" fontWeight="bold" color="blue.500" whiteSpace="nowrap">
              Students Panel
            </ChakraHeading>
          </ChakraFlex>
          <ChakraFlex width="100%" alignItems="center" justifyContent={{ lg: 'flex-end', md: 'space-between' }}>
            <ChakraFlex alignItems="center">
              <ChakraText color="blue.500" marginRight="sm" fontSize="5xl">
                {filteredStudents?.length ?? '-'}
              </ChakraText>
              <ChakraFlex color="gray.600" flexDirection="column">
                <ChakraText fontSize="md">Total</ChakraText>
                <ChakraText fontSize="md">Students</ChakraText>
              </ChakraFlex>
            </ChakraFlex>
          </ChakraFlex>
        </ChakraFlex>
      </ChakraFlex>

      <StudentsListing data={filteredStudents} />
      {/* <StudentsListing isLoading={studentsQuery.isLoading} students={studentsQuery?.data ?? []} /> */}
    </ChakraFlex>
  );
};
