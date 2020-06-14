import React, { ReactElement, useEffect } from 'react'
import { connect } from 'react-redux'
import { createItem } from '../actions'
import uuidv4 from 'uuid/v4'
import { Uuid } from '@typed/uuid'
import { validateItemString } from '../utils'
import EditableText from './EditableText'
import styled from 'styled-components'

interface QuickAddProps {
    projectId?: Uuid | '0'
    onSubmit: (text: string, projectId: Uuid | '0') => void
}

const QuickAddContainer = styled.div`
    padding: 0px;
    margin: 0px;
    width: 100%;
    height: 30px;
    outline: 0px;
    *:active {
        outline: 0;
    }
`

function QuickAdd(props: QuickAddProps): ReactElement {
    const ref = React.createRef<HTMLInputElement>()

    useEffect(() => {
        ref.current.focus()
    })

    const handleEscape = (): void => {
        window.ipcRenderer.send('close-quickadd')
    }

    return (
        <QuickAddContainer>
            <EditableText
                width="550px"
                height="10px"
                innerRef={ref}
                onUpdate={(text) => {
                    props.onSubmit(text, '0')
                    window.ipcRenderer.send('close-quickadd')
                }}
                readOnly={false}
                validation={{ validate: true, rule: validateItemString }}
                input=""
                singleline={true}
                shouldClearOnSubmit={true}
                shouldSubmitOnBlur={false}
                onEscape={handleEscape}
            />
        </QuickAddContainer>
    )
}

const mapStateToProps = () => ({})

const mapDispatchToProps = (dispatch) => ({
    onSubmit: (text: string, projectId: Uuid | '0') => {
        dispatch(createItem(uuidv4(), text, projectId, null))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(QuickAdd)
