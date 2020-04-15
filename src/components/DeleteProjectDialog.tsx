import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { connect } from 'react-redux'
import InlineDialog from './InlineDialog'

import { Header2, Paragraph } from './Typography'
import { theme } from '../theme'
import { Button } from './Button'
import { toggleDeleteProjectDialog, hideDeleteProjectDialog } from '../actions'
import { BodyContainer, ActionContainer } from './styled/DeleteProjectDialog'

export interface DeleteProjectDialogProps {
    visible?: boolean
    onDelete: () => void
    closeDeleteProjectDialog?: () => void
    toggleDeleteProjectDialog?: () => void
}

const DeleteProjectDialog = (props: DeleteProjectDialogProps): ReactElement => {
    return (
        <ThemeProvider theme={theme}>
            <InlineDialog
                onClose={() => props.closeDeleteProjectDialog()}
                placement={'bottom-start'}
                isOpen={props.visible}
                onOpen={() => {}}
                content={
                    <div>
                        <Header2>Delete Project</Header2>
                        <BodyContainer>
                            <Paragraph>
                                Are you sure you want to delete this project?
                            </Paragraph>
                        </BodyContainer>
                        <ActionContainer>
                            <Button
                                type="error"
                                spacing="compact"
                                onClick={props.onDelete}
                                text="Yes"
                            ></Button>
                            <Button
                                type="primary"
                                spacing="compact"
                                onClick={() => props.closeDeleteProjectDialog()}
                                text="No"
                            ></Button>
                        </ActionContainer>
                    </div>
                }
            >
                <Button
                    type="primary"
                    onClick={() => props.toggleDeleteProjectDialog()}
                    spacing="compact"
                    text="Delete"
                ></Button>
            </InlineDialog>
        </ThemeProvider>
    )
}

const mapStateToProps = (state) => ({
    visible: state.ui.deleteProjectDialogVisible,
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
