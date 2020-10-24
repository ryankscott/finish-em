import React, { ReactElement, useEffect } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { hideShortcutDialog } from '../actions'

import { connect } from 'react-redux'
import { Container, ShortcutsContainer, CloseButtonContainer } from './styled/ShortcutDialog'
import marked from 'marked'

import shortcutsText from '../assets/shortcuts.md'
import Button from './Button'

interface StateProps {
    isOpen: boolean
    theme: string
}
interface DispatchProps {
    closeShortcutDialog: () => void
}
type ShortcutDialogProps = StateProps & DispatchProps
function ShortcutDialog(props: ShortcutDialogProps): ReactElement {
    const node = React.useRef()

    const handleClick = (e: React.MouseEvent): void => {
        // Don't handle if we're clicking on the shortcut icon again
        if (e.target.id == 'shortcut-button' || e.target.id == 'help') return
        if (e.target?.parentElement?.id == 'help') return
        // Don't close if we're clicking on the dialog
        if (e && this?.node?.current?.contains(e.target)) return
        // Only close if it's currently open
        if (props.isOpen) {
            props.closeShortcutDialog()
        }
        return
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, false)
        return () => {
            document.removeEventListener('mousedown', handleClick)
        }
    })

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
        if (e.key == 'Escape') {
            props.closeShortcutDialog()
        }
        return
    }

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container
                ref={node}
                isOpen={props.isOpen}
                onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => handleKeyDown(e)}
            >
                <CloseButtonContainer>
                    <Button type="default" onClick={() => props.closeShortcutDialog} icon="close" />
                </CloseButtonContainer>
                <ShortcutsContainer
                    dangerouslySetInnerHTML={{ __html: marked(shortcutsText, { breaks: true }) }}
                ></ShortcutsContainer>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    isOpen: state.ui.shortcutDialogVisible,
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    closeShortcutDialog: () => {
        dispatch(hideShortcutDialog())
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(ShortcutDialog)
