import React, { ReactElement } from 'react'
import isElectron from 'is-electron'

import { validateItemString } from '../utils'
import './EditableItem.css'
import { theme } from '../theme'
import { addIcon } from '../assets/icons'
import { ThemeProvider } from 'styled-components'
import { Container, Icon } from './styled/EditableItem'
import EditableText from './EditableText'

interface EditableItemProps {
    hideIcon?: boolean
    text: string
    readOnly: boolean
    innerRef?: React.RefObject<HTMLInputElement>
    onSubmit: (t: string) => void
    onEscape?: () => void
}
function InternalEditableItem(props: EditableItemProps): ReactElement {
    const handleUpdate = (value): void => {
        props.onSubmit(value)
        if (isElectron()) {
            window.ipcRenderer.send('close-quickadd')
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <Container hideIcon={props.hideIcon}>
                {props.hideIcon ? null : <Icon>{addIcon()}</Icon>}
                <EditableText
                    innerRef={props.innerRef}
                    onUpdate={handleUpdate}
                    singleline={true}
                    input={''}
                    validation={{
                        validate: true,
                        rule: validateItemString,
                    }}
                    shouldSubmitOnBlur={false}
                    shouldClearOnSubmit={true}
                />
            </Container>
        </ThemeProvider>
    )
}

const EditableItem = React.forwardRef(
    (props: EditableItemProps, ref: React.RefObject<HTMLInputElement>) => (
        <InternalEditableItem innerRef={ref} {...props} />
    ),
)

EditableItem.displayName = 'EditableItem'
export default EditableItem
