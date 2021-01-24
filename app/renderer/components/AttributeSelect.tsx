import React, { ReactElement } from 'react'
import ButtonDropdown from './ButtonDropdown'
import { Area, Item, Label, Project } from '../../main/generated/typescript-helpers'
import { DocumentNode, gql, useQuery } from '@apollo/client'
import { IconType, ThemeType } from '../interfaces'
import { themes } from '../theme'
import { GroupedOptionsType, GroupType, OptionsType } from 'react-select'
import { ThemeProvider } from '../StyledComponents'
import CSS from 'csstype'
import { transparentize } from 'polished'
import { groupBy } from 'lodash'
import {
  markdownBasicRegex,
  markdownLinkRegex,
  removeItemTypeFromString,
  truncateString,
} from '../utils'
import marked from 'marked'

type OptionType = { value: string; label: JSX.Element | string; color?: CSS.Property.Color }
type Attribute = 'area' | 'item' | 'label' | 'project'
const GET_THEME = gql`
  query {
    theme @client
  }
`

const getData = (attr: Attribute): DocumentNode => {
  switch (attr) {
    case 'area':
      return gql`
        query {
          areas {
            key
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
  style?: 'primary' | 'subtle' | 'subtleInvert' | 'default' | 'invert'
  onSubmit: (key: string) => void
}

export default function AttributeSelect(props: AttributeSelectProps): ReactElement {
  const { loading: l, error: e, data: d } = useQuery(GET_THEME)

  const { loading, error, data } = useQuery(getData(props.attribute))
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }

  const generateDefaultValues = (
    attr: Attribute,
  ): {
    buttonText: string | JSX.Element
    defaultButtonText: string
    buttonIcon: IconType
    selectPlaceholder: string
  } => {
    switch (attr) {
      case 'area':
        return {
          buttonText: props?.currentAttribute?.name,
          defaultButtonText: 'Add area',
          buttonIcon: 'area',
          selectPlaceholder: 'Area: ',
        }
      case 'label':
        return {
          buttonText: props?.currentAttribute?.name,
          defaultButtonText: 'Add Label',
          buttonIcon: 'label',
          selectPlaceholder: 'Label: ',
        }
      case 'project':
        return {
          buttonText: props?.currentAttribute?.name,
          defaultButtonText: 'Add Project',
          buttonIcon: 'project',
          selectPlaceholder: 'Project: ',
        }
      case 'item':
        return {
          buttonText: props?.currentAttribute.parent ? (
            <span
              dangerouslySetInnerHTML={{
                __html: marked(
                  truncateString(removeItemTypeFromString(props.currentAttribute.parent.text), 15),
                ),
              }}
            />
          ) : null,
          defaultButtonText: 'Add Parent',
          buttonIcon: 'subtask',
          selectPlaceholder: 'Parent: ',
        }

      default:
        return {
          buttonText: '',
          defaultButtonText: 'Add',
          buttonIcon: 'close',
          selectPlaceholder: 'Search: ',
        }
    }
  }

  const generateOptions = (
    attr: Attribute,
    currentAttr: Area | Item | Label | Project,
  ): OptionsType<any> | GroupedOptionsType<any> => {
    switch (attr) {
      case 'area':
        const filteredAreas = data.areas
          .filter((a) => a.key != currentAttr?.key)
          .filter((a) => a.deleted == false)
        return [
          ...filteredAreas.map((a) => {
            return {
              value: a.key,
              label: a.name,
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
              color: transparentize(0.8, l.colour),
            }
          }),
          { value: '', label: 'No label', color: '' },
        ]

      case 'project':
        const filteredProjects = data.projects
          .filter((p) => p.key != '0')
          .filter((p) => p.key != null)
          .filter((p) => p.key != currentAttr?.key)
        const groupedProjects = groupBy(filteredProjects, 'area.name')
        const aGroups = Object.keys(groupedProjects).map((i) => {
          const group: GroupType<OptionType> = { label: '', options: [] }
          group['label'] = i
          group['options'] = groupedProjects[i].map((p: Project) => {
            return {
              value: p.key,
              label: p.name,
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
            i.key != null &&
            i.key != currentAttr.key &&
            i.key != currentAttr.parent?.key &&
            i.deleted == false &&
            i.completed == false &&
            !i.parent,
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

  const theme: ThemeType = themes[d.theme]
  const defaultValues = generateDefaultValues(props.attribute)
  return (
    <ThemeProvider theme={theme}>
      <div style={{ width: '100%' }}>
        <ButtonDropdown
          style={props.style}
          buttonText={defaultValues.buttonText}
          defaultButtonIcon={defaultValues.buttonIcon}
          defaultButtonText={defaultValues.defaultButtonText}
          selectPlaceholder={defaultValues.selectPlaceholder}
          options={generateOptions(props.attribute, props.currentAttribute)}
          deleted={props.deleted}
          completed={props.completed}
          onSubmit={(key) => {
            props.onSubmit(key)
          }}
        />
      </div>
    </ThemeProvider>
  )
}
