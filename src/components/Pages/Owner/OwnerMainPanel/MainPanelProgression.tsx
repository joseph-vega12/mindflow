import React, { FC } from 'react';

import { Flex as ChakraFlex, Text as ChakraText } from '@chakra-ui/react';

import { BaseCard } from 'components/common';

interface MainPanelProgressionProps {
  preDiagnosticResult: number;
  firstDiagnosticResult: number;
  secondDiagnosticResult: number;
  finalDiagnosticResult: number;
}

export const MainPanelProgression: FC<MainPanelProgressionProps> = ({
  preDiagnosticResult,
  firstDiagnosticResult,
  secondDiagnosticResult,
  finalDiagnosticResult
}) => {
  return (
    <BaseCard title="Progression Analysis">
      <ChakraFlex
        width="100%"
        padding="md"
        borderBottom="sm"
        borderBottomColor="gray.300"
        justifyContent="space-between"
        alignItems="center"
      >
        <ChakraText fontSize="xl">Pre-Diagnostic</ChakraText>
        <ChakraFlex alignItems="center">
          <ChakraText marginRight="sm" fontWeight="normal" fontSize="xl">
            {preDiagnosticResult}
          </ChakraText>
          <ChakraText fontsize="xs" color="blue.500">
            {preDiagnosticResult}%
          </ChakraText>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraFlex
        width="100%"
        padding="md"
        borderBottom="sm"
        borderBottomColor="gray.300"
        justifyContent="space-between"
        alignItems="center"
      >
        <ChakraText fontSize="xl">Diagnostic 1</ChakraText>
        <ChakraFlex alignItems="center">
          <ChakraText marginRight="sm" fontWeight="normal" fontSize="xl">
            {firstDiagnosticResult}
          </ChakraText>
          <ChakraText fontsize="xs" color="blue.500">
            {firstDiagnosticResult}%
          </ChakraText>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraFlex
        width="100%"
        padding="md"
        borderBottom="sm"
        borderBottomColor="gray.300"
        justifyContent="space-between"
        alignItems="center"
      >
        <ChakraText fontSize="xl">Diagnostic 2</ChakraText>
        <ChakraFlex alignItems="center">
          <ChakraText marginRight="sm" fontWeight="normal" fontSize="xl">
            {secondDiagnosticResult}
          </ChakraText>
          <ChakraText fontsize="xs" color="blue.500">
            {secondDiagnosticResult}%
          </ChakraText>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraFlex
        width="100%"
        padding="md"
        borderBottom="sm"
        borderBottomColor="gray.300"
        justifyContent="space-between"
        alignItems="center"
      >
        <ChakraText fontSize="xl">Final Diagnostic</ChakraText>
        <ChakraFlex alignItems="center">
          <ChakraText marginRight="sm" fontWeight="normal" fontSize="xl">
            {finalDiagnosticResult}
          </ChakraText>
          <ChakraText fontsize="xs" color="blue.500">
            {finalDiagnosticResult}%
          </ChakraText>
        </ChakraFlex>
      </ChakraFlex>
      <ChakraFlex width="100%" padding="md" justifyContent="space-between" alignItems="center">
        <ChakraFlex borderRadius="sm" padding="sm" background="green.500">
          <ChakraText fontSize="xl" color="white">
            Completed!
          </ChakraText>
        </ChakraFlex>
        <ChakraFlex alignItems="center">
          <ChakraText marginRight="sm" fontWeight="normal" fontSize="xl">
            20
          </ChakraText>
          <ChakraText fontsize="xs" color="green.500">
            20%
          </ChakraText>
        </ChakraFlex>
      </ChakraFlex>
    </BaseCard>
  );
};
