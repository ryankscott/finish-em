import { DocumentNode, gql, useQuery } from '@apollo/client'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Emoji } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import CSS from 'csstype'
import { groupBy } from 'lodash'
import { transparentize } from 'polished'
import React, { ReactElement } from 'react'
import { GroupedOptionsType, OptionsType } from 'react-select'
import { Area, Item, Label, Project } from '../../main/generated/typescript-helpers'
import { markdownBasicRegex, markdownLinkRegex, removeItemTypeFromString } from '../utils'
import Select from './Select'

type OptionType = { value: string; label: JSX.Element | string; color?: CSS.Property.Color }
type Attribute = 'area' | 'item' | 'label' | 'project'

const getData = (attr: Attribute): DocumentNode => {
  switch (attr) {
    case 'area':
      return gql`
        query {
          areas {
            key
            emoji
            name
            deleted
          }
        }
      `
    case 'label':
      return gql`
        query {
          labels {
            key
            name
            colour
          }
        }
      `
    case 'project':
      return gql`
        query {
          projects(input: { deleted: false }) {
            key
            emoji
            name
            area {
              key
              name
            }
          }
        }
      `
    case 'item':
      return gql`
        query {
          items {
            key
            text
            deleted
            completed
            project {
              key
              name
            }
            parent {
              key
              text
            }
          }
        }
      `

    default:
      break
  }
}

interface AttributeSelectProps {
  attribute: Attribute
  currentAttribute: Area | Item | Label | Project
  completed: boolean
  deleted: boolean
  invert?: boolean
  onSubmit: (key: string) => void
}

export default function AttributeSelect(props: AttributeSelectProps): ReactElement {
  const { loading, error, data } = useQuery(getData(props.attribute))
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }

  const generateDefaultValues = (
    attr: Attribute,
  ): {
    currentValue: string
    noValueText: string
    backgroundColour?: CSS.Property.Color
  } => {
    switch (attr) {
      case 'area':
        return {
          currentValue: props?.currentAttribute?.key,
          noValueText: 'Add area',
        }
      case 'label':
        return {
          currentValue: props?.currentAttribute?.key,
          noValueText: 'Add label',
          backgroundColour: props.currentAttribute?.colour,
        }
      case 'project':
        return {
          currentValue: props?.currentAttribute?.key,
          noValueText: 'Add project',
        }
      case 'item':
        return {
          currentValue: props?.currentAttribute.parent ? props.currentAttribute.parent.key : null,
          noValueText: 'Add parent',
        }

      default:
        return {
          currentValue: '',
          noValueText: 'Add',
        }
    }
  }

  const generateOptions = (
    attr: Attribute,
    currentAttr: Area | Item | Label | Project,
  ): OptionsType<any> | GroupedOptionsType<any> => {
    switch (attr) {
      case 'area':
        const filteredAreas = data.areas.filter((a) => a.deleted == false)
        return [
          ...filteredAreas.map((a) => {
            return {
              value: a.key,
              label: (
                <Flex>
                  {a.emoji && <Emoji emoji={a.emoji} size={12} native={true} />}
                  <Text pl={2}>{a.name}</Text>
                </Flex>
              ),
            }
          }),
          { value: null, label: 'None' },
        ]

      case 'label':
        return [
          ...data.labels.map((l: Label) => {
            return {
              value: l.key,
              label: l.name,
              color: transparentize(0.7, l.colour),
            }
          }),
          { value: '', label: 'No label', color: '' },
        ]

      case 'project':
        const filteredProjects = data.projects
          .filter((p) => p.key != '0')
          .filter((p) => p.key != null)

        const groupedProjects = groupBy(filteredProjects, 'area.name')
        const aGroups = Object.keys(groupedProjects).map((i) => {
          const group: GroupType<OptionType> = { label: '', options: [] }
          group['label'] = i
          group['options'] = groupedProjects[i].map((p: Project) => {
            return {
              value: p.key,
              label: (
                <Flex>
                  {p.emoji && <Emoji emoji={p.emoji} size={12} native={true} />}
                  <Text pl={2}>{p.name}</Text>
                </Flex>
              ),
            }
          })
          return group
        })

        // Sort to ensure that the current project is at the front
        // Only if it has a project
        if (currentAttr != null) {
          aGroups.sort((a, b) =>
            a.label == currentAttr.area?.name ? -1 : b.label == currentAttr.area?.name ? 1 : 0,
          )
        }

        return [
          ...aGroups,
          {
            label: 'Remove Project',
            options: [{ value: '0', label: 'None' }],
          },
        ]

      case 'item':
        const filteredValues = data.items.filter(
          (i) =>
            i.key != null && i.key != currentAttr.key && i.deleted == false && i.completed == false,
        )
        // Return if we've filtered all items
        if (!filteredValues.length) return
        // Group them by project
        const groupedItems = groupBy(filteredValues, 'project.name')
        // Show the items from the project the item is in first
        // Update the label to be the project name, and the items to be the right format
        const allGroups = Object.keys(groupedItems).map((i) => {
          const group: GroupType<OptionType> = { label: '', options: [] }
          // It's possible to not have a project
          group['label'] = i ? i : 'No Project'
          group['options'] = groupedItems[i].map((i) => {
            return {
              value: i.key,
              label: removeItemTypeFromString(i.text)
                .replace(markdownLinkRegex, '$1')
                .replace(markdownBasicRegex, '$1'),
            }
          })
          return group
        })
        // Sort to ensure that the current project is at the front
        allGroups.sort((a, b) => {
          if (!currentAttr?.project?.key) return 0
          return a.label == currentAttr?.project?.name
            ? -1
            : b.label == currentAttr?.project?.name
            ? 1
            : 0
        })

        // If it's already a subtask add an option to create it to a task
        return currentAttr?.parent != null
          ? [
              {
                label: 'Options',
                options: [{ value: '', label: 'Convert to task' }],
              },
              ...allGroups,
            ]
          : allGroups

      default:
        return {}
        break
    }
  }

  const defaultValues = generateDefaultValues(props.attribute)
  const options = generateOptions(props.attribute, props.currentAttribute)
  const allOptions = options
    .map((o) => {
      return o.options ? o.options : o
    })
    .flat()
  const defaultValue = allOptions.filter((o) => o.value == defaultValues.currentValue)

  return (
    <Box w={'100%'} cursor={props.completed || props.deleted ? 'not-allowed' : 'inherit'}>
      <Select
        size="sm"
        isMulti={false}
        isDisabled={props.completed || props.deleted}
        onChange={(p) => {
          props.onSubmit(p.value)
        }}
        options={options}
        escapeClearsValue={true}
        placeholder={defaultValues.noValueText}
        defaultValue={defaultValue}
        invertColours={props.invert}
        renderLabelAsElement={true}
      />
    </Box>
  )
}
