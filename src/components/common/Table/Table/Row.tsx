import { HTMLAttributes } from 'react';
import styled from '@emotion/styled';

export const RowComponent = styled.tr<HTMLAttributes<any> & { border?: boolean }>`
  color: ${(p) => p.color ?? '#000'};
  cursor: pointer;

  font-family: Roboto;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: 21px;
  letter-spacing: 0em;
  text-align: left;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  border-top: ${(p) => p.border && '1px solid #999999'};

  :last-of-type {
    border-bottom: ${(p) => p.border && '1px solid #999999'};
  }
`;
