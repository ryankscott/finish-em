import { gql, useMutation, useQuery } from '@apollo/client'
import { Box, Flex, Grid, GridItem, Text, useTheme, Tooltip } from '@chakra-ui/react'
import { parseISO } from 'date-fns'
import { Emoji, Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import React, { ReactElement, useState } from 'react'
import DatePicker from 'react-datepicker'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Item as ItemType, Project as ProjectType } from '../../main/generated/typescript-helpers'
import { formatRelativeDate } from '../utils'
import DeleteProjectDialog from './DeleteProjectDialog'
import { Donut } from './Donut'
import EditableText from './EditableText'
import EditableText2 from './EditableText2'
import ItemCreator from './ItemCreator'
import { Page } from './Page'
import './styled/ReactDatePicker.css'
import { Title } from './Typography'

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
      emoji
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
    newEditor: featureByName(name: "newEditor") {
      key
      enabled
    }
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
const SET_EMOJI = gql`
  mutation SetEmojiOfProject($key: String!, $emoji: String!) {
    setEmojiOfProject(input: { key: $key, emoji: $emoji }) {
      key
      emoji
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
  const theme = useTheme()
  const history = useHistory()
  const name = React.useRef<HTMLInputElement>()
  const description = React.useRef<HTMLInputElement>()
  const [deleteProject] = useMutation(DELETE_PROJECT, { refetchQueries: ['GetSidebarData'] })
  const [changeDescription] = useMutation(CHANGE_DESCRIPTION)
  const [renameProject] = useMutation(RENAME_PROJECT)
  const [setEndDate] = useMutation(SET_END_DATE)
  const [setStartDate] = useMutation(SET_START_DATE)
  const [setEmoji] = useMutation(SET_EMOJI)
  const [deleteView] = useMutation(DELETE_VIEW)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const { loading, error, data } = useQuery(GET_PROJECT_BY_KEY, {
    variables: { key: props.projectKey },
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
  return (
    <Page>
      <Grid
        gridAutoRows={'60px 40px'}
        gridTemplateColumns={'120px 1fr'}
        alignItems={'center'}
        py={3}
        px={0}
        columnGap={2}
      >
        <GridItem colStart={1} colSpan={1} rowStart={1} rowSpan={2}>
          <Flex
            w={'100px'}
            h={'100px'}
            borderRadius={'50%'}
            justifyContent={'center'}
            fontSize={'xl'}
            bg={'gray.100'}
            my={0}
            mx={4}
            _hover={{
              bg: 'gray.200',
            }}
            cursor={'pointer'}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker)
            }}
          >
            <Emoji emoji={project.emoji ? project.emoji : ''} size={68} native={true} />
          </Flex>
        </GridItem>
        <GridItem rowStart={1} colStart={2} colSpan={1}>
          <Flex w={'100%'} justifyContent={'flex-start'} alignItems={'flex-start'}>
            <Box w={'100%'} px={2}>
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
            </Box>
            <DeleteProjectDialog
              onDelete={() => {
                deleteProject({ variables: { key: project.key } })
                deleteView({ variables: { key: project.key } })
                history.push('/inbox')
              }}
            />
          </Flex>
        </GridItem>
        <GridItem rowStart={2} colstart={2} colSpan={1}>
          <Tooltip label={`${completedItems.length}/${allItems.length} completed`}>
            <Flex justifyContent={'flex-start'} alignItems={'center'}>
              <Donut
                size={30}
                progress={
                  allItems.length != 0 ? (100 * completedItems.length) / allItems.length : 0
                }
                activeColour={theme.colors.blue[500]}
                inactiveColour={theme.colors.gray[300]}
              />
              <Text fontSize="md">
                {completedItems.length} of {allItems.length} items completed
              </Text>
            </Flex>
          </Tooltip>
        </GridItem>

        {showEmojiPicker && (
          <Flex position={'relative'} zIndex={9}>
            <Picker
              native={true}
              title=""
              emoji=""
              color={theme.colors.blue[500]}
              onSelect={(emoji) => {
                setEmoji({ variables: { key: project.key, emoji: emoji.id } })
                setShowEmojiPicker(false)
              }}
            />
          </Flex>
        )}
      </Grid>
      {data.projectDates.enabled && (
        <Flex pl={4} direction={'row'} alignItems={'center'}>
          <Text>Start: </Text>
          <Box>
            <DatePicker
              value={project.startAt ? formatRelativeDate(parseISO(project.startAt)) : ''}
              onChange={(e) => {
                setStartDate({ variables: { key: project.key, startAt: e.toISOString() } })
              }}
            />
          </Box>
          <Text>End: </Text>
          <Box>
            <DatePicker
              value={project.endAt ? formatRelativeDate(parseISO(project.endAt)) : ''}
              onChange={(e) => {
                setEndDate({ variables: { key: project.key, endAt: e.toISOString() } })
              }}
            />
          </Box>
        </Flex>
      )}
      {data.newEditor.enabled ? (
        <EditableText2
          singleLine={false}
          placeholder="Add a description for your project..."
          shouldClearOnSubmit={false}
          hideToolbar={false}
          shouldSubmitOnBlur={true}
          onUpdate={(input) => {
            changeDescription({ variables: { key: project.key, description: input } })
          }}
        />
      ) : (
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
      )}
      <Flex direction={'column'} justifyContent={'flex-end'} py={2} px={0} w={'100%'}>
        <ItemCreator
          projectKey={project.key}
          buttonText="Add to project"
          width="100%"
          initiallyExpanded={false}
        />
      </Flex>
    </Page>
  )
}

export default Project
