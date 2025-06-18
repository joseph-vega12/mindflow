import React, { FC } from 'react';

import { Flex as ChakraFlex, Heading as ChakraHeading } from '@chakra-ui/react';
import { find, map } from 'lodash';

import { BaseCard, Icon } from 'components/common';
import { DiagnosticDocumentWithId, IconName, UserAcitivityResumedDiagnosticResult } from 'types';

interface DiagnosticsTestProps {
  diagnostics?: DiagnosticDocumentWithId[];
  resumedDiagnotiscsResults?: UserAcitivityResumedDiagnosticResult[];
  isLoading: boolean;
}

interface DiagnosticWithResultItem {
  diagnostic: DiagnosticDocumentWithId;
  result?: UserAcitivityResumedDiagnosticResult;
}

export const DiagnosticsResumed: FC<DiagnosticsTestProps> = ({ diagnostics, resumedDiagnotiscsResults, isLoading }) => {
  const diagnosticsWithResultsList: DiagnosticWithResultItem[] = map(diagnostics, (diagnostic) => {
    const result = find(resumedDiagnotiscsResults, { diagnosticId: diagnostic.id });

    return {
      diagnostic,
      result
    };
  });

  // Return the first diagnostic without a result
  const allowedDiagnostic: DiagnosticWithResultItem | null = find(diagnosticsWithResultsList, (d) => !d.result) ?? null;

  const getIconProps = (diagnosticResult: DiagnosticWithResultItem): { name: IconName; color: string } => {
    if (!allowedDiagnostic || diagnosticResult.result) {
      return {
        name: 'check-circle',
        color: 'green.400'
      };
    }

    if (diagnosticResult.diagnostic.id === allowedDiagnostic.diagnostic.id) {
      return {
        name: 'unlock',
        color: 'orange.500'
      };
    }

    return {
      name: 'lock',
      color: 'gray.400'
    };
  };

  return (
    <BaseCard title="Diagnostic Tests">
      <ChakraFlex height="100%" gridGap="sm" flexDirection="column">
        {diagnosticsWithResultsList.map(({ diagnostic, result }) => {
          return (
            <ChakraFlex
              key={diagnostic.id}
              alignItems="center"
              paddingBottom="sm"
              borderBottom="sm"
              borderBottomColor="gray.200"
              _last={{ border: 'none' }}
            >
              <Icon marginRight="sm" {...getIconProps({ diagnostic, result })} />
              <ChakraHeading
                isTruncated
                as="h3"
                width="100%"
                fontWeight="500"
                fontSize={{
                  lg: 'md',
                  xl: 'lg'
                }}
              >
                {diagnostic.name}
              </ChakraHeading>
              <ChakraFlex textAlign="right">
                <ChakraHeading as="h3" fontSize="2xl" fontWeight="500">
                  {result ? `${result.scorePercentage ?? 0}%` : '-'}
                </ChakraHeading>
              </ChakraFlex>
            </ChakraFlex>
          );
        })}
      </ChakraFlex>
    </BaseCard>
  );
};

export default DiagnosticsResumed;
