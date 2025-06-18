import styled from '@emotion/styled';

export const HeaderComponent = styled.th<any>`
  width: ${(p) => {
    return p.width ?? '';
  }};
  background: ${(p) => p.background ?? '#F2F2F2'};
  color: ${(p) => p.color ?? '#999999'};
  font-size ${(p) => p.fontSize ?? '16px'};
  padding: 10px 15px;
  font-family: Roboto;
  font-weight: 700;
  line-height: 19px;
  text-transform: capitalize;
  text-align: left;
`;
