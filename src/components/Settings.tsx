import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Switch from 'react-switch'
import { connect } from 'react-redux'
import { toggleDarkMode, setLabelColour, renameLabel } from '../actions'
import { FeatureType, LabelType, Labels } from '../interfaces'
import {
    enableDragAndDrop,
    disableDragAndDrop,
    toggleDragAndDrop,
    toggleProjectDates,
} from '../actions/feature'
import {
    Container,
    Setting,
    SettingsContainer,
    SettingsCategory,
    SettingLabel,
    SettingsCategoryHeader,
    Popover,
    StyledTwitterPicker,
    LabelContainer,
} from './styled/Settings'
import EditableText from './EditableText'
import { transparentize } from 'polished'
import Button from './Button'
import ViewHeader from './ViewHeader'

interface StateProps {
    features: FeatureType
    theme: string
    labels: Labels
}

interface OwnProps {}

interface DispatchProps {
    enableDragAndDrop: () => void
    disableDragAndDrop: () => void
    toggleDragAndDrop: () => void
    toggleDarkMode: () => void
    setLabelColour: (id: string, colour: string) => void
    renameLabel: (id: string, text: string) => void
    toggleProjectDates: () => void
}

type SettingsPickerProps = StateProps & DispatchProps & OwnProps

function Settings(props: SettingsPickerProps): ReactElement {
    const theme = themes[props.theme]
    const [showColourPicker, setShowColourPicker] = useState(false)
    const [colourPickerTriggeredBy, setColourPickerTriggeredBy] = useState(null)

    let labelText = null
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <ViewHeader name={'Settings'} icon="settings" />
                <SettingsContainer>
                    <SettingsCategory>
                        <SettingsCategoryHeader>General User interface</SettingsCategoryHeader>
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
                            <SettingLabel>Project dates</SettingLabel>
                            <Switch
                                onChange={() => props.toggleProjectDates()}
                                checked={props.features?.projectDates}
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
                    </SettingsCategory>
                    <SettingsCategory>
                        <SettingsCategoryHeader>Labels</SettingsCategoryHeader>
                        {Object.values(props.labels.labels).map((m: LabelType) => {
                            labelText = React.useRef<HTMLInputElement>()
                            return (
                                <div id={m.id} key={'f-' + m.id}>
                                    <LabelContainer key={'lc-' + m.id}>
                                        <EditableText
                                            key={'et-' + m.id}
                                            input={m.name}
                                            backgroundColour={transparentize(0.9, m.colour)}
                                            fontSize={'xxsmall'}
                                            innerRef={labelText}
                                            shouldSubmitOnBlur={true}
                                            onEscape={() => {
                                                labelText.current.blur()
                                            }}
                                            singleline={true}
                                            shouldClearOnSubmit={false}
                                            onUpdate={(e) => {
                                                props.renameLabel(m.id, e)
                                                labelText.current.blur()
                                            }}
                                        ></EditableText>
                                        <Button
                                            id={m.id}
                                            key={'col-' + m.id}
                                            icon="colour"
                                            iconSize={'18px'}
                                            spacing="compact"
                                            type="default"
                                            onClick={(e) => {
                                                setShowColourPicker(!showColourPicker)
                                                setColourPickerTriggeredBy(m.id)
                                                e.stopPropagation()
                                            }}
                                        />
                                    </LabelContainer>
                                </div>
                            )
                        })}
                        {showColourPicker && (
                            <Popover
                                top={
                                    document.getElementById(colourPickerTriggeredBy).offsetTop + 25
                                }
                                left={document.getElementById(colourPickerTriggeredBy).offsetLeft}
                            >
                                <StyledTwitterPicker
                                    key={'tp-'}
                                    width={'210px'}
                                    triangle={'hide'}
                                    colors={[
                                        theme.colours.primaryColour,
                                        theme.colours.secondaryColour,
                                        theme.colours.tertiaryColour,
                                        theme.colours.quarternaryColour,
                                        theme.colours.penternaryColour,
                                    ]}
                                    onChange={(colour, e) => {
                                        props.setLabelColour(colourPickerTriggeredBy, colour.hex)
                                        setShowColourPicker(false)
                                        e.stopPropagation()
                                    }}
                                />
                            </Popover>
                        )}
                    </SettingsCategory>
                </SettingsContainer>
            </Container>
        </ThemeProvider>
    )
}
const mapStateToProps = (state): StateProps => ({
    features: state.features,
    theme: state.ui.theme,
    labels: state.ui.labels,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    toggleDarkMode: () => {
        dispatch(toggleDarkMode())
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
    toggleProjectDates: () => {
        dispatch(toggleProjectDates())
    },
    setLabelColour: (id: string, colour: string) => {
        dispatch(setLabelColour(id, colour))
    },
    renameLabel: (id: string, text: string) => {
        dispatch(renameLabel(id, text))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Settings)
