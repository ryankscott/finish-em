import React, { ReactElement, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { Manager, Reference, Popper } from 'react-popper'

import { themes } from '../theme'
import Button from './Button'
import { HeaderContainer, Container, BodyContainer } from './styled/InlineDialog'
import { connect } from 'react-redux'

interface StateProps {
    theme: string
}
interface OwnProps {
    isOpen: boolean
    onOpen?: () => void
    onClose?: () => void
    hideCloseButton: boolean
    placement:
        | 'auto'
        | 'auto-start'
        | 'auto-end'
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
    children: ReactElement
}
type InlineDialogProps = OwnProps & StateProps

function InlineDialog(props: InlineDialogProps): ReactElement {
    const node = React.createRef<HTMLDivElement>()

    const handleClick = (e): void => {
        // Don't close if we're clicking on the dialog
        if (e && node.current && node.current.contains(e.target)) {
            return
        }
        // Only close if it's currently open
        if (props.isOpen) {
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

    return (
        <Manager>
            <Reference>{({ ref }) => <div ref={ref}>{props.children}</div>}</Reference>
            <Popper placement={props.placement}>
                {({ ref, style, arrowProps }) => (
                    <div
                        ref={ref}
                        style={{ zIndex: 100, ...style }}
                        data-placement={props.placement}
                    >
                        <ThemeProvider theme={themes[props.theme]}>
                            <Container ref={node} visible={props.isOpen}>
                                {!props.hideCloseButton && (
                                    <HeaderContainer>
                                        <Button
                                            spacing="default"
                                            type="default"
                                            onClick={props.onClose}
                                            icon="close"
                                        />
                                    </HeaderContainer>
                                )}
                                <BodyContainer>{props.content}</BodyContainer>
                            </Container>
                        </ThemeProvider>
                        <div ref={arrowProps.ref} style={arrowProps.style} />
                    </div>
                )}
            </Popper>
        </Manager>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(InlineDialog)
