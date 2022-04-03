import * as CodeMirror from 'codemirror';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/display/placeholder';
import './FilterMode';
import { UnControlled as ReactCodeMirror } from 'react-codemirror2';

import { Box } from '@chakra-ui/react';
import { ExtendedCodeMirror } from './models/ExtendedCodeMirror';
import AutoCompletePopup from './AutoCompletePopup';
import { HintInfo } from './ExtendedCodeMirror';

type FilterInputProps = {
  value: string;
  customRenderCompletionItem: any;
  needAutoCompleteValues: (
    codemirror: ExtendedCodeMirror,
    text: string
  ) => HintInfo[];
  onSubmit: (text: string) => void;
  onChange: (text: string) => void;
  onBlur: () => void;
  onFocus: () => void;
};

const FilterInput = ({
  value,
  customRenderCompletionItem,
  needAutoCompleteValues,
  onSubmit,
  onChange,
  onBlur,
  onFocus,
}: FilterInputProps) => {
  let options: CodeMirror.EditorConfiguration;
  let codeMirror: ExtendedCodeMirror;
  let doc: CodeMirror.Doc;
  let autoCompletePopup: AutoCompletePopup;

  const onLocalSubmit = (text: string) => {
    autoCompletePopup.completionShow = false;
    if (onSubmit) {
      onSubmit(text);
    }
  };

  const codeMirrorRef = (ref: { editor: ExtendedCodeMirror }) => {
    if (ref === null) return;
    if (codeMirror === ref.editor) {
      return;
    }
    codeMirror = ref.editor;
    doc = ref.editor.getDoc();
    autoCompletePopup = new AutoCompletePopup(codeMirror, (text) =>
      needAutoCompleteValues(codeMirror, text)
    );

    autoCompletePopup.customRenderCompletionItem = customRenderCompletionItem;

    ref.editor.on('beforeChange', function (instance, change) {
      const newtext = change.text.join('').replace(/\n/g, ''); // remove ALL \n !
      change.update(change.from, change.to, [newtext] as any);
      return true;
    });

    ref.editor.on('changes', (e, v) => {
      const changeType = v[0].origin;
      if (changeType === '+input' || changeType === 'complete') {
        autoCompletePopup.show();
      }
      autoCompletePopup.completionShow = false;
    });

    ref.editor.on('focus', (cm, e?) => {
      onFocus();
    });

    ref.editor.on('blur', (cm, e?) => {
      onLocalSubmit(doc.getValue());
      onBlur();
      autoCompletePopup.completionShow = false;
    });

    ref.editor.on('keypress', (cm: ExtendedCodeMirror, e?: KeyboardEvent) => {
      autoCompletePopup.completionShow = true;
    });

    ref.editor.on('keyup', (cm: ExtendedCodeMirror, e?: KeyboardEvent) => {
      if (e.key === 'enter' || e.key === 'escape') {
        autoCompletePopup.completionShow = false;
      }
    });
  };

  const handleEditorChange = (
    _editor: IInstance,
    _data: CodeMirror.EditorChange,
    value: string
  ) => {
    onChange(value);
  };

  return (
    <Box w="100%" overflow="auto !important">
      <ReactCodeMirror
        ref={codeMirrorRef}
        onChange={handleEditorChange}
        options={options}
        value={value}
      />
    </Box>
  );
};
export default FilterInput;
