import React, { FC, useMemo } from 'react';

import { Button, Grid, Text } from '@chakra-ui/react';
import { filter, meanBy, uniqBy } from 'lodash';
import { useNavigate } from 'react-router-dom';

import { BrainEyeTestResult, EssayDocumentWithId, PracticeTestResult, UserTestType } from 'types';
import { Table } from 'components/common/Table';
import { useTestResultList } from 'lib/firebase';

interface TextsTableProps {
  data: EssayDocumentWithId[];
  isLoading?: boolean;
}

export const TextsTable: FC<TextsTableProps> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  const testResultList = useTestResultList<BrainEyeTestResult | PracticeTestResult>([
    'brain-eye-coordination',
    'practice'
  ]);

  const getTextResults = (essayId: string) => {
    return filter(testResultList, { essayId });
  };

  const getTableColumns = useMemo(
    () => [
      {
        Header: 'Name',
        width: '25%',
        accessor: (row: EssayDocumentWithId) => {
          return <Text whiteSpace="normal">{row.name}</Text>;
        }
      },
      {
        Header: 'Level',
        accessor: 'difficult',
        width: '20%'
      },
      {
        Header: 'Average words per minute(WPM)',
        width: '5%',
        accessor: (row: EssayDocumentWithId) => {
          const textResults = getTextResults(row.id);

          return meanBy(filter(textResults, 'wordSpeed'), 'wordSpeed') || '-';
        }
      },
      {
        Header: 'Action',
        width: '10%',
        accessor: (row: EssayDocumentWithId) => {
          const textResults = getTextResults(row.id);

          const availableTestsTypes: UserTestType[] = ['brain-eye-coordination', 'practice'];

          const doneTestsTypes = uniqBy(textResults, 'type');

          return (
            <Grid display={{ lg: 'grid', md: 'flex' }} templateColumns="7fr 3fr" alignItems="center">
              <Button variant="outline" colorScheme="gray" color="blue.900" onClick={() => navigate(`/library/${row.id}`)}>
                Activities
              </Button>
              <Text as="span" fontSize="sm" fontWeight="thin" color="gray.600" pl={1}>
                {doneTestsTypes.length}/{availableTestsTypes.length}
              </Text>
            </Grid>
          );
        }
      }
    ],
    [testResultList]
  );

  // @ts-ignore
  return <Table data={data ?? []} columns={getTableColumns} isLoading={isLoading} />;
};
