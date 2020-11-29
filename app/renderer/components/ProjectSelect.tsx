import React, { ReactElement } from 'react'
import CSS from 'csstype'
import groupBy from 'lodash/groupBy'
import { Project } from '../../main/generated/typescript-helpers'
import { GroupType } from 'react-select'
import ButtonDropdown from './ButtonDropdown'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'
import { themes } from '../theme'
import { ThemeProvider } from '../StyledComponents'

type OptionType = { value: string; label: JSX.Element | string; color?: CSS.Property.Color }
const generateProjectOptions = (project: Project, projects: Project[]): GroupType<OptionType>[] => {
  const filteredProjects = projects
    .filter((p) => p.key != '0')
    .filter((p) => p.key != null)
    .filter((p) => p.key != project?.key)

  const groupedProjects = groupBy(filteredProjects, 'area.name')
  const allGroups = Object.keys(groupedProjects).map((i) => {
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
  if (project != null) {
    allGroups.sort((a, b) =>
      a.label == project.area?.name ? -1 : b.label == project.area?.name ? 1 : 0,
    )
  }

  //
  return [
    ...allGroups,
    {
      label: 'Remove Project',
      options: [{ value: null, label: 'None' }],
    },
  ]
}

const GET_DATA = gql`
  query {
    projects(input: { deleted: false }) {
      key
      name
      area {
        key
        name
      }
    }
    labels {
      key
      name
    }
    theme @client
  }
`

interface ProjectSelectProps {
  project: Project
  completed: boolean
  deleted: boolean
  onSubmit: (projectKey: string) => void
}

export default function ProjectSelect(props: ProjectSelectProps): ReactElement {
  const { loading, error, data } = useQuery(GET_DATA)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <div>
        <ButtonDropdown
          buttonText={props.project?.name}
          defaultButtonIcon={'project'}
          defaultButtonText={'Add Project'}
          selectPlaceholder={'Project:'}
          options={generateProjectOptions(props.project, data.projects)}
          deleted={props.deleted}
          completed={props.completed}
          onSubmit={(projectKey) => {
            props.onSubmit(projectKey)
          }}
        />
      </div>
    </ThemeProvider>
  )
}
