import React, { FC, useMemo } from 'react';
import { Badge, Button, Text } from '@chakra-ui/react';
import { find, groupBy } from 'lodash';
import { useNavigate } from 'react-router-dom';

import {
  BrainEyeTestResult,
  EssayOrCustomEssayDocumentWithId,
  FirestoreDocumentWithId,
  PracticeTestResult,
  SpeedTestResult
} from 'types';
import { formatTimestamp } from 'lib/utils';
import { Table } from 'components/common/Table';
import { useTestResultList } from 'lib/firebase';

interface Props {
  data: EssayOrCustomEssayDocumentWithId[];
  isLoading?: boolean;
}

export const TextsTable: FC<Props> = ({ data, isLoading }) => {
  const navigate = useNavigate();

  const speedTestsResults = useTestResultList<FirestoreDocumentWithId<SpeedTestResult>>(['speed-read']);
  const practiceAndBrainEyeTestResults = useTestResultList<(BrainEyeTestResult | PracticeTestResult)[]>([
    'brain-eye-coordination',
    'practice'
  ]);

  const blockedTests = groupBy(practiceAndBrainEyeTestResults, 'essayId');

  const getTextResults = (essayId: string): FirestoreDocumentWithId<SpeedTestResult> | undefined => {
    return find(speedTestsResults, ['essayId', essayId]);
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        width: '20%',
        accessor: (row: EssayOrCustomEssayDocumentWithId) => {
          return <Text whiteSpace="normal">{row.name}</Text>;
        }
      },
      {
        Header: 'Difficulty level',
        width: '15%',
        accessor: (row: EssayOrCustomEssayDocumentWithId) => {
          if (!row.isCustom) {
            // @ts-ignore
            return row.difficult;
          }

          return <Badge colorScheme="blue">Custom</Badge>;
        }
      },
      {
        Header: 'Word Speed',
        width: '10%',
        accessor: (row: EssayOrCustomEssayDocumentWithId) => {
          const textResult = getTextResults(row.id);

          if (!textResult) return '-';

          return Math.floor(textResult.wordSpeed ?? 0);
        }
      },
      {
        Header: 'Comprehension',
        width: '15%',
        accessor: (row: EssayOrCustomEssayDocumentWithId) => {
          const textResult = getTextResults(row.id);

          if (!textResult) return '-';

          return textResult.comprehension;
        }
      },
      {
        Header: 'Date',
        width: '15%',
        accessor: (row: EssayOrCustomEssayDocumentWithId) => {
          const textResult = getTextResults(row.id);

          if (!textResult) return '-';

          return formatTimestamp(textResult.timestamp);
        }
      },
      {
        Header: 'Action',
        width: '20%',
        accessor: (row: EssayOrCustomEssayDocumentWithId) => {
          const textResult = getTextResults(row.id);

          if (textResult) {
            return (
              <Button
                disabled={row.isCustom}
                variant="outline"
                colorScheme="gray"
                color="blue.900"
                onClick={() => navigate(`/speed-test/${row.id}/result`)}
              >
                Result
              </Button>
            );
          }

          if (blockedTests[row.id]) {
            return (
              <Button variant="outline" colorScheme="gray" color="red.900" disabled size="sm">
                Used for Practice
              </Button>
            );
          }

          const actions = [
            <Button
              key="assessment"
              variant="outline"
              colorScheme="gray"
              color="blue.900"
              size="sm"
              onClick={() => navigate(`/speed-read/${row.id}`)}
              disabled={!!textResult}
            >
              Assessment
            </Button>
          ];

          // if (row.isCustom) {
          //   actions.push(
          //     <Button size="sm" colorScheme="red" variant="outline" mx="sm" onClick={delete}>
          //       Delete
          //     </Button>
          //   );
          // }

          return actions;
        }
      }
    ],
    [data, speedTestsResults, blockedTests]
  );

  // @ts-ignore
  return <Table data={data ?? []} columns={columns} isLoading={isLoading} />;
};
