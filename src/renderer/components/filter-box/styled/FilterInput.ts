import styled from '../../../StyledComponents'
import { UnControlled as ReactCodeMirror } from 'react-codemirror2'
import codeMirrorCSS from 'codemirror/lib/codemirror.css'
import showHintCSS from 'codemirror/addon/hint/show-hint.css'

export const StyledCodeMirror = styled(ReactCodeMirror)`
  ${codeMirrorCSS}
  ${showHintCSS}
`
