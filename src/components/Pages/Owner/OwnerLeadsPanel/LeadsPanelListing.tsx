import React, { FC, useMemo } from 'react';

import { formatTimestamp } from 'lib/utils';

import { Table } from 'components/common';

import { LeadDocumentWithId, whereDidYouHearAboutUsOptions } from 'types';

interface LeadsPanelListingProps {
  data?: LeadDocumentWithId[];
  isLoading?: boolean;
  onSelectRows?: (rows: LeadDocumentWithId[]) => void;
}

export const LeadsPanelListing: FC<LeadsPanelListingProps> = ({ data, isLoading, onSelectRows }) => {
  const getTableColumns = useMemo(() => {
    return [
      { width: '20%', Header: 'Name', accessor: 'name' },
      { width: '30%', Header: 'Email', accessor: 'email' },
      { width: '20%', Header: 'Category', accessor: 'category' },
      {
        width: '20%',
        Header: 'Date',
        accessor: (row: LeadDocumentWithId) => (row.timestamp ? formatTimestamp(row.timestamp, 'MM/DD/YYYY') : '-')
      },
      { Header: 'Result', accessor: (row: LeadDocumentWithId) => row?.result?.wordSpeed || '-' },
      {
        Header: 'Heard About Us',
        accessor: (row: LeadDocumentWithId) => whereDidYouHearAboutUsOptions[row?.whereDidYouHearAboutUs] || '-'
      },
      {
        Header: 'Heard About Us Observation',
        accessor: (row: LeadDocumentWithId) => row?.whereDidYouHearAboutUsObservation || '-'
      },
      { Header: 'Converted', accessor: (row: LeadDocumentWithId) => (row?.converted ? 'Yes' : 'No') },
      { Header: 'Archived', accessor: (row: LeadDocumentWithId) => (row?.archived ? 'Yes' : 'No') }
    ];
  }, [data]);

  return (
    <Table
      data={data}
      columns={getTableColumns}
      isLoading={isLoading}
      isPageable={true}
      isSelectable={true}
      onSelectRows={(rows) => onSelectRows((rows as unknown) as LeadDocumentWithId[])}
    />
  );
};
