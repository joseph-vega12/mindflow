import {
  bold,
  center,
  eraser,
  italic,
  justify,
  left,
  Editor as ReactDraftEditor,
  redo,
  right,
  underline,
  undo
} from 'react-draft-wysiwyg';
import React from 'react';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'; // eslint-disable-line no-unused-vars

export const Editor = ({ editorState, onChange }) => {
  const toolbar = {
    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'textAlign', 'remove', 'history'],
    link: { showOpenOptionOnHover: false },
    inline: {
      inDropdown: false,
      options: ['bold', 'italic', 'underline'],
      bold: { icon: bold },
      italic: { icon: italic },
      underline: { icon: underline }
    },
    blockType: {
      inDropdown: true,
      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code']
    },
    fontSize: {
      icon: 'fontSize',
      options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96]
    },
    fontFamily: {
      options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana']
    },
    textAlign: {
      inDropdown: false,
      options: ['left', 'center', 'right', 'justify'],
      left: { icon: left },
      center: { icon: center },
      right: { icon: right },
      justify: { icon: justify }
    },
    remove: { icon: eraser },
    history: {
      inDropdown: false,
      options: ['undo', 'redo'],
      undo: { icon: undo },
      redo: { icon: redo }
    }
  };

  return (
    <ReactDraftEditor
      toolbar={toolbar}
      editorState={editorState}
      toolbarStyle={{
        border: '1px solid #bfbfbf',
        borderRadius: '5px'
      }}
      editorStyle={{
        margin: '10px 0',
        border: '1px solid #bfbfbf',
        borderRadius: '5px',
        padding: '10px'
      }}
      onEditorStateChange={onChange}
    />
  );
};
