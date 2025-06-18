import React, { FC, useMemo } from 'react';

import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import { Column } from 'react-table';

import { Icon, Table } from 'components/common';

import { DiagnosticDocumentWithId } from 'types';

interface DiagnosticsPanelListingProps {
  data?: DiagnosticDocumentWithId[];
  isLoading?: boolean;
  onEdit: (diagnostic: DiagnosticDocumentWithId) => void;
}

export const DiagnosticsPanelListing: FC<DiagnosticsPanelListingProps> = ({ data, isLoading, onEdit }) => {
  const getTableColumns = useMemo<Column<DiagnosticDocumentWithId>[]>(() => {
    return [
      { width: '40%', Header: 'Title', accessor: 'title' },
      { width: '20%', Header: 'Author', accessor: ({ author }) => author ?? '-' },
      { width: '20%', Header: 'Test Type', accessor: 'name' },
      {
        width: '20%',
        Header: 'Category',
        accessor: ({ category }) => {
          return category.toUpperCase();
        }
      },
      { width: '20%', Header: 'Total of sentences', accessor: 'totalOfSentences' },
      {
        id: 'action',
        width: '10%',
        Header: 'Options',
        accessor: (diagnostic) => (
          <ChakraTooltip hasArrow placement="left" label="Edit Diagnostic">
            <Icon color="blue.500" name="edit" onClick={() => onEdit(diagnostic)} />
          </ChakraTooltip>
        )
      }
    ];
  }, [data]);

  return <Table isPageable={true} isLoading={isLoading} columns={getTableColumns} data={data} />;
};
