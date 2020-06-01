import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import Button from './Button'
import Switch from 'react-switch'
import { connect } from 'react-redux'
import { showSidebar, toggleDarkMode } from '../actions'
import { FeatureType } from '../interfaces'
import {
    enableDragAndDrop,
    disableDragAndDrop,
    toggleDragAndDrop,
} from '../actions/feature'
import {
    Container,
    Setting,
    SettingsContainer,
    SettingLabel,
} from './styled/Settings'

interface StateProps {
    features: FeatureType
    sidebarVisible: boolean
    theme: string
}

interface OwnProps {}

interface DispatchProps {
    showSidebar: () => void
    enableDragAndDrop: () => void
    disableDragAndDrop: () => void
    toggleDragAndDrop: () => void
    toggleDarkMode: () => void
}

type SettingsPickerProps = StateProps & DispatchProps & OwnProps

function Settings(props: SettingsPickerProps): ReactElement {
    const [showSettings, setShowSettings] = useState(false)
    const theme = themes[props.theme]
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Button
                    spacing="compact"
                    icon="settings"
                    type="invert"
                    onClick={() => {
                        if (!props.sidebarVisible) {
                            props.showSidebar()
                            setShowSettings(true)
                            return
                        }
                        setShowSettings(!showSettings)
                    }}
                    text={props.sidebarVisible ? 'Settings' : ''}
                    iconSize="16px"
                />
                {showSettings && props.sidebarVisible && (
                    <SettingsContainer>
                        <Setting>
                            <SettingLabel>Drag and drop</SettingLabel>
                            <Switch
                                onChange={() => props.toggleDragAndDrop()}
                                checked={props.features.dragAndDrop}
                                onColor={theme.colours.primaryColour}
                                checkedIcon={false}
                                uncheckedIcon={false}
                                width={24}
                                height={14}
                            />
                        </Setting>
                        <Setting>
                            <SettingLabel>Dark mode</SettingLabel>
                            <Switch
                                onChange={() => props.toggleDarkMode()}
                                checked={props.theme == 'dark'}
                                onColor={theme.colours.primaryColour}
                                checkedIcon={false}
                                uncheckedIcon={false}
                                width={24}
                                height={14}
                            />
                        </Setting>
                    </SettingsContainer>
                )}
            </Container>
        </ThemeProvider>
    )
}
const mapStateToProps = (state): StateProps => ({
    features: state.features,
    sidebarVisible: state.ui.sidebarVisible,
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    toggleDarkMode: () => {
        dispatch(toggleDarkMode())
    },
    showSidebar: () => {
        dispatch(showSidebar())
    },
    enableDragAndDrop: () => {
        dispatch(enableDragAndDrop())
    },
    disableDragAndDrop: () => {
        dispatch(disableDragAndDrop())
    },
    toggleDragAndDrop: () => {
        dispatch(toggleDragAndDrop())
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Settings)
