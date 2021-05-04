import React from 'react'
import * as CodeMirror from 'codemirror'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/display/placeholder'
import './FilterMode'
import { UnControlled as ReactCodeMirror } from 'react-codemirror2'

import { ExtendedCodeMirror } from './models/ExtendedCodeMirror'
import AutoCompletePopup from './AutoCompletePopup'
import { HintInfo } from './ExtendedCodeMirror'
import { Box } from '@chakra-ui/react'

type FilterInputProps = {
  value: string
  customRenderCompletionItem: any
  needAutoCompleteValues: (codemirror: ExtendedCodeMirror, text: String) => HintInfo[]
  onSubmit: (string) => void
  onChange: (string) => void
  onBlur: () => void
  onFocus: () => void
}

const FilterInput = (props: FilterInputProps) => {
  let options: CodeMirror.EditorConfiguration
  let codeMirror: ExtendedCodeMirror
  let doc: CodeMirror.Doc
  let autoCompletePopup: AutoCompletePopup

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

    ref.editor.on('beforeChange', function (instance, change) {
      var newtext = change.text.join('').replace(/\n/g, '') // remove ALL \n !
      change.update(change.from, change.to, [newtext] as any)
      return true
    })

    ref.editor.on('changes', (e, v) => {
      const changeType = v[0].origin
      if (changeType == '+input' || changeType == 'complete') {
        autoCompletePopup.show()
      }
      autoCompletePopup.completionShow = false
    })

    ref.editor.on('focus', (cm, e?) => {
      props.onFocus()
    })

    ref.editor.on('blur', (cm, e?) => {
      onSubmit(doc.getValue())
      props.onBlur()
      autoCompletePopup.completionShow = false
    })

    ref.editor.on('keypress', (cm: ExtendedCodeMirror, e?: KeyboardEvent) => {
      autoCompletePopup.completionShow = true
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
    <Box w={'100%'} overflow={'auto !important'}>
      <ReactCodeMirror
        ref={codeMirrorRef}
        onChange={handleEditorChange}
        options={options}
        value={props.value}
      />
    </Box>
  )
}

export default FilterInput
