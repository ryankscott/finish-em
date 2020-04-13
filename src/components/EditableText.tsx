import React, { Component, ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import marked from 'marked'
import { setEndOfContenteditable } from '../utils'
import { Paragraph, Title, Header } from './Typography'
import { Container } from './styled/EditableText'

interface EditableTextProps {
  input: string
  innerRef: React.RefObject<HTMLInputElement>
  onUpdate: (input: string) => void
  readOnly?: boolean
  width?: string
  height?: string
  singleline?: boolean
  style?: typeof Title | typeof Paragraph | typeof Header
}
interface EditableTextState {
  input: string
  editable: boolean
}

class EditableText extends Component<EditableTextProps, EditableTextState> {
  constructor(props) {
    super(props)
    this.state = {
      input: this.props.input,
      editable: false,
    }
    this.handleBlur = this.handleBlur.bind(this)
    this.handleFocus = this.handleFocus.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.getMarkdownText = this.getMarkdownText.bind(this)
    this.getRawText = this.getRawText.bind(this)
  }

  handleBlur(e): void {
    // Ignore events if it's read only
    if (this.props.readOnly) return
    // Ignore events if we're not editing
    if (!this.state.editable) return
    this.setState({
      editable: false,
      input: this.props.innerRef.current.innerText,
    })
    this.props.onUpdate(this.props.innerRef.current.innerText)
    return
  }

  handleClick(e): void {
    if (this.props.readOnly) return
    // Handle links normally
    if (e.target.nodeName == 'A') {
      return
    }
    // Ignore clicks if it's already editable
    if (this.state.editable) return
    this.setState({ editable: true })
    return
  }

  handleKeyPress(e): void {
    if (this.props.readOnly) return
    // TODO: We should be able to call this at the Item and have the ability to update the text
    if (e.key == 'Enter' && this.props.singleline) {
      this.setState({
        editable: false,
        input: this.props.innerRef.current.innerText.trim(),
      })
      this.props.onUpdate(this.props.innerRef.current.innerText.trim())
      this.props.innerRef.current.blur()
      e.preventDefault()
    } else if (e.key == 'Escape') {
      this.setState({
        editable: false,
        input: this.props.innerRef.current.innerText,
      })
      this.props.innerRef.current.blur()
      e.preventDefault()
    }
    return
  }

  // TODO: Fix the return type
  // NOTE: We have to replace newlines with HTML breaks
  getRawText(): {} {
    return { __html: this.state.input.replace(/\n/gi, '<br/>') }
  }

  // TODO: Fix the return type
  getMarkdownText(): {} {
    return { __html: marked(this.state.input) }
  }

  handleFocus(e): void {
    // NOTE: Weirdly Chrome sometimes fires a focus event before a click
    if (e.target.nodeName == 'A') {
      return
    }
    if (!this.state.editable) {
      this.setState({ editable: true }, () => {
        setEndOfContenteditable(this.props.innerRef.current)
      })
    }
    return
  }

  render(): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <Container
          as={this.props.style || Paragraph}
          readOnly={this.props.readOnly}
          ref={this.props.innerRef}
          width={this.props.width}
          height={this.props.height}
          contentEditable={this.state.editable}
          onClick={this.handleClick}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          tabIndex={-1}
          editing={this.state.editable}
          onKeyPress={this.handleKeyPress}
          dangerouslySetInnerHTML={
            this.state.editable ? this.getRawText() : this.getMarkdownText()
          }
        />
      </ThemeProvider>
    )
  }
}

export default React.forwardRef(
  (props: EditableTextProps, ref: React.RefObject<HTMLInputElement>) => (
    <EditableText innerRef={ref} {...props} />
  ),
)
