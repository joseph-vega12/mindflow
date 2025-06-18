import React, { FC, useMemo, useState } from 'react';

import {
  Avatar as ChakraAvatar,
  AvatarBadge as ChakraAvatarBadge,
  Flex as ChakraFlex,
  Heading as ChakraHeading,
  Input as ChakraInput,
  InputGroup as ChakraInputGroup,
  InputRightElement as ChakraInputRightElement,
  Text as ChakraText
} from '@chakra-ui/react';

import { Column } from 'react-table';
import { Icon } from 'components/common';

import { capitalize } from 'lodash';
import { formatTimestamp } from 'lib/utils';
import { Table } from 'components/common';

import moment from 'moment';

interface ActivitiesListingProps {
  data: Record<string, any>[];
  isLoading?: boolean;
}

export const ActivitiesListing: FC<ActivitiesListingProps> = ({ data, isLoading }) => {
  const [searchInput, setSearchInput] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const getTableColumns: Column[] = useMemo(
    () => [
      {
        width: '5%',
        Header: 'Student',
        accessor: (row: any) => (
          <ChakraFlex gridGap="md" alignItems="center">
            <ChakraAvatar size="sm">
              <ChakraAvatarBadge bottom="25px" boxSize="0.8rem" bg="green.500" />
            </ChakraAvatar>
            <ChakraText color="gray.600">
              {row.user?.firstName} {row.user?.lastName}
            </ChakraText>
          </ChakraFlex>
        )
      },
      {
        width: '20%',
        Header: 'Level',
        accessor: (row: any) => (
          <ChakraText fontWeight="bold" color="orange.500" as="span" ml="md">
            Lvl. {row.user?.level ?? 1}
          </ChakraText>
        )
      },
      {
        width: '20%',
        Header: 'Activity',
        accessor: (row: any) => (
          <ChakraText color="gray.600">{capitalize(row.type?.replace(/[-|_]/gi, ' '))}</ChakraText>
        )
      },
      {
        width: '20%',
        Header: 'Date',
        accessor: (row: any) => <ChakraText color="gray.600">{formatTimestamp(row.timestamp, 'MM/DD/YY')}</ChakraText>
      }
    ],
    [data]
  );

  const getFilteredActivities = useMemo(() => {
    const startTimestamp = moment(startDate, 'YYYY-MM-DD').startOf('day').unix() * 1000;
    const endTimestamp = moment(endDate, 'YYYY-MM-DD').endOf('day').unix() * 1000;
    const filteredActivitiesBySearch = data?.filter(
      (activities) =>
        activities.user.firstName.toLocaleLowerCase().match(searchInput.toLowerCase()) ||
        activities.user.lastName.toLowerCase().match(searchInput.toLowerCase())
    );
    const filteredByDate =
      startDate && endDate
        ? filteredActivitiesBySearch?.filter(
          (activities) => activities.timestamp >= startTimestamp && activities.timestamp <= endTimestamp
        )
        : filteredActivitiesBySearch;
    return filteredByDate ?? [];
  }, [data, searchInput, startDate, endDate]);

  return (
    <ChakraFlex gridGap="lg" flexDirection="column">
      <ChakraHeading height="fit-content" fontSize="md" whiteSpace="nowrap" textStyle="title-with-border-bottom">
        Recent Activities
      </ChakraHeading>
      <ChakraFlex gridGap="lg" alignItems="center">
        <ChakraFlex marginBottom="md" justifyContent="space-between" alignItems="center">
          <ChakraFlex alignItems="center">
            <ChakraInputGroup width="340px" marginRight="md">
              <ChakraInput
                placeholder="Search Activities"
                borderRadius="sm"
                value={searchInput}
                onChange={({ target }) => setSearchInput(target.value)}
              />
              <ChakraInputRightElement>
                <Icon size="sm" borderColor="gray.500" name="search" />
              </ChakraInputRightElement>
            </ChakraInputGroup>
            <ChakraFlex minWidth="0px">
              <ChakraInput
                type="date"
                name="startDate"
                placeholder="DD/MM/YYYY"
                borderRightRadius="none"
                borderRadius="sm"
                value={startDate}
                onChange={({ target }) => setStartDate(target.value)}
              />
              <ChakraInput
                type="date"
                marginRight="md"
                placeholder="DD/MM/YYYY"
                borderLeftRadius="none"
                borderRadius="sm"
                name="endDate"
                value={endDate}
                onChange={({ target }) => setEndDate(target.value)}
              />
            </ChakraFlex>
          </ChakraFlex>
        </ChakraFlex>
      </ChakraFlex>
      <Table isPageable={true} columns={getTableColumns} data={getFilteredActivities} isLoading={isLoading} />
    </ChakraFlex>
  );
};
