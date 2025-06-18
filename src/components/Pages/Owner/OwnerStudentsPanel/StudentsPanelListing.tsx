import React, { FC, useMemo } from 'react';

import {
  Avatar as ChakraAvatar,
  AvatarBadge as ChakraAvatarBadge,
  Button as ChakraButton,
  Flex as ChakraFlex,
  Text as ChakraText
} from '@chakra-ui/react';

import { get } from 'lodash';
import { useNavigate } from 'react-router-dom';

import { formatTimestamp } from 'lib/utils';

import { Icon, Table } from 'components/common';
import { UserDetailsWithId } from 'types';

interface Props {
  students: UserDetailsWithId[];
  isLoading: boolean;
}

export const StudentsPanelListing: FC<Props> = ({ students, isLoading }) => {
  const navigate = useNavigate();

  const getTableColumns = useMemo(() => {
    return [
      {
        width: '10%',
        Header: 'Student',
        id: 'name',
        accessor: (row: UserDetailsWithId) => (
          <ChakraFlex gridGap="md" alignItems="center">
            <ChakraAvatar size="sm" src={row.picture}>
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
        id: 'level',
        accessor: (row: UserDetailsWithId) => (
          <ChakraText fontWeight="bold" color="orange.500" as="span">
            {row.level}
          </ChakraText>
        )
      },
      { width: '10%', Header: 'Program', id: 'program', accessor: 'testType' },
      {
        width: '10%',
        Header: '1st Speed',
        id: 'firstSpeed',
        accessor: (row: UserDetailsWithId) => (
          <ChakraText color="blue.500" fontWeight="bold">
            {get(row, ['activity', 'stats', 'wordSpeed', 'firstWordSpeed'], '-')}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Best Speed',
        id: 'bestSepeed',
        accessor: (row: UserDetailsWithId) => (
          <ChakraText color="blue.500" fontWeight="bold">
            {get(row, ['activity', 'stats', 'wordSpeed', 'bestWordSpeed'], '-')}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Average Speed',
        id: 'averageSpeed',
        accessor: (row: UserDetailsWithId) => (
          <ChakraText color="blue.500" fontWeight="bold">
            {Math.floor(get(row, ['activity', 'stats', 'wordSpeed', 'averageWordSpeed'], 0))}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Start Date',
        id: 'startDate',
        accessor: (row: UserDetailsWithId) => (
          <ChakraText color="blue.500" fontWeight="bold">
            {get(row, ['license', 'activationDate']) ? formatTimestamp(get(row, ['license', 'activationDate'])) : '-'}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Expiration Date',
        id: 'expirationDate',
        accessor: (row: UserDetailsWithId) => (
          <ChakraText color="blue.500" fontWeight="bold">
            {get(row, ['license', 'expirationDate']) ? formatTimestamp(get(row, ['license', 'expirationDate'])) : '-'}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Last seen',
        id: 'lastSeen',
        accessor: (row: UserDetailsWithId) => (
          <ChakraText color="blue.500" fontWeight="bold">
            {get(row, ['lastSeen']) ? formatTimestamp(get(row, ['lastSeen'])) : '-'}
          </ChakraText>
        )
      },
      {
        width: '10%',
        Header: 'Action',
        id: 'action',
        accessor: (row: UserDetailsWithId) => (
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
              onClick={() => navigate(`/owner/students/${row.id}`)}
            >
              <Icon size="sm" name="analytics" />
            </ChakraButton>
          </ChakraFlex>
        )
      }
    ];
  }, [students]);

  // @ts-ignore
  return <Table isPageable={true} isLoading={isLoading} columns={getTableColumns} data={students} />;
};
