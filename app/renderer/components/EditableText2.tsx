import React, { ReactElement, useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Wrapper } from './styled/EditableText2'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'

const GET_THEME = gql`
  query {
    theme @client
  }
`

type EditableText2Props = {
  placeholder: string
  readOnly?: boolean
  singleLine?: boolean
  shouldSubmitOnBlur: boolean
  shouldClearOnSubmit: boolean
  showToolbar?: boolean
  onUpdate: (input: string) => void
  onEscape: () => void
}

const modules = {
  toolbar: [
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
}
const formats = ['bold', 'italic', 'underline', 'strike', 'link']

function EditableText2(props: EditableText2Props): ReactElement {
  const [editorHtml, setEditorHtml] = useState('')
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  let reactQuillRef = null
  let quillRef = null

  useEffect(() => {
    quillRef = reactQuillRef?.getEditor()
  })

  const handleChange = (content, delta, source, editor) => {
    setEditorHtml(content)
  }

  const handleBlur = () => {
    if (props.shouldClearOnSubmit) {
      props.onUpdate(editorHtml)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key == 'Enter' && props.singleLine) {
      props.onUpdate(editorHtml)
      if (props.shouldClearOnSubmit) {
        setEditorHtml('')
      }
      // This stops an actual enter being sent
      e.preventDefault()

      // Need to blur
      quillRef.blur()
    }
  }

  const handleKeyUp = (e) => {
    if (e.key == 'Escape') {
      props.onEscape ? props.onEscape() : null
    }

    return
  }

  return (
    <ThemeProvider theme={theme}>
      <Wrapper>
        <ReactQuill
          ref={(el) => {
            reactQuillRef = el
          }}
          theme={'snow'}
          onChange={handleChange}
          value={editorHtml}
          modules={modules}
          formats={formats}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          readOnly={props.readOnly}
          placeholder={props.placeholder}
          onBlur={handleBlur}
        />
      </Wrapper>
    </ThemeProvider>
  )
}

export default EditableText2
