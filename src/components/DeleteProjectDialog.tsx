import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import InlineDialog from './InlineDialog'

import { Paragraph, Header3 } from './Typography'
import { themes } from '../theme'
import Button from './Button'
import { toggleDeleteProjectDialog, hideDeleteProjectDialog } from '../actions'
import {
    BodyContainer,
    ActionContainer,
    Container,
    HeaderContainer,
} from './styled/DeleteProjectDialog'

export interface DeleteProjectDialogProps {
    visible?: boolean
    onDelete: () => void
    closeDeleteProjectDialog?: () => void
    toggleDeleteProjectDialog?: () => void
}

const DeleteProjectDialog = (props: DeleteProjectDialogProps): ReactElement => {
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <InlineDialog
                onClose={() => props.closeDeleteProjectDialog()}
                placement={'bottom-start'}
                isOpen={props.visible}
                onOpen={() => {}}
                hideCloseButton={true}
                btnText="Delete"
                btnType="primary"
                content={
                    <Container>
                        <HeaderContainer>
                            <Header3>Delete Project</Header3>
                            <Button
                                spacing="default"
                                type="subtle"
                                onClick={() => props.closeDeleteProjectDialog()}
                                icon="close"
                            />
                        </HeaderContainer>
                        <BodyContainer>
                            <Paragraph>Are you sure you want to delete this project?</Paragraph>
                        </BodyContainer>
                        <ActionContainer>
                            <Button
                                type="error"
                                spacing="default"
                                onClick={props.onDelete}
                                text="Yes"
                                width={'80px'}
                            ></Button>
                            <Button
                                type="primary"
                                spacing="default"
                                onClick={() => props.closeDeleteProjectDialog()}
                                text="No"
                                width={'80px'}
                            ></Button>
                        </ActionContainer>
                    </Container>
                }
            />
        </ThemeProvider>
    )
}

const mapStateToProps = (state) => ({
    visible: state.ui.deleteProjectDialogVisible,
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({
    closeDeleteProjectDialog: () => {
        dispatch(hideDeleteProjectDialog())
    },
    toggleDeleteProjectDialog: () => {
        dispatch(toggleDeleteProjectDialog())
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(DeleteProjectDialog)
