import React, { ReactElement, useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import uuidv4 from 'uuid'

import { themes } from '../theme'
import Button from './Button'
import { HeaderContainer, Dialog, BodyContainer, Container } from './styled/InlineDialog'
import { connect } from 'react-redux'
import { IconType } from '../interfaces'

interface StateProps {
    theme: string
}
interface OwnProps {
    btnType: 'error' | 'default' | 'primary' | 'invert' | 'subtle' | 'subtleInvert'
    btnIcon?: IconType
    btnText?: string
    isOpen: boolean
    onOpen?: () => void
    onClose?: () => void
    hideCloseButton: boolean
    placement:
        | 'top'
        | 'top-start'
        | 'top-end'
        | 'bottom'
        | 'bottom-start'
        | 'bottom-end'
        | 'right'
        | 'right-start'
        | 'right-end'
        | 'left'
        | 'left-start'
        | 'left-end'
    content: ReactElement
}

type InlineDialogProps = OwnProps & StateProps

function InlineDialog(props: InlineDialogProps): ReactElement {
    const node = React.useRef<HTMLDivElement>()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [buttonPosition, setButtonPosition] = useState(null)

    const handleClick = (e): void => {
        // Only close if it's currently open
        if (dialogOpen) {
            setDialogOpen(false)
            props.onClose()
        }
        return
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClick, false)
        return () => {
            document.removeEventListener('mousedown', handleClick, false)
        }
    })

    const btnUuid = uuidv4()

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container ref={node}>
                <Button
                    id={btnUuid}
                    type={props.btnType}
                    text={props.btnText}
                    icon={props.btnIcon}
                    onClick={() => {
                        setDialogOpen(!dialogOpen)
                        setButtonPosition(document.getElementById(btnUuid)?.getBoundingClientRect())
                        props.onOpen()
                    }}
                />
                {dialogOpen && (
                    <Dialog
                        buttonPosition={buttonPosition ? buttonPosition : null}
                        placement={props.placement}
                    >
                        {!props.hideCloseButton && (
                            <HeaderContainer>
                                <Button
                                    spacing="default"
                                    type="default"
                                    onClick={() => {
                                        setDialogOpen(false)
                                    }}
                                    icon="close"
                                />
                            </HeaderContainer>
                        )}
                        <BodyContainer>{props.content}</BodyContainer>
                    </Dialog>
                )}
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(InlineDialog)
