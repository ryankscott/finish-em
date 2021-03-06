import { gql, useMutation, useQuery } from '@apollo/client'
import {
  Box,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Grid,
  GridItem,
  Text,
  useTheme,
  useColorMode,
} from '@chakra-ui/react'
import Tippy from '@tippyjs/react'
import { parseISO } from 'date-fns'
import { Emoji, Picker } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'
import React, { ReactElement, useState } from 'react'
import DatePicker from 'react-datepicker'
import { useHistory } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'tippy.js/dist/tippy.css'
import { Item as ItemType, Project as ProjectType } from '../../main/generated/typescript-helpers'
import { formatRelativeDate } from '../utils'
import DeleteProjectDialog from './DeleteProjectDialog'
import { Donut } from './Donut'
import EditableText2 from './EditableText2'
import ItemCreator from './ItemCreator'
import './styled/ReactDatePicker.css'
import { v4 as uuidv4 } from 'uuid'

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
  const { colorMode, toggleColorMode } = useColorMode()
  const [deleteProject] = useMutation(DELETE_PROJECT, { refetchQueries: ['GetSidebarData'] })
  const [changeDescription] = useMutation(CHANGE_DESCRIPTION, { refetchQueries: ['ViewByKey'] })
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
    <>
      <Grid
        gridAutoRows={'60px 40px'}
        gridTemplateColumns={'110px 1fr'}
        alignItems={'center'}
        py={2}
        px={0}
      >
        <GridItem colStart={1} colSpan={1} rowStart={1} rowSpan={2}>
          <Flex
            w={'100px'}
            h={'100px'}
            borderRadius={'50%'}
            justifyContent={'center'}
            fontSize={'xl'}
            boxShadow={colorMode == 'light' ? 'none' : '0 0 3px 0 #222'}
            bg={colorMode == 'light' ? 'gray.100' : 'gray.800'}
            my={0}
            _hover={{
              bg: colorMode == 'light' ? 'gray.200' : 'gray.900',
            }}
            transition={'all 0.1s ease-in-out'}
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
            <Editable
              key={uuidv4()}
              defaultValue={project.name}
              fontSize="3xl"
              mx={2}
              w={'100%'}
              color="blue.500"
              fontWeight="light"
              onSubmit={(input) => {
                const exists = projects.map((p) => p.name == input).includes(true)
                if (exists) {
                  toast.error('Cannot rename project, a project with that name already exists')
                } else {
                  renameProject({ variables: { key: project.key, name: input } })
                }
              }}
            >
              <EditablePreview />
              <EditableInput />
            </Editable>
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
          <Tippy delay={500} content={`${completedItems.length}/${allItems.length} completed`}>
            <Flex justifyContent={'flex-start'} alignItems={'center'}>
              <Donut
                size={30}
                progress={
                  allItems.length != 0 ? (100 * completedItems.length) / allItems.length : 0
                }
              />
              <Text fontSize="md">
                {completedItems.length} of {allItems.length} items completed
              </Text>
            </Flex>
          </Tippy>
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
      <EditableText2
        key={`desc-${project.key}`}
        input={project.description}
        singleLine={false}
        placeholder="Add a description for your project..."
        shouldClearOnSubmit={false}
        hideToolbar={false}
        shouldSubmitOnBlur={true}
        onUpdate={(input) => {
          changeDescription({ variables: { key: project.key, description: input } })
        }}
      />

      <Flex direction={'column'} justifyContent={'flex-end'} py={2} px={0} w={'100%'}>
        <ItemCreator
          key={`creator-${project.key}`}
          projectKey={project.key}
          buttonText="Add to project"
          width="100%"
          initiallyExpanded={false}
        />
      </Flex>
    </>
  )
}

export default Project
