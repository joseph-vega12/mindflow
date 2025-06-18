import React, { FC, useMemo } from 'react';

import { Tooltip as ChakraTooltip } from '@chakra-ui/react';
import { Column } from 'react-table';

import { Icon, Table } from 'components/common';

import { EssayDocumentWithId, userFriendlyDifficultLevel } from 'types';

interface EssaysPanelListingProps {
  data?: EssayDocumentWithId[];
  isLoading?: boolean;
  onEdit: (essay: EssayDocumentWithId) => void;
}

export const EssaysPanelListing: FC<EssaysPanelListingProps> = ({ data, isLoading, onEdit }) => {
  const getTableColumns = useMemo<Column<EssayDocumentWithId>[]>(() => {
    return [
      { width: '40%', Header: 'Title', accessor: 'name' },
      { width: '20%', Header: 'Author', accessor: ({ author }) => author ?? '-' },
      { width: '20%', Header: 'Category', accessor: ({ category }) => userFriendlyDifficultLevel[category] },
      { width: '20%', Header: 'Total of sentences', accessor: 'totalOfSentences' },
      {
        id: 'action',
        width: '10%',
        Header: 'Options',
        accessor: (essay) => (
          <ChakraTooltip hasArrow placement="left" label="Edit essay">
            <Icon color="blue.500" name="edit" onClick={() => onEdit(essay)} />
          </ChakraTooltip>
        )
      }
    ];
  }, [data]);

  return <Table isPageable={true} isLoading={isLoading} columns={getTableColumns} data={data} />;
};
