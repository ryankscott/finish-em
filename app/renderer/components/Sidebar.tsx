import { gql, useMutation, useQuery } from '@apollo/client'
import { orderBy } from 'lodash'
import React, { ReactElement, useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { NavLink, useHistory } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Icons } from '../assets/icons'
import { sidebarVisibleVar } from '../index'
import { IconType } from '../interfaces'
import { createShortSidebarItem, getProductName } from '../utils'
import { Emoji } from 'emoji-mart'
import Button from './Button'

import { chakra, Flex, Text, VStack, Divider, Stack, Tooltip, useTheme } from '@chakra-ui/react'
import { SidebarSection } from './SidebarSection'
import { SidebarDraggableItem } from './SidebarDraggableItem'

const SidebarItem = (props: {
  sidebarVisible: boolean
  iconName: string
  text: string
}): React.ReactElement => {
  const id = uuidv4()
  if (props.sidebarVisible) {
    return (
      <Tooltip key={uuidv4()} label={props.text} arrowSize={5} hasArrow={true} openDelay={500}>
        <Flex key={uuidv4()} m={0} px={2} py={0} justifyContent="flex-start" alignItems={'center'}>
          {props.iconName && Icons[props.iconName](16, 16)}
          <Text key={uuidv4()} p={0} pl={1} m={0} color={'gray.100'} fontSize="md">
            {props.text}
          </Text>
        </Flex>
      </Tooltip>
    )
  }
  return (
    <Tooltip key={uuidv4()} label={props.text} arrowSize={5} hasArrow={true} openDelay={500}>
      <Flex key={uuidv4()} m={0} px={2} py={0} justifyContent="center">
        {Icons[props.iconName](20, 20)}
      </Flex>
    </Tooltip>
  )
}

const GET_AREAS = gql`
  query GetSidebarData {
    areas {
      name
      key
      deleted
      emoji
      sortOrder {
        areaKey
        sortOrder
      }
    }
    views {
      key
      name
      icon
      type
      sortOrder {
        viewKey
        sortOrder
      }
    }
    projects(input: { deleted: false }) {
      key
      name
      emoji
      area {
        key
      }
      sortOrder {
        projectKey
        sortOrder
      }
    }
    sidebarVisible @client
  }
`

const SET_PROJECT_ORDER = gql`
  mutation SetProjectOrder($projectKey: String!, $sortOrder: Int!) {
    setProjectOrder(input: { projectKey: $projectKey, sortOrder: $sortOrder }) {
      projectKey
      sortOrder
    }
  }
`

const SET_AREA_OF_PROJECT = gql`
  mutation SetAreaOfProject($key: String!, $areaKey: String!) {
    setAreaOfProject(input: { key: $key, areaKey: $areaKey }) {
      key
      area {
        key
      }
    }
  }
`

const SET_AREA_ORDER = gql`
  mutation SetAreaOrder($areaKey: String!, $sortOrder: Int!) {
    setAreaOrder(input: { areaKey: $areaKey, sortOrder: $sortOrder }) {
      areaKey
      sortOrder
    }
  }
`
const CREATE_PROJECT = gql`
  mutation CreateProject(
    $key: String!
    $name: String!
    $description: String!
    $startAt: DateTime
    $endAt: DateTime
    $areaKey: String!
  ) {
    createProject(
      input: {
        key: $key
        name: $name
        description: $description
        startAt: $startAt
        endAt: $endAt
        areaKey: $areaKey
      }
    ) {
      key
      name
    }
  }
`
const CREATE_AREA = gql`
  mutation CreateArea($key: String!, $name: String!, $description: String) {
    createArea(input: { key: $key, name: $name, description: $description }) {
      key
      name
    }
  }
`
type SidebarProps = {}
const Sidebar = (props: SidebarProps): ReactElement => {
  const history = useHistory()
  const theme = useTheme()
  const { loading, error, data } = useQuery(GET_AREAS)
  const [setProjectOrder] = useMutation(SET_PROJECT_ORDER)
  const [setAreaOrder] = useMutation(SET_AREA_ORDER)
  const [setAreaOfProject] = useMutation(SET_AREA_OF_PROJECT)
  const [createProject] = useMutation(CREATE_PROJECT)
  const [createArea] = useMutation(CREATE_AREA, { refetchQueries: ['GetSidebarData'] })
  const [sortedAreas, setSortedAreas] = useState([])
  const [sortedProjects, setSortedProjects] = useState([])
  const [sortedViews, setSortedViews] = useState([])

  useEffect(() => {
    if (loading === false && data) {
      setSortedAreas(
        orderBy(data.areas, ['sortOrder.sortOrder'], ['asc']).filter((a) => a.deleted == false),
      )
      setSortedProjects(orderBy(data.projects, ['sortOrder.sortOrder'], ['asc']))

      setSortedViews(
        orderBy(data.views, ['sortOrder.sortOrder'], ['asc']).filter((v) => v.type != 'default'),
      )
    }
  }, [loading, data])

  // TODO: Loading and error states
  if (loading) return null
  if (error) return null

  const defaultViews: { path: string; iconName: IconType; text: string }[] = [
    {
      path: '/inbox',
      iconName: 'inbox',
      text: 'Inbox',
    },
    {
      path: '/dailyAgenda',
      iconName: 'calendar',
      text: 'Daily Agenda',
    },
    {
      path: '/weeklyAgenda',
      iconName: 'weekly',
      text: 'Weekly Agenda',
    },
  ]

  const StyledLink = chakra(NavLink)
  const linkStyles = {
    color: 'gray.100',
    w: '100%',
    borderRadius: 4,
    py: 1.25,
    m: 0,
    my: 0.25,
    px: data.sidebarVisible ? 2 : 0,
    _hover: {
      bg: 'gray.900',
    },
    _active: {
      bg: 'gray.900',
    },
  }

  const droppableStyles = {
    direction: 'column',
    justifyContent: 'center',
    w: '100%',
    m: 0,
    p: 0,
    borderRadius: 5,
  }

  return (
    <>
      <Flex
        alignItems={data.sidebarVisible ? 'none' : 'center'}
        direction={'column'}
        justifyContent={'space-between'}
        transition={'all 0.2s ease-in-out'}
        w={data.sidebarVisible ? '250px' : '50px'}
        minW={data.sidebarVisible ? '250px' : '50px'}
        height={'100%'}
        p={2}
        bg={'gray.800'}
        shadow={'md'}
        data-cy="sidebar-container"
        m={0}
        overflowY={'scroll'}
      >
        <VStack spacing={0} w={'100%'}>
          <SidebarSection name="Views" iconName="view" sidebarVisible={data.sidebarVisible} />
          <VStack spacing={0} w={'100%'}>
            {defaultViews.map((d) => {
              return (
                <StyledLink
                  activeStyle={{
                    backgroundColor: theme.colors.gray[900],
                  }}
                  {...linkStyles}
                  to={d.path}
                  key={'link-' + d.path}
                >
                  <SidebarItem
                    key={d.path}
                    sidebarVisible={data.sidebarVisible}
                    iconName={d.iconName}
                    text={d.text}
                  />
                </StyledLink>
              )
            })}
            {sortedViews.map((view) => {
              if (view.type == 'project' || view.type == 'area') return null
              return (
                <StyledLink
                  activeStyle={{
                    backgroundColor: theme.colors.gray[900],
                  }}
                  {...linkStyles}
                  key={view.key}
                  to={`/views/${view.key}`}
                >
                  <SidebarItem
                    key={'sidebarItem-' + view.key}
                    sidebarVisible={data.sidebarVisible}
                    iconName={view.icon}
                    text={view.name}
                  />
                </StyledLink>
              )
            })}
          </VStack>
          <SidebarSection name="Areas" iconName="area" sidebarVisible={data.sidebarVisible} />
          <DragDropContext
            onDragEnd={(result: DropResult) => {
              const { destination, source, draggableId, type } = result

              if (type == 'PROJECT') {
                const areaKey = destination.droppableId
                //  Trying to detect drops in non-valid areas
                if (!destination) {
                  return
                }

                // Do nothing if it was a drop to the same place
                if (destination.index == source.index) return

                // Project Order is harder as the index is based on the area
                const projectAtDestination = sortedProjects[destination.index]
                const projectAtSource = sortedProjects[source.index]
                // If there's no projects in the area
                if (!projectAtDestination) {
                  return
                }

                // Sync update
                const newSortedProjects = sortedProjects
                newSortedProjects.splice(source.index, 1)
                newSortedProjects.splice(destination.index, 0, projectAtSource)
                setSortedProjects(newSortedProjects)

                // Async update
                setAreaOfProject({
                  variables: { key: draggableId, areaKey: areaKey },
                })

                setProjectOrder({
                  variables: {
                    projectKey: draggableId,
                    sortOrder: projectAtDestination.sortOrder.sortOrder,
                  },
                })
              }
              if (type == 'AREA') {
                // Project Order is harder as the index is based on the area
                const areaAtDestination = sortedAreas[destination.index]
                const areaAtSource = sortedAreas[source.index]

                // Sync update
                const newSortedAreas = sortedAreas
                newSortedAreas.splice(source.index, 1)
                newSortedAreas.splice(destination.index, 0, areaAtSource)
                setSortedAreas(newSortedAreas)

                // async update
                setAreaOrder({
                  variables: {
                    areaKey: draggableId,
                    sortOrder: areaAtDestination.sortOrder.sortOrder,
                  },
                })
              }
            }}
          >
            <Droppable droppableId={uuidv4()} type="AREA">
              {(provided, snapshot) => (
                <Flex
                  {...droppableStyles}
                  bg={snapshot.isDragging ? 'gray.900' : 'gray.800'}
                  shadow={snapshot.isDragging ? 'base' : 'none'}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                >
                  {sortedAreas.map((a, index) => {
                    return (
                      <Draggable key={'draggable-' + a.key} draggableId={a.key} index={index}>
                        {(provided, snapshot) => (
                          <Flex
                            {...droppableStyles}
                            bg={snapshot.isDragging ? 'gray.900' : 'gray.800'}
                            shadow={snapshot.isDragging ? 'base' : 'none'}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                          >
                            {!data.sidebarVisible && <Divider />}
                            <Flex
                              direction={'row'}
                              justifyContent={'space-between'}
                              py={1}
                              px={0}
                              alignItems={'center'}
                            >
                              <Tooltip
                                key={uuidv4()}
                                label={a.name}
                                arrowSize={5}
                                hasArrow={true}
                                openDelay={500}
                              >
                                <StyledLink
                                  activeStyle={{
                                    backgroundColor: theme.colors.gray[900],
                                  }}
                                  {...linkStyles}
                                  textAlign={'center'}
                                  to={`/areas/${a.key}`}
                                >
                                  {data.sidebarVisible ? (
                                    <Flex p={0} alignItems="baseline">
                                      <Emoji
                                        emoji={a.emoji ? a.emoji : ''}
                                        size={14}
                                        native={true}
                                      />
                                      <Text pl={1} fontSize="md" color={'gray.100'}>
                                        {a.name}
                                      </Text>
                                    </Flex>
                                  ) : a.emoji ? (
                                    <Emoji emoji={a.emoji ? a.emoji : ''} size={16} native={true} />
                                  ) : (
                                    <Text fontSize="md" color={'gray.100'}>
                                      {createShortSidebarItem(a.name)}
                                    </Text>
                                  )}
                                </StyledLink>
                              </Tooltip>
                              {data.sidebarVisible && (
                                <Button
                                  size="md"
                                  tooltipText="Add Project"
                                  variant="invert"
                                  icon="add"
                                  iconColour={'white'}
                                  onClick={() => {
                                    const projectKey = uuidv4()
                                    createProject({
                                      variables: {
                                        key: projectKey,
                                        name: getProductName(),
                                        description: '',
                                        startAt: null,
                                        endAt: null,
                                        areaKey: a.key,
                                      },
                                    })
                                    history.push('/views/' + projectKey)
                                  }}
                                />
                              )}
                            </Flex>

                            <Droppable key={a.key} droppableId={a.key} type="PROJECT">
                              {(provided, snapshot) => (
                                <Flex
                                  {...droppableStyles}
                                  pl={data.sidebarVisible ? 1 : 0}
                                  bg={snapshot.isDragging ? 'gray.900' : 'gray.800'}
                                  shadow={snapshot.isDragging ? 'base' : 'none'}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  ref={provided.innerRef}
                                >
                                  {sortedProjects.map((p, index) => {
                                    // Don't render the inbox here
                                    if (p.key == '0') return
                                    const pathName = '/views/' + p.key
                                    // Don't render projects not part of this area
                                    if (p.area.key != a.key) return
                                    return (
                                      <Draggable key={p.key} draggableId={p.key} index={index}>
                                        {(provided, snapshot) => (
                                          <SidebarDraggableItem
                                            key={'draggable-' + p.key}
                                            sidebarVisible={data.sidebarVisible}
                                            snapshot={snapshot}
                                            provided={provided}
                                          >
                                            <Tooltip
                                              key={uuidv4()}
                                              label={p.name}
                                              arrowSize={5}
                                              hasArrow={true}
                                              openDelay={500}
                                            >
                                              <StyledLink
                                                activeStyle={{
                                                  backgroundColor: theme.colors.gray[900],
                                                }}
                                                {...linkStyles}
                                                to={pathName}
                                              >
                                                {data.sidebarVisible ? (
                                                  <Flex alignItems="baseline">
                                                    <Emoji
                                                      emoji={p.emoji ? p.emoji : ''}
                                                      size={14}
                                                      native={true}
                                                    />
                                                    <Text fontSize="md" color={'gray.100'} pl={1}>
                                                      {p.name}
                                                    </Text>
                                                  </Flex>
                                                ) : p.emoji ? (
                                                  <Emoji
                                                    emoji={p.emoji ? p.emoji : ''}
                                                    size={16}
                                                    native={true}
                                                  />
                                                ) : (
                                                  <Text
                                                    textAlign={'center'}
                                                    fontSize="md"
                                                    color={'gray.100'}
                                                  >
                                                    {createShortSidebarItem(p.name)}
                                                  </Text>
                                                )}
                                              </StyledLink>
                                            </Tooltip>
                                          </SidebarDraggableItem>
                                        )}
                                      </Draggable>
                                    )
                                  })}

                                  {provided.placeholder}
                                </Flex>
                              )}
                            </Droppable>
                          </Flex>
                        )}
                      </Draggable>
                    )
                  })}
                </Flex>
              )}
            </Droppable>
          </DragDropContext>
          {data.sidebarVisible && (
            <Flex key={uuidv4()} mt={4} w={'100%'} justifyContent={'center'} bg={'gray.800'}>
              <Button
                key={uuidv4()}
                tooltipText="Add Area"
                variant="invert"
                size="md"
                text={data.sidebarVisible ? 'Add Area' : ''}
                iconSize="12px"
                icon="add"
                iconPosition="right"
                onClick={() => {
                  const areaKey = uuidv4()
                  createArea({
                    variables: { key: areaKey, name: getProductName(), description: '' },
                  })
                }}
              />
            </Flex>
          )}
        </VStack>
        <Stack
          key={uuidv4()}
          justifyContent={'space-between'}
          w={'100%'}
          my={2}
          direction={data.sidebarVisible ? 'row' : 'column'}
        >
          {!data.sidebarVisible && <Divider />}
          <Flex key={uuidv4()} alignItems={'center'}>
            <StyledLink
              key={uuidv4()}
              activeStyle={{
                backgroundColor: theme.colors.gray[900],
              }}
              {...linkStyles}
              to="/settings"
            >
              <SidebarItem
                key={uuidv4()}
                sidebarVisible={data.sidebarVisible}
                iconName={'settings'}
                text={'Settings'}
              />
            </StyledLink>
          </Flex>
          <Flex key={uuidv4()} justifyContent={'center'} alignItems={'center'}>
            <Button
              key={uuidv4()}
              tooltipText="Toggle sidebar"
              size="sm"
              icon={data.sidebarVisible ? 'slideLeft' : 'slideRight'}
              variant="invert"
              iconColour="white"
              onClick={() => {
                sidebarVisibleVar(!data.sidebarVisible)
              }}
              iconSize="18px"
            />
          </Flex>
        </Stack>
      </Flex>
    </>
  )
}

export default Sidebar
