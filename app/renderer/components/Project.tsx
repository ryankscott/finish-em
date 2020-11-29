import React, { ReactElement } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'
import { ThemeProvider } from '../StyledComponents'
import { useHistory } from 'react-router-dom'
import { themes } from '../theme'
import { Title } from './Typography'
import EditableText from './EditableText'
import DeleteProjectDialog from './DeleteProjectDialog'
import { ProjectContainer, HeaderContainer, AddProjectContainer } from './styled/Project'
import ItemCreator from './ItemCreator'
import { formatRelativeDate } from '../utils'
import DatePicker from 'react-datepicker'
import { Wrapper } from './styled/ReactDatepicker'
import { parseISO } from 'date-fns'
import ReorderableComponentList from './ReorderableComponentList'
import { Donut } from './Donut'
import { darken } from 'polished'
import Tooltip from './Tooltip'
import { ThemeType } from '../interfaces'
import { Project as ProjectType, Item as ItemType } from '../../main/generated/typescript-helpers'
import { toast } from 'react-toastify'

const GET_PROJECT_BY_KEY = gql`
  query ProjectByKey($key: String!) {
    project(key: $key) {
      key
      name
      deleted
      description
      lastUpdatedAt
      deletedAt
      createdAt
      startAt
      endAt
      items {
        key
        type
        text
        deleted
        completed
        dueAt
        scheduledAt
        repeat
      }
    }
    projects(input: { deleted: false }) {
      key
      name
    }
    projectDates: featureByName(name: "projectDates") {
      key
      enabled
    }
    theme @client
  }
`

const DELETE_PROJECT = gql`
  mutation DeleteProject($key: String!) {
    deleteProject(input: { key: $key }) {
      key
    }
  }
`
const CHANGE_DESCRIPTION = gql`
  mutation ChangeDescriptionProject($key: String!, $description: String!) {
    changeDescriptionProject(input: { key: $key, description: $description }) {
      key
      description
    }
  }
`
const RENAME_PROJECT = gql`
  mutation RenameProject($key: String!, $name: String!) {
    renameProject(input: { key: $key, name: $name }) {
      key
      name
    }
  }
`

const SET_END_DATE = gql`
  mutation SetEndDateOfProject($key: String!, $endAt: String!) {
    setEndDateOfProject(input: { key: $key, endAt: $endAt }) {
      key
      endAt
    }
  }
`
const SET_START_DATE = gql`
  mutation SetStartDateOfProject($key: String!, $startAt: String!) {
    setStartDateOfProject(input: { key: $key, startAt: $startAt }) {
      key
      startAt
    }
  }
`
const DELETE_VIEW = gql`
  mutation DeleteView($key: String!) {
    deleteView(input: { key: $key }) {
      key
    }
  }
`

type ProjectProps = {
  projectKey: String
}

const Project = (props: ProjectProps): ReactElement => {
  const history = useHistory()
  const name = React.useRef<HTMLInputElement>()
  const description = React.useRef<HTMLInputElement>()
  const { loading, error, data } = useQuery(GET_PROJECT_BY_KEY, {
    variables: { key: props.projectKey },
  })
  const [deleteProject] = useMutation(DELETE_PROJECT)
  const [changeDescription] = useMutation(CHANGE_DESCRIPTION)
  const [renameProject] = useMutation(RENAME_PROJECT)
  const [setEndDate] = useMutation(SET_END_DATE)
  const [setStartDate] = useMutation(SET_START_DATE)
  const [deleteView] = useMutation(DELETE_VIEW, {
    update(cache, { data: { deleteView } }) {
      cache.evict({ id: deleteView })
    },
  })

  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const project: ProjectType = data.project
  const projects: ProjectType[] = data.projects
  const allItems: ItemType[] = project?.items
  const completedItems = allItems.filter((i) => i.completed == true)
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <ProjectContainer>
        <HeaderContainer>
          <div data-for="donut" data-tip>
            <Donut
              size={40}
              progress={allItems.length != 0 ? (100 * completedItems.length) / allItems.length : 0}
              activeColour={theme.colours.primaryColour}
              inactiveColour={darken(0.2, theme.colours.backgroundColour)}
            />
          </div>
          <Tooltip id="donut" text={`${completedItems.length}/${allItems.length} completed`} />
          <EditableText
            shouldSubmitOnBlur={true}
            key={project.key + 'name'}
            input={project.name}
            style={Title}
            singleline={true}
            innerRef={name}
            onUpdate={(input) => {
              const exists = projects.map((p) => p.name == input).includes(true)
              if (exists) {
                toast.error('Cannot rename project, a project with that name already exists')
              } else {
                renameProject({ variables: { key: project.key, name: input } })
              }
            }}
            shouldClearOnSubmit={false}
          />
          <DeleteProjectDialog
            onDelete={() => {
              deleteProject({ variables: { key: project.key } })
              deleteView({ variables: { key: project.key } })
              history.push('/inbox')
            }}
          />
        </HeaderContainer>
        {data.projectDates.enabled && (
          <div
            style={{
              paddingLeft: '6px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            {'Start: '}
            <Wrapper>
              <DatePicker
                value={project.startAt ? formatRelativeDate(parseISO(project.startAt)) : ''}
                onChange={(e) => {
                  setStartDate({ variables: { key: project.key, startAt: e.toISOString() } })
                }}
              />
            </Wrapper>
            {'End: '}
            <Wrapper>
              <DatePicker
                value={project.endAt ? formatRelativeDate(parseISO(project.endAt)) : ''}
                onChange={(e) => {
                  setEndDate({ variables: { key: project.key, endAt: e.toISOString() } })
                }}
              />
            </Wrapper>
          </div>
        )}
        <EditableText
          placeholder="Add a description for your project..."
          shouldSubmitOnBlur={true}
          key={project.key + 'description'}
          onUpdate={(input) => {
            changeDescription({ variables: { key: project.key, description: input } })
          }}
          innerRef={description}
          input={project.description}
          height="100px"
          shouldClearOnSubmit={false}
        />
        <AddProjectContainer>
          <ItemCreator
            type="item"
            projectKey={project.key}
            buttonText="Add to project"
            width="100%"
            initiallyExpanded={false}
          />
        </AddProjectContainer>
        <ReorderableComponentList id={project.key} />
      </ProjectContainer>
    </ThemeProvider>
  )
}

export default Project
