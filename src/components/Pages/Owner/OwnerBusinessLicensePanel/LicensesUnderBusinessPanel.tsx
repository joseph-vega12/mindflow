import { sortBy } from 'lodash';
import React, { useCallback } from 'react';

import { Flex as ChakraFlex, Text as ChakraText } from '@chakra-ui/react';

import { formatTimestamp } from 'lib/utils';

import { FirebaseObjectWithKey, License, UserDetails } from 'types';
import { Table } from 'components/common';

type TableItem = {
  license: FirebaseObjectWithKey<License>;
  user?: UserDetails;
};

export const LicensesUnderBusinessPanel = ({ isLoading, data }) => {
  const tableColumns = [
    {
      Header: 'Student Name',
      width: '25%',
      accessor: (row: TableItem) => {
        return (
          <ChakraText isTruncated={true} textAlign="center">
            {row.license.user?.firstName} {row.license.user?.lastName}
          </ChakraText>
        );
      }
    },
    {
      Header: 'Duration Days',
      width: '25%',
      accessor: (row: TableItem) => {
        return row.license.durationDays + ' days';
      }
    },
    {
      Header: 'Activation Date',
      width: '25%',
      accessor: (row: TableItem) => (row.license.activationDate ? formatTimestamp(row.license?.activationDate) : '-')
    },
    {
      Header: 'Expiration Date',
      width: '25%',
      accessor: (row: TableItem) => (row.license.expirationDate ? formatTimestamp(row.license?.expirationDate) : '-')
    },
    {
      Header: 'Status',
      width: '30%',
      accessor: (row: TableItem) => {
        const colors: Record<License['status'], string> = {
          ACTIVE: 'green.500',
          INACTIVE: 'gray.500',
          EXPIRED: 'red.500'
        };
        return (
          <ChakraText fontWeight="normal" cisTruncated={true} textAlign="center" color={colors[row.license.status]}>
            {row.license.status}
          </ChakraText>
        );
      }
    }
  ];

  const prepareTableData = useCallback(() => {
    if (!data) return [];

    const licensesUsers = data?.map((license: License) => {
      if (!license) return null;
      return {
        license
      };
    });

    return sortBy(licensesUsers, 'license.status');
  }, [data]);

  const tableData = prepareTableData();

  return (
    <ChakraFlex direction="column">
      <Table isPageable={true} isLoading={isLoading} data={tableData} columns={tableColumns} />
    </ChakraFlex>
  );
};
