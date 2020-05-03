import React, { ReactElement, useState } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { Button } from './Button'
import Switch from 'react-switch'
import { Paragraph } from './Typography'
import { connect } from 'react-redux'
import { showSidebar } from '../actions'
import { FeatureType } from '../interfaces'
import {
    enableDragAndDrop,
    disableDragAndDrop,
    toggleDragAndDrop,
} from '../actions/feature'

const Container = styled.div``

const Setting = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    padding: 5px 5px;
    width: 100%;
    height: 25px;
    align-items: bottom;
    justify-content: 'center';
`
const SettingLabel = styled(Paragraph)`
    color: ${(props) => props.theme.colours.altTextColour};
    font-size: ${(props) => props.theme.fontSizes.xxsmall};
    margin: 0px 10px;
    margin-right: 15px;
`

const SettingsContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    width: 100%;
    margin: 10px 5px;
`
interface StateProps {
    features: FeatureType
    sidebarVisible: boolean
}

interface OwnProps {}

interface DispatchProps {
    showSidebar: () => void
    enableDragAndDrop: () => void
    disableDragAndDrop: () => void
    toggleDragAndDrop: () => void
}

type SettingsPickerProps = StateProps & DispatchProps & OwnProps

function Settings(props: SettingsPickerProps): ReactElement {
    const [showSettings, setShowSettings] = useState(false)
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
                    </SettingsContainer>
                )}
            </Container>
        </ThemeProvider>
    )
}
const mapStateToProps = (state): StateProps => ({
    features: state.features,
    sidebarVisible: state.ui.sidebarVisible,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
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
