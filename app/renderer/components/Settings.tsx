import { gql, useMutation, useQuery } from '@apollo/client'
import { transparentize } from 'polished'
import React, { ReactElement, useEffect, useState } from 'react'
import Select, { OptionsType } from 'react-select'
import Switch from 'react-switch'
import { v4 as uuidv4 } from 'uuid'
import { ThemeProvider } from '../StyledComponents'
import { selectStyles, themes } from '../theme'
import Button from './Button'
import EditableText from './EditableText'
import {
  ButtonContainer,
  Container,
  LabelContainer,
  Setting,
  SettingLabel,
  SettingsBodyHeader,
  SettingsCategory,
  SettingsCategoryHeader,
  SettingsContainer,
  SettingsSidebarHeader,
  SettingsSidebar,
} from './styled/Settings'
import { camelCaseToInitialCaps } from '../utils'
import { themeVar } from '..'
import { Label } from '../../main/generated/typescript-helpers'
import { HexColorPicker } from 'react-colorful'
import 'react-colorful/dist/index.css'
import { debounce } from 'lodash'

type SettingsPickerProps = {}
const generateOptions = (cals): { value: string; label: string }[] => {
  return cals?.map((c) => {
    return {
      value: c.key,
      label: c.name,
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
    calendars {
      key
      name
    }
    activeCalendar: getActiveCalendar {
      key
      name
    }
    theme @client
  }
`
const SET_ACTIVE_CALENDAR = gql`
  mutation SetActiveCalendar($key: String!) {
    setActiveCalendar(input: { key: $key }) {
      key
      name
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
  mutation SetColourOfLabel($key: String!, $colour: String!) {
    setColourOfLabel(input: { key: $key, colour: $colour }) {
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
  const [showColourPicker, setShowColourPicker] = useState(false)
  const [colourPickerTriggeredBy, setColourPickerTriggeredBy] = useState(null)
  const [activeCategory, setActiveCategory] = useState('UI')
  const { loading, error, data } = useQuery(GET_FEATURES_AND_LABELS)
  const [setActiveCalendar] = useMutation(SET_ACTIVE_CALENDAR)
  const [setFeature] = useMutation(SET_FEATURE)
  const [renameLabel] = useMutation(RENAME_LABEL)
  const [setColourOfLabel] = useMutation(RECOLOUR_LABEL)
  const [deleteLabel] = useMutation(DELETE_LABEL, {
    update(cache, { data: { deleteLabel } }) {
      const cacheId = cache.identify({
        __typename: 'Label',
        key: deleteLabel,
      })
      cache.evict({ id: cacheId })
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

  // TODO: Loading and error states
  if (loading) return null
  if (error) return null
  const calendarOptions = generateOptions(data.calendars)
  const theme = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <SettingsSidebar>
          <SettingsSidebarHeader>Settings</SettingsSidebarHeader>
          <SettingsCategoryHeader
            active={activeCategory == 'UI'}
            onClick={() => setActiveCategory('UI')}
          >
            User Interface
          </SettingsCategoryHeader>
          <SettingsCategoryHeader
            active={activeCategory == 'LABELS'}
            onClick={() => setActiveCategory('LABELS')}
          >
            Labels
          </SettingsCategoryHeader>
        </SettingsSidebar>
        <SettingsContainer
          onClick={(e) => {
            const ariaLabel = e.target.attributes.getNamedItem('aria-label')?.value
            const className = e.target.className
            if (
              ariaLabel == 'Color' ||
              ariaLabel == 'Hue' ||
              className == 'react-colorful__pointer react-colorful__saturation-pointer' ||
              className == 'react-colorful__pointer react-colorful__hue-pointer'
            )
              return
            setShowColourPicker(false)
          }}
        >
          {activeCategory == 'UI' && (
            <SettingsCategory>
              <SettingsBodyHeader>User Interface</SettingsBodyHeader>
              {data.features.map((f) => {
                return (
                  <span key={`${f.key}-container`}>
                    <Setting key={f.key}>
                      <SettingLabel key={`${f.key}-label`}>
                        {camelCaseToInitialCaps(f.name)}
                      </SettingLabel>
                      <Switch
                        onChange={(checked) => {
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
                      {f.name == 'calendarIntegration' && (
                        <div style={{ paddingLeft: '5px' }}>
                          <Select
                            key={f.key + '-select'}
                            autoFocus={true}
                            value={calendarOptions?.find(
                              (c) => c.value == data?.activeCalendar?.key,
                            )}
                            isSearchable
                            isDisabled={!f.enabled}
                            onChange={(e) => {
                              setActiveCalendar({
                                variables: {
                                  key: e.value,
                                },
                              })
                            }}
                            options={calendarOptions}
                            styles={selectStyles({
                              fontSize: 'xxsmall',
                              minWidth: '160px',
                              theme: theme,
                            })}
                            escapeClearsValue={true}
                            defaultMenuIsOpen={false}
                          />
                        </div>
                      )}
                    </Setting>
                  </span>
                )
              })}
              <Setting key={'dark-mode'}>
                <SettingLabel>Dark Mode</SettingLabel>
                <Switch
                  onChange={(checked) => {
                    checked ? themeVar('dark') : themeVar('light')
                  }}
                  checked={data.theme == 'dark'}
                  onColor={theme.colours.primaryColour}
                  checkedIcon={false}
                  uncheckedIcon={false}
                  width={24}
                  height={14}
                />
              </Setting>
            </SettingsCategory>
          )}
          {activeCategory == 'LABELS' && (
            <SettingsCategory>
              <SettingsBodyHeader>Labels</SettingsBodyHeader>
              {Object.values(data.labels).map((m: Label) => {
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
                        id={`${m.key}-edit`}
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
                        id={`${m.key}-delete`}
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
                <HexColorPicker
                  color={data.labels.find((l) => l.key == colourPickerTriggeredBy).colour}
                  onChange={debounce((colour) => {
                    setColourOfLabel({
                      variables: {
                        key: colourPickerTriggeredBy,
                        colour: colour,
                      },
                    })
                  }, 200)}
                />
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
                        colour: '#000000',
                      },
                    })
                  }}
                  iconSize="14px"
                />
              </ButtonContainer>
            </SettingsCategory>
          )}
        </SettingsContainer>
      </Container>
    </ThemeProvider>
  )
}
export default Settings
