import React, { Component, ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import {
  Editor,
  EditorState,
  ContentState,
  CompositeDecorator,
  SelectionState,
  Modifier,
} from 'draft-js'
import isElectron from 'is-electron'
import { itemRegex } from '../utils'

import { validateItemString } from '../utils'
import './EditableItem.css'
import { theme } from '../theme'
import { addIcon } from '../assets/icons'
import { ValidationBox, Icon } from './styled/EditableItem'

const styles = {
  itemType: {
    fontFamily: theme.font.sansSerif,
    fontSize: theme.fontSizes.small,
    color: theme.colours.primaryColour,
  },
}

const findWithRegex = (regex, contentBlock, callback) => {
  const text = contentBlock.getText()
  let matchArr, start
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index
    callback(start, start + matchArr[0].length)
  }
}

const itemTypeStrategy = (contentBlock, callback, contentState) => {
  findWithRegex(itemRegex, contentBlock, callback)
}

const itemTypeSpan = (props): ReactElement => (
  <span style={styles.itemType} data-offset-key={props.offsetKey}>
    {props.children}
  </span>
)

const compositeDecorator = new CompositeDecorator([
  {
    strategy: itemTypeStrategy,
    component: itemTypeSpan,
  },
])

interface EditableItemProps {
  text: string
  readOnly: boolean
  innerRef: React.RefObject<HTMLInputElement>
  onSubmit: (t: string) => void
  onEscape?: () => void
}
interface EditableItemState {
  valid: boolean
  readOnly: boolean
  animate: boolean
  editorState: EditorState
}
class EditableItem extends Component<EditableItemProps, EditableItemState> {
  constructor(props: EditableItemProps) {
    super(props)
    const es = EditorState.createWithContent(
      ContentState.createFromText(this.props.text ? this.props.text : ''),
      compositeDecorator,
    )
    this.state = {
      valid: true,
      readOnly: this.props.readOnly,
      editorState: es,
      animate: false,
    }

    this.handleReturn = this.handleReturn.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.validateInput = this.validateInput.bind(this)
    this.clearInput = this.clearInput.bind(this)
    this.onFocus = this.onFocus.bind(this)
  }

  validateInput(): void {
    const text = this.state.editorState
      .getCurrentContent()
      .getPlainText('\u0001')
    const valid = validateItemString(text)
    valid
      ? this.setState({
          valid,
          animate: false,
        })
      : this.setState({ valid })
    return
  }

  clearInput(): void {
    let { editorState } = this.state
    /*
     TODO: There has to be a better way. This doesn't work
    this.setState({
      editorState: EditorState.createEmpty(compositeDecorator)
    }); */

    let contentState = editorState.getCurrentContent()
    const firstBlock = contentState.getFirstBlock()
    const lastBlock = contentState.getLastBlock()
    const allSelected = new SelectionState({
      anchorKey: firstBlock.getKey(),
      anchorOffset: 0,
      focusKey: lastBlock.getKey(),
      focusOffset: lastBlock.getLength(),
      hasFocus: true,
    })
    contentState = Modifier.removeRange(contentState, allSelected, 'backward')
    editorState = EditorState.push(editorState, contentState, 'remove-range')
    editorState = EditorState.forceSelection(
      editorState,
      contentState.getSelectionAfter(),
    )
    this.setState({ editorState })
    return
  }

  handleReturn(): string {
    if (this.state.valid) {
      this.props.onSubmit(
        this.state.editorState.getCurrentContent().getPlainText(''),
      )
      this.clearInput()
      if (isElectron()) {
        window.ipcRenderer.send('close-quickadd')
      }
    } else {
      this.setState(
        {
          animate: true,
        },
        () => setTimeout(() => this.setState({ animate: false }), 200),
      )
    }

    return 'handled'
  }

  handleKeyDown(e, es, et): void {
    if (e.key == 'Escape') {
      this.clearInput()
      this.props.onEscape()
      if (isElectron()) {
        window.ipcRenderer.send('close-quickadd')
      }
    }
    return
  }

  handleChange(e): void {
    this.validateInput()
    this.setState({ editorState: e })
    return
  }

  onFocus(e): void {
    this.setState({
      editorState: EditorState.moveFocusToEnd(this.state.editorState),
    })
    return
  }

  render(): ReactElement {
    return (
      <ThemeProvider theme={theme}>
        <ValidationBox animate={this.state.animate} valid={this.state.valid}>
          <Icon>{addIcon()}</Icon>
          <Editor
            ref={this.props.innerRef}
            handleReturn={this.handleReturn}
            editorState={this.state.editorState}
            readOnly={this.state.readOnly}
            onChange={this.handleChange}
            keyBindingFn={this.handleKeyDown}
            onFocus={this.onFocus}
          />
        </ValidationBox>
      </ThemeProvider>
    )
  }
}

export default React.forwardRef((props: EditableItemProps, ref) => (
  <EditableItem innerRef={ref} {...props} />
))
