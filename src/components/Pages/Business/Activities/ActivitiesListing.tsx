import React, { FC, useMemo } from 'react';

import {
  Avatar as ChakraAvatar,
  Badge as ChakraAvatarBadge,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Text as ChakraText
} from '@chakra-ui/react';
import { Column } from 'react-table';

import { capitalize } from 'lodash';
import { formatTimestamp } from 'lib/utils';
import { Table } from 'components/common';
import { UserDetails } from 'types';

interface ActivitiesListingProps {
  data: Record<string, any>[];

  user?: UserDetails | null;
}

export const ActivitiesListing: FC<ActivitiesListingProps> = ({ data, user }) => {
  const getTableColumns: Column[] = useMemo(
    () => [
      {
        width: '45%',
        Header: 'Student',
        accessor: (row: any) => (
          <ChakraFlex gridGap="md" alignItems="center">
            <ChakraAvatar size="sm">
              <ChakraAvatarBadge bottom="25px" boxSize="0.8rem" bg="green.500" />
            </ChakraAvatar>
            <ChakraText color="gray.600">
              {user?.firstName} {user?.lastName}
              <ChakraText fontWeight="bold" color="orange.500" as="span" ml="md">
                Lvl. {user?.level ?? 1}
              </ChakraText>
            </ChakraText>
          </ChakraFlex>
        )
      },
      {
        width: '25%',
        Header: 'Activity',
        accessor: (row: any) => (
          <ChakraText color="gray.600">{capitalize(row.type?.replace(/[-|_]/gi, ' '))}</ChakraText>
        )
      },
      {
        width: '25%',
        Header: 'Program',
        accessor: (row: any) => <ChakraText color="gray.600">{user?.testType}</ChakraText>
      },
      {
        width: '25%',
        Header: 'Date',
        accessor: (row: any) => <ChakraText color="gray.600">{formatTimestamp(row.timestamp, 'MM/DD/YY')}</ChakraText>
      }
    ],
    [data]
  );

  return (
    <ChakraFlex gridGap="lg" flexDirection="column">
      <ChakraFlex gridGap="lg" alignItems="center">
        <ChakraHeading height="fit-content" fontSize="md" whiteSpace="nowrap" textStyle="title-with-border-bottom">
          Recent Activities
        </ChakraHeading>
        {/* <ChakraSelect width="200px" borderRadius="sm" borderColor="#999999" placeholder="Select..." />
        <ChakraInputGroup width="200px">
          <ChakraInput borderRadius="sm" borderColor="#999999" placeholder="Search" />
          <ChakraInputRightElement>
            <Icon size="sm" name="search" />
          </ChakraInputRightElement>
        </ChakraInputGroup> */}
      </ChakraFlex>
      <Table isPageable={true} columns={getTableColumns} data={data} />
    </ChakraFlex>
  );
};
