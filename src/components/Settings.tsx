import React, { ReactElement, useState, useEffect } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes, selectStyles } from '../theme'
import Switch from 'react-switch'
import Select, { OptionsType } from 'react-select'
import { connect } from 'react-redux'
import { FeatureType, LabelType, Labels, Events } from '../interfaces'
import {
  enableDragAndDrop,
  disableDragAndDrop,
  toggleDragAndDrop,
  toggleProjectDates,
  toggleDailyGoals,
  toggleCalendarIntegration,
} from '../actions/feature'
import {
  deleteLabel,
  toggleDarkMode,
  setLabelColour,
  renameLabel,
  createLabel,
} from '../actions/ui'
import { setCalendar } from '../actions/event'
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
import isElectron from 'is-electron'
if (isElectron()) {
  const electron = window.require('electron')
}

interface StateProps {
  features: FeatureType
  theme: string
  labels: Labels
  events: Events
}

interface OwnProps {}

interface DispatchProps {
  enableDragAndDrop: () => void
  disableDragAndDrop: () => void
  toggleDragAndDrop: () => void
  toggleDarkMode: () => void
  toggleDailyGoals: () => void
  setLabelColour: (id: string, colour: string) => void
  renameLabel: (id: string, text: string) => void
  toggleProjectDates: () => void
  toggleCalendarIntegration: () => void
  createLabel: (colour: string) => void
  deleteLabel: (id: string) => void
  setCalendar: (id: string) => void
}

type SettingsPickerProps = StateProps & DispatchProps & OwnProps

const generateOptions = (cals): OptionsType => {
  return cals?.map((c) => {
    return {
      value: c,
      label: c,
    }
  })
}

function Settings(props: SettingsPickerProps): ReactElement {
  const theme = themes[props.theme]
  const [showColourPicker, setShowColourPicker] = useState(false)
  const [colourPickerTriggeredBy, setColourPickerTriggeredBy] = useState(null)
  const [calendars, setCalendars] = useState([])
  const calendarOptions = generateOptions(calendars)
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

  useEffect(() => {
    // Handle Electron events
    if (isElectron()) {
      electron.ipcRenderer.on('calendars', (event, calendars) => {
        setCalendars(calendars)
      })
    }
  })
  useEffect(() => {
    // Handle Electron events
    if (isElectron()) {
      electron.ipcRenderer.send('get-calendars')
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <ViewHeader name={'Settings'} icon="settings" />
        <SettingsContainer
          onClick={(e) => {
            // If it's a click on the colour input then do nothing
            if (e.target.nodeName == 'INPUT') return
            setShowColourPicker(false)
          }}
        >
          <SettingsCategory>
            <SettingsCategoryHeader>General User Interface</SettingsCategoryHeader>
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
            {isElectron() && (
              <Setting>
                <SettingLabel>Calendar Integration</SettingLabel>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '150px',
                  }}
                >
                  <Switch
                    onChange={() => {
                      props.toggleCalendarIntegration()
                    }}
                    checked={
                      props.features?.calendarIntegration
                        ? props.features.calendarIntegration
                        : false
                    }
                    onColor={theme.colours.primaryColour}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    width={24}
                    height={14}
                  />
                  <Select
                    autoFocus={true}
                    value={calendarOptions?.find((c) => c.value == props.events.currentCalendar)}
                    isSearchable
                    isDisabled={!props.features?.calendarIntegration}
                    onChange={(e) => {
                      electron.ipcRenderer.send('set-calendar', e.value)
                      props.setCalendar(e.value)
                    }}
                    options={generateOptions(calendars)}
                    styles={selectStyles({
                      fontSize: 'xxsmall',
                      theme: themes[props.theme],
                    })}
                    escapeClearsValue={true}
                    defaultMenuIsOpen={false}
                  />
                </div>
              </Setting>
            )}
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
            <Setting>
              <SettingLabel>Daily goals</SettingLabel>
              <Switch
                onChange={() => props.toggleDailyGoals()}
                checked={props.features.dailyGoals}
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
                top={document.getElementById(colourPickerTriggeredBy).offsetTop + 25}
                left={document.getElementById(colourPickerTriggeredBy).offsetLeft}
              >
                <StyledTwitterPicker
                  key={'tp'}
                  triangle={'hide'}
                  colors={labelColours}
                  onChange={(colour, e) => {
                    if (e.nativeEvent.target.value.length == 3) return
                    props.setLabelColour(colourPickerTriggeredBy, colour.hex)
                    e.stopPropagation()
                    setShowColourPicker(false)
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
                props.createLabel(labelColours[Math.ceil(Math.random() * labelColours.length) - 1])
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
  events: state.events,
  labels: state.ui.labels,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
  toggleCalendarIntegration: () => {
    dispatch(toggleCalendarIntegration())
  },
  toggleDarkMode: () => {
    dispatch(toggleDarkMode())
  },
  toggleDailyGoals: () => {
    dispatch(toggleDailyGoals())
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
  setCalendar: (id: string) => {
    dispatch(setCalendar(id))
  },
})
export default connect(mapStateToProps, mapDispatchToProps)(Settings)
