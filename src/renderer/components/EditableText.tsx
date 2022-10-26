import { ReactElement, useEffect, useRef, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import MarkdownShortcuts from 'quill-markdown-shortcuts';
import CSS from 'csstype';
import { Box } from '@chakra-ui/layout';
import { useColorModeValue } from '@chakra-ui/color-mode';
import { useColorMode } from '@chakra-ui/react';

Quill.register('modules/markdownShortcuts', MarkdownShortcuts);

const Link = Quill.import('formats/link');
Link.sanitize = function (url) {
  // Protocols which we don't append http to
  const protocolIgnoreList = ['mailto', 'message', 'http', 'https'];
  let protocol = url.slice(0, url.indexOf(':'));

  // Add http to the start of the link (to open in browser)
  if (!protocolIgnoreList.includes(protocol)) {
    url = `http://${url}`;
  }
  // Reconsruct the link
  const anchor = document.createElement('a');
  anchor.href = url;
  protocol = anchor.href.slice(0, anchor.href.indexOf(':'));
  return url;
};
Quill.register(Link, true);

type EditableTextProps = {
  singleLine: boolean;
  shouldSubmitOnBlur: boolean;
  shouldClearOnSubmit: boolean;
  onUpdate: (input: string) => void;
  showBorder?: boolean;
  hideToolbar?: boolean;
  placeholder?: string;
  width?: CSS.Property.Width;
  input?: string;
  readOnly?: boolean;
  onEscape?: () => void;
  shouldBlurOnSubmit?: boolean;
};

const generateModules = (hideToolbar: boolean, singleLine: boolean) => {
  const defaultItems = {
    clipboard: { matchVisual: false },
    markdownShortcuts: {},
  };
  if (hideToolbar) {
    return {
      toolbar: false,
      ...defaultItems,
    };
  }
  if (singleLine) {
    return {
      toolbar: [['bold', 'italic', 'underline', 'strike'], ['link']],
      ...defaultItems,
    };
  }

  return {
    toolbar: [
      [{ header: '1' }, { header: '2' }],
      ['bold', 'italic', 'underline', 'strike'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['link'],
      ['code'],
      ['blockquote'],
      ['clean'],
    ],
    ...defaultItems,
  };
};

const formats = [
  'font',
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'link',
  'list',
  'indent',
  'clean',
  'size',
  'code',
  'blockquote',
];

const EditableText = ({
  shouldSubmitOnBlur,
  shouldClearOnSubmit,
  onUpdate,
  singleLine,
  readOnly,
  onEscape,
  input,
  width,
  showBorder,
  hideToolbar,
  placeholder,
  shouldBlurOnSubmit,
}: EditableTextProps): ReactElement => {
  const [editorHtml, setEditorHtml] = useState<string>(input ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<ReactQuill>(null);
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (shouldBlurOnSubmit) {
      editorRef?.current.blur();
      setIsEditing(false);
    }
    setEditorHtml(input ?? '');
  }, [input]);

  const handleChange = (content: string, delta: Delta) => {
    const lastOp = delta.ops[delta.ops.length - 1];
    const lastChar = lastOp?.insert?.charCodeAt(0);

    // If you hit enter and it's set as a single line then clear the input
    if (lastChar === 10 && singleLine) {
      if (shouldClearOnSubmit) {
        setEditorHtml('');
      }
      // TODO: Need to blur on submit
      onUpdate(editorHtml);

      if (shouldBlurOnSubmit) {
        editorRef?.current.blur();
        setIsEditing(false);
      }
    } else {
      setEditorHtml(content);
    }
  };

  const handleBlur = () => {
    if (shouldSubmitOnBlur) {
      onUpdate(editorHtml);
    }
    setIsEditing(false);
  };

  const handleFocus = (_, source, __) => {
    if (source === 'silent') {
      setIsEditing(false);
      return;
    }
    if (readOnly) return;
    setIsEditing(true);
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Escape') {
      if (onEscape) {
        onEscape();
      }
    }
  };

  return (
    <Box
      position="relative"
      mb="30px"
      width={width || '100%'}
      maxW="100%"
      whiteSpace="nowrap"
      border={'1px solid'}
      borderColor={
        showBorder ? useColorModeValue('gray.200', 'gray.600') : 'transparent'
      }
      borderRadius="md"
      bg={colorMode === 'light' ? 'gray.100' : 'gray.900'}
    >
      <ReactQuill
        ref={editorRef}
        className={isEditing ? 'quill-focused-editor' : 'quill-blurred-editor'}
        theme="snow"
        onChange={handleChange}
        defaultValue={input}
        value={editorHtml}
        modules={generateModules(hideToolbar ?? false, singleLine)}
        formats={formats}
        onKeyUp={handleKeyUp}
        readOnly={readOnly}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </Box>
  );
};

export default EditableText;
