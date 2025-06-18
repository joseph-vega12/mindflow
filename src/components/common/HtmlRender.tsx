import React, { FC, useCallback } from 'react';
import ReactHtmlParser, { Options } from 'react-html-parser';

interface Props {
  html?: string;
  opts?: Options;
}

export const HtmlRender: FC<Props> = ({ html = '', opts }) => {
  const render = useCallback(() => ReactHtmlParser(html, opts), [html, opts]);

  return <>{render()}</>;
};
