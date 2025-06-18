import { HTMLAttributes } from 'react';
import styled from '@emotion/styled';

export const TableComponent = styled.table<HTMLAttributes<HTMLTableElement>>`
  table-layout: fixed;
  display: inline-block;
  width: 100%;
  overflow: auto;
`;
