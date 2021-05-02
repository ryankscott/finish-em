import React, { ReactElement, useState } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import MarkdownShortcuts from 'quill-markdown-shortcuts'
import CSS from 'csstype'
import { Box } from '@chakra-ui/layout'

Quill.register('modules/markdownShortcuts', MarkdownShortcuts)

const Link = Quill.import('formats/link')
Link.sanitize = function (url) {
  // Protocols which we don't append http to
  const protocolIgnoreList = ['mailto', 'message', 'http', 'https']
  let protocol = url.slice(0, url.indexOf(':'))

  // Add http to the start of the link (to open in browser)
  if (!protocolIgnoreList.includes(protocol)) {
    url = 'http://' + url
  }
  // Reconsruct the link
  let anchor = document.createElement('a')
  anchor.href = url
  protocol = anchor.href.slice(0, anchor.href.indexOf(':'))
  return url
}
Quill.register(Link, true)

type EditableText2Props = {
  placeholder?: string
  height?: CSS.Property.Height
  width?: CSS.Property.Width
  input?: string
  readOnly?: boolean
  singleLine: boolean
  shouldSubmitOnBlur: boolean
  shouldClearOnSubmit: boolean
  showBorder?: boolean
  hideToolbar?: boolean
  onUpdate: (input: string) => void
  onEscape?: () => void
}

const generateModules = (hideToolbar: boolean, singleLine: boolean) => {
  return {
    toolbar: hideToolbar
      ? false
      : singleLine
      ? [['bold', 'italic', 'underline', 'strike'], ['link']]
      : [
          [{ header: '1' }, { header: '2' }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link'],
          ['code'],
          ['blockquote'],
          ['clean'],
        ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
    markdownShortcuts: {},
  }
}

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
]

const EditableText2 = (props: EditableText2Props): ReactElement => {
  const [editorHtml, setEditorHtml] = useState(props.input ? props.input : '')
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (content, delta, source, editor) => {
    const lastChar = delta.ops[delta.ops.length - 1]?.insert?.charCodeAt(0)
    if (lastChar == 10 && props.singleLine) {
      if (props.shouldClearOnSubmit) {
        setEditorHtml('')
      }
      // TODO: Need to blur on submit
      props.onUpdate(editorHtml)
    } else {
      setEditorHtml(content)
    }
  }

  const handleBlur = () => {
    if (props.shouldSubmitOnBlur) {
      props.onUpdate(editorHtml)
    }
    setIsEditing(false)
  }

  const handleFocus = () => {
    if (props.readOnly) return
    setIsEditing(true)
  }

  const handleKeyUp = (e) => {
    if (e.key == 'Escape') {
      props.onEscape ? props.onEscape() : null
    }
    return
  }

  return (
    <Box
      position={'relative'}
      height={'auto'}
      minH={props.height ? props.height : 'auto'}
      mb={'30px'}
      width={props.width ? props.width : '100%'}
      overflow={'visible'}
      textOverflow={'ellipsis'}
      whiteSpace={'nowrap'}
      border={props.showBorder ? '1px solid' : 'none'}
      borderColor={'gray.200'}
      borderRadius={5}
    >
      <ReactQuill
        className={isEditing ? 'quill-focused-editor' : 'quill-blurred-editor'}
        theme={'snow'}
        onChange={handleChange}
        value={editorHtml}
        modules={generateModules(props.hideToolbar, props.singleLine)}
        formats={formats}
        onKeyUp={handleKeyUp}
        readOnly={props.readOnly}
        placeholder={props.placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </Box>
  )
}

export default EditableText2
