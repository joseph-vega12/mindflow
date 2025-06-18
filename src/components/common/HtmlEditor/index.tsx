import React, { FC, useState } from 'react';

import { EditorState } from 'draft-js';
import { stateFromHTML } from 'draft-js-import-html';
import { stateToHTML } from 'draft-js-export-html';
import { useDebounce } from 'lib/customHooks';

import { Editor } from './Editor';

interface Props {
  textHtml: string;

  onChange: (html: string, rawContent: string) => void;
}

export const HtmlEditor: FC<Props> = ({ onChange, textHtml }) => {
  const initialEditorState = textHtml
    ? EditorState.createWithContent(stateFromHTML(textHtml))
    : EditorState.createEmpty();

  const [editorState, setEditorState] = useState(initialEditorState);

  useDebounce(
    () => {
      const textHtml = stateToHTML(editorState.getCurrentContent());
      const content = editorState.getCurrentContent().getPlainText('\u0001');

      onChange(textHtml, content);
    },
    500,
    [editorState]
  );

  return <Editor onChange={setEditorState} editorState={editorState} />;
};
