import React, { FC, useMemo, useState } from 'react';

import {
  Avatar as ChakraAvatar,
  AvatarBadge as ChakraAvatarBadge,
  Button as ChakraButton,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement,
  Select as ChakraSelect,
  Text as ChakraText
} from '@chakra-ui/react';
import { get } from 'lodash';
import { useNavigate, useParams } from 'react-router-dom';

import { Icon, Table } from 'components/common';
import { TestType } from 'types';

export interface StudentItem {
  id: string;
  firstName: string;
  lastName: string;
  level: number;
  testType: TestType;
  bestSpeed: string | number;
  firstSpeed: string | number;
  averageSpeed: string | number;
  videos: number;
}

interface StudentsListingProps {
  data: Record<string, any>[];
}

export const StudentsListing: FC<StudentsListingProps> = ({ data }) => {
  const [searchInput, setSearchInput] = useState('');
  const { businessId } = useParams<{ businessId?: string }>();

  const navigate = useNavigate();

  const getTableColumns = useMemo(() => {
    return [
      {
        width: '10%',
        Header: 'Student',
        accessor: (row: StudentItem) => (
          <ChakraFlex gridGap="md" alignItems="center">
            <ChakraAvatar size="sm">
              <ChakraAvatarBadge bottom="25px" boxSize="0.8rem" bg="green.500" />
            </ChakraAvatar>
            <ChakraText isTruncated color="gray.600">
              {row.firstName} {row.lastName}
            </ChakraText>
          </ChakraFlex>
        )
      },
      {
        width: '10%',
        Header: 'Level',
        accessor: (row: StudentItem) => (
          <ChakraText fontWeight="bold" color="orange.500" as="span">
            {row.level}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Program',
        accessor: (row: StudentItem) => (
          <ChakraText fontWeight="bold" color="orange.500" as="span">
            {row.testType}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: '1st Speed',
        accessor: (row: StudentItem) => (
          <ChakraText fontWeight="bold" color="orange.500" as="span">
            {get(row, 'activity.stats.wordSpeed.firstWordSpeed')}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Best Speed',
        accessor: (row: StudentItem) => (
          <ChakraText fontWeight="bold" color="orange.500" as="span">
            {get(row, 'activity.stats.wordSpeed.bestWordSpeed')}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Average Speed',
        accessor: (row: StudentItem) => (
          <ChakraText fontWeight="bold" color="orange.500" as="span">
            {get(row, 'activity.stats.wordSpeed.averageWordSpeed')}
          </ChakraText>
        )
      },
      {
        width: '5%',
        Header: 'D1',
        accessor: (row: StudentItem) => (
          <ChakraText color="blue.500" fontWeight="bold">
            {get(row, 'activity.stats.diagnostics.gmat[0].scorePercentage', '-')}
          </ChakraText>
        )
      },
      {
        width: '5%',
        Header: 'D2',
        accessor: (row: StudentItem) => (
          <ChakraText color="blue.500" fontWeight="bold">
            {get(row, 'activity.stats.diagnostics.gmat[1].scorePercentage', '-')}
          </ChakraText>
        )
      },
      {
        width: '5%',
        Header: 'D3',
        accessor: (row: StudentItem) => (
          <ChakraText color="green.500" fontWeight="bold">
            {get(row, 'activity.stats.diagnostics.gmat[2].scorePercentage', '-')}
          </ChakraText>
        )
      },
      {
        width: '5%',
        Header: 'D4',
        accessor: (row: StudentItem) => (
          <ChakraText color="orange.500" fontWeight="bold">
            {get(row, 'activity.stats.diagnostics.gmat[3].scorePercentage', '-')}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Videos',
        accessor: (row: StudentItem) => (
          <ChakraText fontWeight="bold" color="orange.500" as="span">
            {get(row, 'activity.counters.videos')}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Action',
        accessor: (row: StudentItem) => (
          <ChakraFlex alignItems="center" justifyContent="center">
            <ChakraButton
              width="40px"
              height="40px"
              justifyContent="center"
              alignItems="center"
              borderRadius="full"
              color="white"
              boxShadow="base"
              background="green.500"
              onClick={() => navigate(`/business/${businessId}/students/${row.id}`)}
            >
              <Icon size="sm" name="analytics" />
            </ChakraButton>
          </ChakraFlex>
        )
      }
    ];
  }, [data]);

  const getFilteredStudents = useMemo(() => {
    const filteredStudentsBySearch = data?.filter(
      (activities) =>
        activities.firstName.toLocaleLowerCase().match(searchInput.toLocaleLowerCase()) ||
        activities.lastName.toLocaleLowerCase().match(searchInput.toLocaleLowerCase())
    );
    return filteredStudentsBySearch ?? [];
  }, [data, searchInput]);

  return (
    <ChakraFlex gridGap="lg" flexDirection="column">
      <ChakraHeading height="fit-content" fontSize="md" whiteSpace="nowrap" textStyle="title-with-border-bottom">
        Students List
      </ChakraHeading>
      <ChakraFlex gridGap="lg" alignItems="center">
        {/* <ChakraSelect width="200px" borderRadius="sm" borderColor="#999999" placeholder="Select..." /> */}
        <ChakraInputGroup width="200px">
          <ChakraInput
            borderRadius="sm"
            borderColor="#999999"
            placeholder="Search"
            value={searchInput}
            onChange={({ target }) => setSearchInput(target.value)}
          />
          <ChakraInputRightElement>
            <Icon size="sm" name="search" />
          </ChakraInputRightElement>
        </ChakraInputGroup>
        {/* <ChakraButton
          color="white"
          borderRadius="sm"
          colorScheme="orange"
          leftIcon={<Icon size="sm" name="info-outline" />}
        >
          Invite students
        </ChakraButton> */}
      </ChakraFlex>
      <Table isPageable={true} columns={getTableColumns} data={getFilteredStudents} />
    </ChakraFlex>
  );
};
