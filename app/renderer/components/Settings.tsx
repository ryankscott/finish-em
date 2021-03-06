import { gql, useMutation, useQuery } from '@apollo/client'
import { transparentize } from 'polished'
import React, { ReactElement, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Button from './Button'
import colormap from 'colormap'
import { camelCaseToInitialCaps } from '../utils'
import { Label } from '../../main/generated/typescript-helpers'
import { HexColorPicker } from 'react-colorful'
import { debounce } from 'lodash'
import {
  Box,
  Flex,
  Text,
  Switch,
  useColorMode,
  Editable,
  EditableInput,
  EditablePreview,
} from '@chakra-ui/react'
import Select from './Select'
const NUMBER_OF_COLOURS = 12

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
  query settings {
    features {
      key
      name
      enabled
      metadata
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
  }
`

const SET_ACTIVE_CALENDAR = gql`
  mutation SetActiveCalendar($key: String!) {
    setActiveCalendar(input: { key: $key }) {
      key
      name
      active
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
const SET_FEATURE_METADATA = gql`
  mutation SetFeatureMetadata($key: String!, $metadata: JSON!) {
    setFeatureMetadata(input: { key: $key, metadata: $metadata }) {
      key
      metadata
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
  const [setActiveCalendar] = useMutation(SET_ACTIVE_CALENDAR, {
    refetchQueries: ['settings'],
  })
  const [setFeature] = useMutation(SET_FEATURE, { refetchQueries: ['getActiveCalendar'] })
  const [setFeatureMetadata] = useMutation(SET_FEATURE_METADATA)
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
  const { colorMode, toggleColorMode } = useColorMode()

  const colours = colormap({
    colormap: 'jet',
    nshades: NUMBER_OF_COLOURS,
    format: 'hex',
    alpha: 1,
  })
  const settingHeaderStyles = {
    py: 4,
    px: 0,
    fontSize: 'lg',
    fontWeight: 'semibold',
  }
  const settingSidebarHeaderStyles = {
    fontSize: 'md',
    fontWeight: 'regular',
    borderRadius: 3,
    py: 2,
    px: 6,
    m: 0,
    _hover: {
      bg: colorMode == 'light' ? 'gray.100' : 'gray.900',
      cursor: 'pointer',
    },
  }

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
  return (
    <Flex direction={'row'} w={'100%'} h={'100vh'}>
      <Flex
        borderRight={'1px solid'}
        borderColor={colorMode == 'light' ? 'gray.200' : 'gray.900'}
        direction={'column'}
        w={'280px'}
        bg={colorMode == 'light' ? 'gray.50' : 'gray.800'}
        py={2}
        px={0}
        h={'100%'}
        shadow={'md'}
      >
        <Text p={4} fontSize={'lg'} fontWeight={'semibold'}>
          Settings
        </Text>
        <Text
          {...settingSidebarHeaderStyles}
          bg={
            activeCategory == 'UI'
              ? colorMode == 'light'
                ? 'gray.200'
                : 'gray.900'
              : colorMode == 'light'
              ? 'gray.50'
              : 'gray.800'
          }
          onClick={() => setActiveCategory('UI')}
        >
          User Interface
        </Text>
        <Text
          {...settingSidebarHeaderStyles}
          bg={
            activeCategory == 'LABELS'
              ? colorMode == 'light'
                ? 'gray.200'
                : 'gray.900'
              : colorMode == 'light'
              ? 'gray.50'
              : 'gray.800'
          }
          onClick={() => setActiveCategory('LABELS')}
        >
          Labels
        </Text>
      </Flex>
      <Flex
        position={'relative'}
        direction={'column'}
        p={2}
        w={'100%'}
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
          <Box p={3} my={6} px={3}>
            <Text {...settingHeaderStyles}>User Interface</Text>
            {data.features.map((f) => {
              return (
                <span key={`${f.key}-container`}>
                  <Flex
                    direction={'row'}
                    justifyContent={'flex-start'}
                    py={3}
                    px={0}
                    w={'100%'}
                    h={'30px'}
                    alignItems={'center'}
                    key={f.key}
                  >
                    <Text fontSize="sm" w={'180px'} key={`${f.key}-label`}>
                      {camelCaseToInitialCaps(f.name)}
                    </Text>
                    <Switch
                      size="sm"
                      onChange={() => {
                        window.electron.sendMessage('feature-toggled', {
                          name: f.name,
                          key: f.key,
                          enabled: !f.enabled,
                          metadata: f.metadata,
                        })
                        setFeature({
                          variables: {
                            key: f.key,
                            enabled: !f.enabled,
                          },
                        })
                      }}
                      defaultChecked={f.enabled}
                    />
                    {f.name == 'calendarIntegration' && (
                      <Box pl={3} w={'180px'}>
                        <Select
                          size="md"
                          isDisabled={!f.enabled}
                          key={f.key + '-select'}
                          autoFocus={true}
                          placeholder={'Choose calendar'}
                          defaultValue={calendarOptions?.find(
                            (c) => c.value == data?.activeCalendar?.key,
                          )}
                          onChange={(e) => {
                            setActiveCalendar({
                              variables: {
                                key: e.value,
                              },
                            })
                          }}
                          options={calendarOptions}
                          escapeClearsValue={true}
                        />
                      </Box>
                    )}
                    {f.name == 'bearNotesIntegration' && (
                      <Box pl={3} w={'180px'}>
                        <Editable
                          defaultValue={JSON.parse(f?.metadata)?.apiToken}
                          onSubmit={(val) => {
                            window.electron.sendMessage('feature-metadata-updated', {
                              name: f.name,
                              key: f.key,
                              enabled: f.enabled,
                              metadata: { apiToken: val },
                            })
                            setFeatureMetadata({
                              variables: { key: f.key, metadata: { apiToken: val } },
                            })
                          }}
                          fontSize="sm"
                          placeholder="Bear API Token"
                          isDisabled={!f.enabled}
                        >
                          <EditablePreview py={2} />
                          <EditableInput py={2} />
                        </Editable>
                      </Box>
                    )}
                  </Flex>
                </span>
              )
            })}
          </Box>
        )}
        {activeCategory == 'LABELS' && (
          <Box p={3} my={6} px={3}>
            <Text {...settingHeaderStyles}>Labels</Text>
            {Object.values(data.labels).map((m: Label) => {
              return (
                <div id={m.key} key={'f-' + m.key}>
                  <Flex
                    w={'250px'}
                    justifyContent={'space-between'}
                    alignItems={'center'}
                    height={'auto'}
                    bg={colorMode == 'light' ? 'gray.50' : 'gray.800'}
                    key={'lc-' + m.key}
                  >
                    <Box w={'100%'} mr={1}>
                      <Editable
                        borderRadius={5}
                        value={m.name}
                        bg={transparentize(0.7, m.colour)}
                        fontSize="xs"
                        w={'100%'}
                        onSubmit={(input) => {
                          renameLabel({ variables: { key: m.key, name: input } })
                        }}
                        submitOnBlur={false}
                      >
                        <EditablePreview
                          bg={transparentize(0.7, m.colour)}
                          _hover={{
                            bg: transparentize(0.9, m.colour),
                          }}
                        />
                        <EditableInput />
                      </Editable>
                    </Box>
                    <Button
                      id={`${m.key}-edit`}
                      key={`edit-colour-${m.key}`}
                      icon="colour"
                      iconSize={'18px'}
                      size="sm"
                      variant="default"
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
                      size="sm"
                      variant="default"
                      onClick={() => {
                        deleteLabel({ variables: { key: m.key } })
                      }}
                    />
                  </Flex>
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
            <Flex w={'185px'} justifyContent={'center'} pt={3}>
              <Button
                variant="default"
                size="md"
                icon="add"
                text="Add label"
                onClick={() => {
                  createLabel({
                    variables: {
                      key: uuidv4(),
                      name: 'New Label',
                      colour: colours[Math.floor(Math.random() * NUMBER_OF_COLOURS)],
                    },
                  })
                }}
                iconPosition="right"
                iconSize="12px"
              />
            </Flex>
          </Box>
        )}
      </Flex>
    </Flex>
  )
}
export default Settings
