import React, { FC, useMemo } from 'react';

import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import { Column } from 'react-table';

import { Icon, Table } from 'components/common';

import { CouponDocumentWithId } from 'types';

export const CouponsPanelListing: FC<any> = ({ data, isLoading, onSelectRows }) => {
  const getTableColumns = useMemo<Column<CouponDocumentWithId>[]>(() => {
    return [
      { width: '20%', Header: 'Code', accessor: 'code' },
      { width: '40%', Header: 'Name', accessor: 'name' },
      { width: '20%', Header: 'Price', accessor: 'price' },
      { width: '20%', Header: 'Expiry date', accessor: 'expiryDate' }
    ];
  }, [data]);

  return (
    <Table
      isPageable={true}
      isLoading={isLoading}
      columns={getTableColumns}
      data={data}
      isSelectable={true}
      onSelectRows={(rows) => onSelectRows((rows as unknown) as CouponDocumentWithId[])}
    />
  );
};
