import { Text } from '@chakra-ui/react';
import React, { FC, useMemo } from 'react';

import { BrainEyeTestResult, FirebaseObjectWithKey } from 'types';
import { formatTimestamp } from 'lib/utils';
import { Table } from 'components/common/Table';

interface Props {
  data: FirebaseObjectWithKey<BrainEyeTestResult>[];
  isLoading?: boolean;
}

export const BrainEyeTestResultsTable: FC<Props> = ({ data, isLoading }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'WPM',
        width: '34%',
        accessor: (row: FirebaseObjectWithKey<BrainEyeTestResult>) => {
          return <Text fontSize="sm">{row.wordSpeed}</Text>;
        },
        fontSize: '14px'
      },
      {
        Header: 'Comprehension',
        width: '33%',
        accessor: (row: FirebaseObjectWithKey<BrainEyeTestResult>) => {
          return <Text fontSize="sm">{row.comprehension}</Text>;
        },
        fontSize: '14px'
      },
      {
        Header: 'Date',
        width: '33%',
        accessor: (row: FirebaseObjectWithKey<BrainEyeTestResult>) => {
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
