import { Box, Button, Grid, Text } from '@chakra-ui/react';
import { filter, meanBy, uniqBy } from 'lodash';
import React, { FC, useMemo } from 'react';

import { FirebaseObjectWithKey, PracticeTestResult } from 'types';
import { Table } from 'components/common/Table';
import { formatTimestamp, secondsParser } from 'lib/utils';

interface Props {
  data: FirebaseObjectWithKey<PracticeTestResult>[];
  isLoading?: boolean;
}

export const PracticeTestResultsTable: FC<Props> = ({ data, isLoading }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Program',
        width: '34%',
        accessor: (row: FirebaseObjectWithKey<PracticeTestResult>) => {
          return <Text fontSize="sm">{row.practiceType === 'regular' ? '1:00' : '1:20'}</Text>;
        },
        fontSize: '14px'
      },
      {
        Header: 'Rounds',
        width: '33%',
        accessor: (row: FirebaseObjectWithKey<PracticeTestResult>) => {
          return <Text fontSize="sm">{row.numberOfRounds}</Text>;
        },
        fontSize: '14px'
      },
      {
        Header: 'Date',
        width: '33%',
        accessor: (row: FirebaseObjectWithKey<PracticeTestResult>) => {
          return <Text fontSize="sm">{formatTimestamp(row.timestamp)}</Text>;
        },
        fontSize: '14px'
      }
    ],
    []
  );

  // @ts-ignore
  return <Table data={data ?? []} columns={columns} isLoading={isLoading} />;
};
