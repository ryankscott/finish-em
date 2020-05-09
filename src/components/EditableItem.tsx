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
function EditableItem(props: EditableItemProps): ReactElement {
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
                    ref={props.innerRef}
                    onUpdate={handleUpdate}
                    singleline={true}
                    input={''}
                    shouldValidate={true}
                    validationRule={validateItemString}
                    shouldSubmitOnBlur={false}
                ></EditableText>
            </Container>
        </ThemeProvider>
    )
}

export default React.forwardRef((props: EditableItemProps, ref) => (
    <EditableItem innerRef={ref} {...props} />
))
