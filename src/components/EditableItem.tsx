import React, { ReactElement, useState } from 'react'
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
import { ThemeProvider } from 'styled-components'
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
    hideIcon?: boolean
    text: string
    readOnly: boolean
    innerRef?: React.RefObject<HTMLInputElement>
    onSubmit: (t: string) => void
    onEscape?: () => void
}
function EditableItem(props: EditableItemProps): ReactElement {
    const es = EditorState.createWithContent(
        ContentState.createFromText(props.text ? props.text : ''),
        compositeDecorator,
    )
    const [valid, setValid] = useState(true)
    const [animate, setAnimate] = useState(false)
    const [editorState, setEditorState] = useState(es)

    const validateInput = (): void => {
        const text = editorState.getCurrentContent().getPlainText('\u0001')
        const valid = validateItemString(text)
        if (valid) {
            setAnimate(false)
        }
        setValid(valid)
        return
    }

    const clearInput = (): void => {
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
        contentState = Modifier.removeRange(
            contentState,
            allSelected,
            'backward',
        )
        editorState = EditorState.push(
            editorState,
            contentState,
            'remove-range',
        )
        editorState = EditorState.forceSelection(
            editorState,
            contentState.getSelectionAfter(),
        )
        setEditorState(editorState)
        return
    }

    const handleReturn = (): string => {
        if (valid) {
            props.onSubmit(editorState.getCurrentContent().getPlainText(''))
            clearInput()
            if (isElectron()) {
                window.ipcRenderer.send('close-quickadd')
            }
        } else {
            setAnimate(true)
            setTimeout(() => setAnimate(false), 200)
        }

        return 'handled'
    }

    const handleKeyDown = (e, es, et): void => {
        if (e.key == 'Escape') {
            clearInput()
            props.onEscape()
            if (isElectron()) {
                window.ipcRenderer.send('close-quickadd')
            }
        }
        // Don't try remove text if there is none
        if (
            e.key == 'Backspace' &&
            editorState.getCurrentContent().getPlainText() == ''
        ) {
            e.preventDefault()
        }
        return
    }

    const handleChange = (e): void => {
        validateInput()
        setEditorState(e)
        return
    }

    const onFocus = (e): void => {
        setEditorState(EditorState.moveFocusToEnd(editorState))
        return
    }

    return (
        <ThemeProvider theme={theme}>
            <ValidationBox
                animate={animate}
                valid={valid}
                hideIcon={props.hideIcon}
            >
                {props.hideIcon ? null : <Icon>{addIcon()}</Icon>}
                <Editor
                    ref={props.innerRef}
                    handleReturn={handleReturn}
                    editorState={editorState}
                    readOnly={props.readOnly}
                    onChange={handleChange}
                    keyBindingFn={handleKeyDown}
                    onFocus={onFocus}
                />
            </ValidationBox>
        </ThemeProvider>
    )
}

export default React.forwardRef((props: EditableItemProps, ref) => (
    <EditableItem innerRef={ref} {...props} />
))
