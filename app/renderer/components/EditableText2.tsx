import React, { ReactElement, useState } from 'react'
import hljs from 'highlight.js'
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
  syntax: {
    highlight: (text) => hljs.highlightAuto(text).value,
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

  const handleChange = (content, delta, source, editor) => {
    setEditorHtml(content)
  }

  const handleKeyDown = (e) => {
    if (e.key == 'Enter') {
      console.log('enter')
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Wrapper>
        <ReactQuill
          theme={'snow'}
          onChange={handleChange}
          value={editorHtml}
          modules={modules}
          formats={formats}
          onKeyDown={handleKeyDown}
          readOnly={props.readOnly}
          placeholder={props.placeholder}
        />
      </Wrapper>
    </ThemeProvider>
  )
}

export default EditableText2
