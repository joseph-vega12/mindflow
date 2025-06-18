import React, { FC } from 'react';

import {
  Button as ChakraButton,
  Flex as ChakraFlex,
  Select as ChakraSelect,
  Text as ChakraText
} from '@chakra-ui/react';
import { Icon } from '../Icon';
import { UsePaginationInstanceProps } from 'react-table';

export interface TablePaginationProps {
  pageSize: number;
  pageIndex: number;
  pageOptions: UsePaginationInstanceProps<any>['pageOptions'];
  canAccessNextPage: boolean;
  canAccessPreviousPage: boolean;
  onGoToNextPage: () => void;
  onGoToPreviousPage: () => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const TablePagination: FC<TablePaginationProps> = ({
  pageSize,
  pageIndex,
  pageOptions,
  canAccessNextPage,
  canAccessPreviousPage,
  onGoToNextPage,
  onGoToPreviousPage,
  onPageSizeChange
}) => (
  <ChakraFlex width="100%" alignItems="center" justifyContent="space-between" marginTop="md">
    <ChakraFlex alignItems="center">
      <ChakraButton size="sm" marginRight="sm" onClick={() => onGoToPreviousPage()} disabled={!canAccessPreviousPage}>
        <Icon name="chevron-left" />
      </ChakraButton>
      <ChakraButton size="sm" marginRight="md" onClick={() => onGoToNextPage()} disabled={!canAccessNextPage}>
        <Icon name="chevron-right" />
      </ChakraButton>
      <ChakraText as="span">
        Page{' '}
        <ChakraText fontWeight="bold" as="span">
          {pageIndex + 1} of {pageOptions.length}
        </ChakraText>
      </ChakraText>
    </ChakraFlex>
    <ChakraSelect
      width="fit-content"
      value={pageSize}
      onChange={({ target }) => {
        onPageSizeChange(Number(target.value));
      }}
    >
      {[15, 25, 35, 45, 55].map((pageSize) => (
        <option key={pageSize} value={pageSize}>
          Show {pageSize}
        </option>
      ))}
    </ChakraSelect>
  </ChakraFlex>
);
