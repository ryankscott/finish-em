import React, { ReactElement, useState, useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'

import { Paragraph, Header3 } from './Typography'
import { themes } from '../theme'
import Button from './Button'
import {
    BodyContainer,
    ActionContainer,
    Container,
    CloseButton,
    Dialog,
    HeaderContainer,
} from './styled/DeleteProjectDialog'

interface StateProps {
    theme: string
}

interface DispatchProps {
    onDelete: () => void
}

type DeleteProjectDialogProps = StateProps & DispatchProps

const DeleteProjectDialog = (props: DeleteProjectDialogProps): ReactElement => {
    const [dialogOpen, setDialogOpen] = useState(false)
    const node = React.useRef<HTMLDivElement>()
    const handleClick = (e): void => {
        if (e && node.current && node.current.contains(e.target)) {
            return
        }
        // Only close if it's currently open
        if (dialogOpen) {
            setDialogOpen(false)
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
        <ThemeProvider theme={themes[props.theme]}>
            <Container ref={node} onClick={handleClick}>
                <Button
                    type="primary"
                    text="Delete"
                    icon="trash"
                    width="80px"
                    onClick={() => {
                        setDialogOpen(!dialogOpen)
                    }}
                />
                {dialogOpen && (
                    <Dialog>
                        <HeaderContainer>
                            <Header3>Delete Project</Header3>
                            <CloseButton>
                                <Button
                                    type="subtle"
                                    icon="close"
                                    onClick={() => {
                                        setDialogOpen(false)
                                    }}
                                />
                            </CloseButton>
                        </HeaderContainer>
                        <BodyContainer>
                            <Paragraph>Are you sure you want to delete this project?</Paragraph>
                        </BodyContainer>
                        <ActionContainer>
                            <Button
                                type="error"
                                spacing="default"
                                onClick={() => {
                                    props.onDelete()
                                }}
                                text="Yes"
                                width={'80px'}
                            ></Button>
                            <Button
                                type="primary"
                                spacing="default"
                                onClick={() => {
                                    setDialogOpen(false)
                                }}
                                text="No"
                                width={'80px'}
                            ></Button>
                        </ActionContainer>
                    </Dialog>
                )}
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({})

export default connect(mapStateToProps, mapDispatchToProps)(DeleteProjectDialog)
