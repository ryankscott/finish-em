import { gql, useMutation, useQuery } from '@apollo/client'
import { transparentize } from 'polished'
import React, { ReactElement, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Select, { OptionsType } from 'react-select'
import Switch from 'react-switch'
import { v4 as uuidv4 } from 'uuid'
import { setCalendar } from '../actions/event'
import { toggleCalendarIntegration } from '../actions/feature'
import { Events, LabelType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { selectStyles, themes } from '../theme'
import Button from './Button'
import EditableText from './EditableText'
import {
  ButtonContainer,
  Container,
  LabelContainer,
  Popover,
  Setting,
  SettingLabel,
  SettingsCategory,
  SettingsCategoryHeader,
  SettingsContainer,
  StyledTwitterPicker,
} from './styled/Settings'
import ViewHeader from './ViewHeader'
import { camelCaseToInitialCaps } from '../utils'
const electron = window.require('electron')

interface StateProps {
  theme: string
  events: Events
}

interface OwnProps {}

interface DispatchProps {
  toggleCalendarIntegration: () => void
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

const GET_FEATURES_AND_LABELS = gql`
  query {
    features {
      key
      name
      enabled
    }
    labels {
      key
      name
      colour
    }
  }
`
const SET_FEATURE = gql`
  mutation SetFeature($key: String!, $enabled: Boolean!) {
    setFeature(input: { key: $key, enabled: $enabled }) {
      key
      enabled
    }
  }
`

const RENAME_LABEL = gql`
  mutation RenameLabel($key: String!, $name: String!) {
    renameLabel(input: { key: $key, name: $name }) {
      key
      name
    }
  }
`

const RECOLOUR_LABEL = gql`
  mutation RecolourLabel($key: String!, $colour: String!) {
    recolourLabel(input: { key: $key, colour: $colour }) {
      key
      colour
    }
  }
`

const DELETE_LABEL = gql`
  mutation DeleteLabel($key: String!) {
    deleteLabel(input: { key: $key })
  }
`

const CREATE_LABEL = gql`
  mutation CreateLabel($key: String!, $name: String!, $colour: String!) {
    createLabel(input: { key: $key, name: $name, colour: $colour }) {
      key
      name
    }
  }
`

function Settings(props: SettingsPickerProps): ReactElement {
  const theme = themes[props.theme]
  const [showColourPicker, setShowColourPicker] = useState(false)
  const [colourPickerTriggeredBy, setColourPickerTriggeredBy] = useState(null)
  const [calendars, setCalendars] = useState([])
  const { loading, error, data } = useQuery(GET_FEATURES_AND_LABELS)
  const [setFeature] = useMutation(SET_FEATURE)
  const [renameLabel] = useMutation(RENAME_LABEL)
  const [recolourLabel] = useMutation(RECOLOUR_LABEL)
  const [deleteLabel] = useMutation(DELETE_LABEL, {
    update(cache, { data: { deleteLabel } }) {
      cache.evict({ key: deleteLabel })
    },
  })

  // We have to update the cache on add / removes
  const [createLabel] = useMutation(CREATE_LABEL, {
    update(cache, { data: { createLabel } }) {
      cache.modify({
        fields: {
          labels(existingLabels = []) {
            const newLabelRef = cache.writeFragment({
              data: createLabel,
              fragment: gql`
                fragment NewLabel on Label {
                  key
                  name
                }
              `,
            })
            return [...existingLabels, newLabelRef]
          },
        },
      })
    },
  })
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
    electron.ipcRenderer.on('calendars', (event, calendars) => {
      setCalendars(calendars)
    })
  })
  useEffect(() => {
    // Handle Electron events
    electron.ipcRenderer.send('get-calendars')
  }, [])

  // TODO: Loading and error states
  if (loading) return null
  if (error) return null
  else {
    console.log(data)
  }

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
            {data.features.map((f) => {
              return (
                <Setting key={f.key}>
                  <SettingLabel>{camelCaseToInitialCaps(f.name)}</SettingLabel>
                  <Switch
                    onChange={(checked) => {
                      console.log(checked)
                      setFeature({
                        variables: {
                          key: f.key,
                          enabled: checked,
                        },
                      })
                    }}
                    checked={data.features.find((df) => df.key == f.key).enabled}
                    onColor={theme.colours.primaryColour}
                    checkedIcon={false}
                    uncheckedIcon={false}
                    width={24}
                    height={14}
                  />
                </Setting>
              )
            })}

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
                    data.features?.calendarIntegration ? data.features.calendarIntegration : false
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
                  isDisabled={!data.features?.calendarIntegration}
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
          </SettingsCategory>
          <SettingsCategory>
            <SettingsCategoryHeader>Labels</SettingsCategoryHeader>
            {Object.values(data.labels).map((m: LabelType) => {
              return (
                <div id={m.key} key={'f-' + m.key}>
                  <LabelContainer key={'lc-' + m.key}>
                    <EditableText
                      key={'et-' + m.key}
                      input={m.name}
                      backgroundColour={transparentize(0.8, m.colour)}
                      fontSize={'xxsmall'}
                      innerRef={React.createRef()}
                      shouldSubmitOnBlur={true}
                      onEscape={() => {}}
                      singleline={true}
                      shouldClearOnSubmit={false}
                      onUpdate={(e) => {
                        renameLabel({ variables: { key: m.key, name: e } })
                      }}
                    ></EditableText>
                    <Button
                      id={`${m.key}`}
                      key={`edit-colour-${m.key}`}
                      icon="colour"
                      iconSize={'18px'}
                      spacing="compact"
                      type="default"
                      onClick={(e) => {
                        setShowColourPicker(!showColourPicker)
                        setColourPickerTriggeredBy(m.key)
                        e.stopPropagation()
                      }}
                    />
                    <Button
                      id={`${m.key}`}
                      key={`delete-label-${m.key}`}
                      icon="trash"
                      iconSize={'18px'}
                      spacing="compact"
                      type="default"
                      onClick={() => {
                        deleteLabel({ variables: { key: m.key } })
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
                  onChangeComplete={(colour, e) => {
                    recolourLabel({
                      variables: {
                        key: colourPickerTriggeredBy,
                        colour: colour.hex,
                      },
                    })
                    setShowColourPicker(false)
                  }}
                />
              </Popover>
            )}
            <ButtonContainer>
              <Button
                type="default"
                spacing="compact"
                icon="add"
                text="Add label"
                onClick={() => {
                  createLabel({
                    variables: {
                      key: uuidv4(),
                      name: 'New Label',
                      colour: labelColours[Math.ceil(Math.random() * labelColours.length) - 1],
                    },
                  })
                }}
                iconSize="14px"
              />
            </ButtonContainer>
          </SettingsCategory>
        </SettingsContainer>
      </Container>
    </ThemeProvider>
  )
}
const mapStateToProps = (state): StateProps => ({
  theme: state.ui.theme,
  events: state.events,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
  toggleCalendarIntegration: () => {
    dispatch(toggleCalendarIntegration())
  },
  setCalendar: (id: string) => {
    dispatch(setCalendar(id))
  },
})
export default connect(mapStateToProps, mapDispatchToProps)(Settings)