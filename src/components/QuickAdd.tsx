import React, { ReactElement, useEffect } from 'react'
import { connect } from 'react-redux'
import { validateItemString } from '../utils'
import EditableText from './EditableText'
import styled, { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import isElectron from 'is-electron'

if (isElectron()) {
    const electron = window.require('electron')
}

type StateProps = {
    theme: string
}

type OwnProps = {
    projectId?: string | '0'
}

type QuickAddProps = StateProps & OwnProps

const QuickAddContainer = styled.div`
    box-sizing: border-box;
    padding: 5px;
    margin: 0px;
    width: 100%;
    outline: 0px;
    *:active {
        outline: 0;
    }
`

function QuickAdd(props: QuickAddProps): ReactElement {
    const ref = React.useRef<HTMLInputElement>()

    useEffect(() => {
        ref.current.focus()
    })

    const handleEscape = (): void => {
        electron.ipcRenderer.send('close-quickadd')
    }

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <QuickAddContainer>
                <EditableText
                    fontSize="regular"
                    width="550px"
                    innerRef={ref}
                    onUpdate={(text) => {
                        electron.ipcRenderer.send('create-task', {
                            text: text,
                            projectId: props.projectId,
                        })
                        electron.ipcRenderer.send('close-quickadd')
                    }}
                    readOnly={false}
                    validation={validateItemString}
                    input=""
                    singleline={true}
                    shouldClearOnSubmit={true}
                    shouldSubmitOnBlur={false}
                    onEscape={() => handleEscape()}
                />
            </QuickAddContainer>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch): {} => ({})

export default connect(mapStateToProps, mapDispatchToProps)(QuickAdd)
