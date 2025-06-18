import { HTMLAttributes } from 'react';
import styled from '@emotion/styled';

export const CellComponent = styled.td<
  HTMLAttributes<any> & { background?: string; fontSize?: string; width?: string | number }
>`
  width: ${(p) => p.width ?? ''};
  padding: 10px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
`;
