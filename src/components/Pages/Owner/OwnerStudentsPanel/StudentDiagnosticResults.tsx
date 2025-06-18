import React, { FC, useMemo } from 'react';

import { formatTimestamp } from 'lib/utils';

import { DiagnosticDocumentWithId, DiagnosticResultDocumentWithId } from 'types';
import { Table } from 'components/common';

type ResultItem = { diagnostic: DiagnosticDocumentWithId; result: DiagnosticResultDocumentWithId };
interface Props {
  data: ResultItem[];
  isLoading: boolean;
}

export const StudentDiagnosticResults: FC<Props> = ({ data, isLoading }) => {
  const getTableColumns = useMemo(() => {
    return [
      {
        width: '5%',
        Header: 'Order',
        id: 'order',
        accessor: (row: ResultItem) => row.diagnostic.order + 1
      },
      { width: '15%', Header: 'Test Type', id: 'category', accessor: 'diagnostic.category' },
      {
        width: '20%',
        Header: 'Name',
        id: 'name',
        accessor: 'diagnostic.name'
      },
      {
        width: '15%',
        Header: 'Total of Questions',
        id: 'questionCount',
        accessor: (row: ResultItem) => row.diagnostic.questions.length
      },
      {
        width: '15%',
        Header: 'Correct Answers',
        id: 'score',
        accessor: (row: ResultItem) => row.result?.result?.totalScore ?? '-'
      },
      {
        width: '15%',
        Header: 'Correct Percentage',
        id: 'percentage',
        accessor: (row: ResultItem) =>
          row.result?.result?.scorePercentage ? `${row.result?.result?.scorePercentage}%` : '-'
      },
      {
        width: '15%',
        Header: 'Done At',
        id: 'date',
        accessor: (row: ResultItem) => (row.result?.timestamp ? formatTimestamp(row.result?.timestamp) : '-')
      }
    ];
  }, [data]);

  // @ts-ignore
  return <Table isLoading={isLoading} columns={getTableColumns} data={data} />;
};
