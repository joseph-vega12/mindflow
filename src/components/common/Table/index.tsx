// @ts-nocheck
import React, { FC, forwardRef, useEffect, useRef } from 'react';

import { Box as ChakraBox, Checkbox as ChakraCheckbox, Flex as ChakraFlex } from '@chakra-ui/react';
import { Row, usePagination, useRowSelect, useTable } from 'react-table';

import { Loading } from 'components/common/Loading';

import { CellComponent, HeaderComponent, RowComponent, TableComponent } from './Table';
import { TablePagination } from './TablePagination';

const TableCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();

  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate, rest]);

  return <ChakraCheckbox type="checkbox" isChecked={rest.checked} ref={resolvedRef} {...rest} />;
});

interface TableProps {
  data: Record<string, any>[];
  columns: object[];
  omitKeys?: string[];
  isLoading?: boolean;
  isPageable?: boolean;
  isSelectable?: boolean;
  hasHeading?: boolean;
  onSelectRows?: (rows: Row[]) => void;
}

export const Table: FC<TableProps> = ({
  data,
  columns,
  isLoading = false,
  omitKeys,
  isPageable,
  isSelectable,
  hasHeading,
  onSelectRows
}) => {
  const {
    rows,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    setPageSize,
    selectedFlatRows,
    pageOptions,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data: data ?? [],
      initialState: {
        pageIndex: 0,
        pageSize: 15
      }
    },
    usePagination,
    useRowSelect,
    (hooks) => {
      if (isSelectable) {
        hooks.visibleColumns.push((columns) => [
          {
            id: 'select',
            width: '42px',
            Header: (head) => <TableCheckbox {...head.getToggleAllPageRowsSelectedProps()} />,
            Cell: ({ row }) => <TableCheckbox {...row.getToggleRowSelectedProps()} />
          },
          ...columns
        ]);
      }
    }
  );

  useEffect(() => {
    if (onSelectRows && !!data?.length) {
      const formattedRows = selectedFlatRows?.map((row) => row?.original);

      onSelectRows(formattedRows);
    }
  }, [selectedFlatRows, data]);

  hasHeading = hasHeading ?? true;

  return (
    <>
      <TableComponent {...getTableProps()}>
        {hasHeading && (
          <ChakraBox as="thead">
            {headerGroups.map((headerGroup, index) => (
              <RowComponent {...headerGroup.getHeaderGroupProps()} key={index}>
                {headerGroup.headers.map((column) => (
                  <HeaderComponent {...column.getHeaderProps()} {...column} key={column.getHeaderProps().key}>
                    <Loading isLoading={isLoading} fontSize={column.fontSize}>
                      {column.render('Header')}
                    </Loading>
                  </HeaderComponent>
                ))}
              </RowComponent>
            ))}
          </ChakraBox>
        )}

        <ChakraBox as="tbody" {...getTableBodyProps()}>
          {(isPageable ? page : rows).map((row: Row) => {
            prepareRow(row);

            return (
              <RowComponent border {...row.getRowProps()} key={row.getRowProps().key}>
                {row.cells.map((cell) => (
                  <CellComponent
                    {...cell.getCellProps()}
                    key={cell.getCellProps().key}
                    width={!hasHeading ? '100%' : 'auto'}
                  >
                    <Loading isLoading={isLoading}>{cell.render('Cell')}</Loading>
                  </CellComponent>
                ))}
              </RowComponent>
            );
          })}
        </ChakraBox>
      </TableComponent>

      {isPageable && (
        <TablePagination
          pageSize={pageSize}
          pageIndex={pageIndex}
          pageOptions={pageOptions}
          canAccessNextPage={canNextPage}
          canAccessPreviousPage={canPreviousPage}
          onGoToNextPage={() => nextPage()}
          onGoToPreviousPage={() => previousPage()}
          onPageSizeChange={(pageSize) => setPageSize(pageSize)}
        />
      )}
    </>
  );
};
