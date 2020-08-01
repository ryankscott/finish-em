import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Switch from 'react-switch'
import { connect } from 'react-redux'
import { toggleDarkMode, setLabelColour, renameLabel, createLabel } from '../actions'
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
import { transparentize, parseToHsl } from 'polished'
import Button from './Button'
import ViewHeader from './ViewHeader'
import { deleteLabel } from '../actions/ui'
import randomColor from 'randomcolor'

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
    createLabel: (colour: string) => void
    deleteLabel: (id: string) => void
}

type SettingsPickerProps = StateProps & DispatchProps & OwnProps

function Settings(props: SettingsPickerProps): ReactElement {
    const theme = themes[props.theme]
    const [showColourPicker, setShowColourPicker] = useState(false)
    const [colourPickerTriggeredBy, setColourPickerTriggeredBy] = useState(null)
    const labelColours = [
        '#D9E3F0',
        '#F47373',
        '#697689',
        '#37D67A',
        '#2CCCE4',
        '#555555',
        '#dce775',
        '#ff8a65',
        '#ba68c8',
    ]
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <ViewHeader name={'Settings'} icon="settings" />
                <SettingsContainer
                    onClick={() => {
                        setShowColourPicker(false)
                    }}
                >
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
                            return (
                                <div id={m.id} key={'f-' + m.id}>
                                    <LabelContainer key={'lc-' + m.id}>
                                        <EditableText
                                            key={'et-' + m.id}
                                            input={m.name}
                                            backgroundColour={transparentize(0.8, m.colour)}
                                            fontSize={'xxsmall'}
                                            innerRef={React.createRef()}
                                            shouldSubmitOnBlur={true}
                                            onEscape={() => {}}
                                            singleline={true}
                                            shouldClearOnSubmit={false}
                                            onUpdate={(e) => {
                                                props.renameLabel(m.id, e)
                                            }}
                                        ></EditableText>
                                        <Button
                                            id={`${m.id}`}
                                            key={`edit-colour-${m.id}`}
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
                                        <Button
                                            id={`${m.id}`}
                                            key={`delete-label-${m.id}`}
                                            icon="trash"
                                            iconSize={'18px'}
                                            spacing="compact"
                                            type="default"
                                            onClick={(e) => {
                                                props.deleteLabel(m.id)
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
                                    key={'tp'}
                                    triangle={'hide'}
                                    colors={labelColours}
                                    onChange={(colour, e) => {
                                        props.setLabelColour(colourPickerTriggeredBy, colour.hex)
                                        setShowColourPicker(false)
                                        e.stopPropagation()
                                    }}
                                />
                            </Popover>
                        )}
                        <Button
                            type="default"
                            spacing="compact"
                            icon="add"
                            text="Add label"
                            onClick={() => {
                                props.createLabel(
                                    labelColours[
                                        Math.ceil(Math.random() * labelColours.length) - 1
                                    ],
                                )
                            }}
                            iconSize="14px"
                        />
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
    createLabel: (colour: string) => {
        dispatch(createLabel('New label', colour))
    },
    deleteLabel: (id: string) => {
        dispatch(deleteLabel(id))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Settings)
