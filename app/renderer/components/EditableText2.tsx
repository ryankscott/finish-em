import React, { ReactElement, useState } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Wrapper } from './styled/EditableText2'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'
import MarkdownShortcuts from 'quill-markdown-shortcuts'

Quill.register('modules/markdownShortcuts', MarkdownShortcuts)

const GET_THEME = gql`
  query {
    theme @client
  }
`

type EditableText2Props = {
  placeholder?: string
  input?: string
  readOnly?: boolean
  singleLine?: boolean
  shouldSubmitOnBlur: boolean
  shouldClearOnSubmit: boolean
  hideBorder?: boolean
  hideToolbar?: boolean
  onUpdate: (input: string) => void
  onEscape?: () => void
}

const generateModules = (hideToolbar: boolean) => {
  return {
    toolbar: hideToolbar
      ? false
      : [
          //[{ header: '1' }, { header: '2' }],
          //[{ size: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          // [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link'],
          //['clean'],
        ],
    clipboard: {
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
    markdownShortcuts: {},
  }
}
const formats = ['bold', 'italic', 'underline', 'strike', 'link']

function EditableText2(props: EditableText2Props): ReactElement {
  const [editorHtml, setEditorHtml] = useState(props.input ? props.input : '')
  const [isEditing, setIsEditing] = useState(false)
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  let reactQuillRef = React.useRef<ReactQuill>()

  const handleChange = (content, delta, source, editor) => {
    const lastChar = delta.ops[delta.ops.length - 1]?.insert?.charCodeAt(0)
    if (lastChar == 10 && props.singleLine) {
      if (props.shouldClearOnSubmit) {
        setEditorHtml('')
      }
      // TODO: Need to blur on submit
      reactQuillRef.current.blur()
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
    setIsEditing(true)
  }

  const handleKeyUp = (e) => {
    if (e.key == 'Escape') {
      props.onEscape ? props.onEscape() : null
    }

    return
  }

  return (
    <ThemeProvider theme={theme}>
      <Wrapper hideBorder={props.hideBorder} isEditing={isEditing}>
        <ReactQuill
          ref={reactQuillRef}
          theme={'snow'}
          onChange={handleChange}
          value={editorHtml}
          modules={generateModules(props.hideToolbar)}
          formats={formats}
          onKeyUp={handleKeyUp}
          readOnly={props.readOnly}
          placeholder={props.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </Wrapper>
    </ThemeProvider>
  )
}

export default EditableText2
