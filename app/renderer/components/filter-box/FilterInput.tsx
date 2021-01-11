import React, { ReactElement } from 'react'
import * as CodeMirror from 'codemirror'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/display/placeholder'
import './FilterMode'
import { UnControlled as ReactCodeMirror } from 'react-codemirror2'
import { ThemeProvider } from '../../StyledComponents'

import { gql, useQuery } from '@apollo/client'
import grammarUtils from './GrammarUtils'
import { ExtendedCodeMirror } from './models/ExtendedCodeMirror'
import AutoCompletePopup from './AutoCompletePopup'
import { themes } from '../../theme'
import { HintInfo } from './ExtendedCodeMirror'

const GET_THEME = gql`
  query {
    theme @client
  }
`

type FilterInputProps = {
  value: string
  customRenderCompletionItem: any
  needAutoCompleteValues: (codemirror: ExtendedCodeMirror, text: String) => HintInfo[]
  onSubmit: (string) => void
  onChange: (string) => void
  onBlur: () => void
  onFocus: () => void
  editorConfig: {}
}

const FilterInput = (props: FilterInputProps) => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme = themes[data.theme]

  let options: CodeMirror.EditorConfiguration
  let codeMirror: ExtendedCodeMirror
  let doc: CodeMirror.Doc
  let autoCompletePopup: AutoCompletePopup

  if (props.editorConfig) {
    options = { ...props.editorConfig, mode: 'filter-mode' }
  }

  const findLastSeparatorPositionWithEditor = () => {
    var doc = codeMirror.getDoc()
    var currentCursor = doc.getCursor()
    var text = doc.getRange({ line: 0, ch: 0 }, currentCursor)
    var index = grammarUtils.findLastSeparatorIndex(text)
    return {
      line: currentCursor.line,
      ch: currentCursor.ch - (text.length - index) + 1,
    }
  }

  const handlePressingAnyCharacter = () => {
    if (autoCompletePopup.completionShow) {
      return
    }
    autoCompletePopup.show()
  }

  const onSubmit = (text: string) => {
    autoCompletePopup.completionShow = false
    if (props.onSubmit) {
      props.onSubmit(text)
    }
  }

  const codeMirrorRef = (ref: { editor: ExtendedCodeMirror }) => {
    if (ref == null) return
    if (codeMirror == ref.editor) {
      return
    }
    codeMirror = ref.editor
    doc = ref.editor.getDoc()
    autoCompletePopup = new AutoCompletePopup(codeMirror, (text) =>
      props.needAutoCompleteValues(codeMirror, text),
    )

    autoCompletePopup.customRenderCompletionItem = props.customRenderCompletionItem
    autoCompletePopup.pick = props.autoCompletePick

    ref.editor.on('beforeChange', function (instance, change) {
      var newtext = change.text.join('').replace(/\n/g, '') // remove ALL \n !
      change.update(change.from, change.to, [newtext] as any)
      return true
    })

    ref.editor.on('changes', () => {
      handlePressingAnyCharacter()
    })

    ref.editor.on('focus', (cm, e?) => {
      handlePressingAnyCharacter()
      props.onFocus(e)
    })

    ref.editor.on('blur', (cm, e?) => {
      autoCompletePopup.completionShow = false
      onSubmit(doc.getValue())
      props.onBlur(e)
    })

    ref.editor.on('keyup', (cm: ExtendedCodeMirror, e?: KeyboardEvent) => {
      if (e.key == 'enter' || e.key == 'escape') {
        autoCompletePopup.completionShow = false
      }
    })
  }

  const handleEditorChange = (
    _editor: IInstance,
    _data: CodeMirror.EditorChange,
    value: string,
  ) => {
    props.onChange(value)
  }

  return (
    <ThemeProvider theme={theme}>
      <ReactCodeMirror
        ref={codeMirrorRef}
        onChange={handleEditorChange}
        options={options}
        value={props.value}
      />
    </ThemeProvider>
  )
}

export default FilterInput
