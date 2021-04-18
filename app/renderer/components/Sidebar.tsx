import { gql, useMutation, useQuery } from '@apollo/client'
import { orderBy } from 'lodash'
import React, { ReactElement } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { NavLink, useHistory } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Area, View } from '../../main/generated/typescript-helpers'
import { Icons } from '../assets/icons'
import { sidebarVisibleVar } from '../index'
import { IconType } from '../interfaces'
import { createShortSidebarItem, getProductName } from '../utils'
import { Emoji } from 'emoji-mart'
import Button from './Button'

import Tooltip from './Tooltip'
import { chakra, Flex, Text, VStack, Divider, Stack, useTheme } from '@chakra-ui/react'
import { SidebarSection } from './SidebarSection'
import { SidebarDroppableList } from './SidebarDroppableList'
import { SidebarDraggableItem } from './SidebarDraggableItem'

const SidebarItem = (props: {
  sidebarVisible: boolean
  iconName: string
  text: string
}): React.ReactElement => {
  const id = uuidv4()
  if (props.sidebarVisible) {
    return (
      <>
        <Flex
          key={uuidv4()}
          m={0}
          px={2}
          py={0}
          data-tip
          data-for={id}
          justifyContent="flex-start"
          alignItems={'center'}
        >
          {props.iconName && Icons[props.iconName](16, 16)}
          <Text key={uuidv4()} p={0} pl={1} m={0} color={'gray.100'} fontSize="md">
            {props.text}
          </Text>
        </Flex>
        <Tooltip key={uuidv4()} id={id} text={props.text} />
      </>
    )
  }
  return (
    <>
      <Flex key={uuidv4()} m={0} px={2} py={0} data-tip data-for={id} justifyContent="center">
        {Icons[props.iconName](20, 20)}
      </Flex>
      <Tooltip key={uuidv4()} id={id} text={props.text} />
    </>
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
      projects {
        key
        name
        emoji
        sortOrder {
          projectKey
          sortOrder
        }
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
  const { loading, error, data, refetch } = useQuery(GET_AREAS)
  const [setProjectOrder] = useMutation(SET_PROJECT_ORDER)
  const [setAreaOrder] = useMutation(SET_AREA_ORDER)
  const [setAreaOfProject] = useMutation(SET_AREA_OF_PROJECT)
  const [createProject] = useMutation(CREATE_PROJECT)
  const [createArea] = useMutation(CREATE_AREA, { refetchQueries: ['GetSidebarData'] })

  // TODO: Loading and error states
  if (loading) return null
  if (error) return null

  const sortedAreas: Area[] = orderBy(data.areas, ['sortOrder.sortOrder'], ['asc']).filter(
    (a) => a.deleted == false,
  )
  const sortedViews: View[] = orderBy(data.views, ['sortOrder.sortOrder'], ['asc']).filter(
    (v) => v.type != 'default',
  )

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

  return (
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
      key={uuidv4()}
      m={0}
      overflowY={'scroll'}
    >
      <VStack key={uuidv4()} spacing={0} w={'100%'}>
        <SidebarSection
          key={uuidv4()}
          name="Views"
          iconName="view"
          sidebarVisible={data.sidebarVisible}
        />
        <VStack key={uuidv4()} spacing={0} w={'100%'}>
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
        <SidebarSection
          key={uuidv4()}
          name="Areas"
          iconName="area"
          sidebarVisible={data.sidebarVisible}
        />
        <DragDropContext
          key={uuidv4()}
          onDragEnd={(e) => {
            if (e.type == 'PROJECT') {
              const areaKey = e.destination.droppableId
              const area = sortedAreas.find((a) => a.key == areaKey)
              const sortedProjects = orderBy(area.projects, ['sortOrder.sortOrder'], ['asc'])
              //  Trying to detect drops in non-valid areas
              if (!e.destination) {
                return
              }
              setAreaOfProject({
                variables: { key: e.draggableId, areaKey: areaKey },
              })

              // Project Order is harder as the index is based on the area
              const projectAtDestination = sortedProjects[e.destination.index]
              // If there's no projects in the area
              if (!projectAtDestination) {
                refetch()
                return
              }
              setProjectOrder({
                variables: {
                  projectKey: e.draggableId,
                  sortOrder: projectAtDestination.sortOrder.sortOrder,
                },
              })
            }
            if (e.type == 'AREA') {
              setAreaOrder({
                variables: {
                  areaKey: e.draggableId,
                  sortOrder: sortedAreas[e.destination.index].sortOrder.sortOrder,
                },
              })
            }
            refetch()
          }}
        >
          <Droppable key={uuidv4()} droppableId={uuidv4()} type="AREA">
            {(provided, snapshot) => (
              <SidebarDroppableList
                key={uuidv4()}
                sidebarVisible={data.sidebarVisible}
                snapshot={snapshot}
                provided={provided}
              >
                {sortedAreas.map((a, index) => {
                  return (
                    <>
                      <Draggable key={a.key} draggableId={a.key} index={index}>
                        {(provided, snapshot) => (
                          <SidebarDraggableItem
                            key={'draggable-' + a.key}
                            sidebarVisible={data.sidebarVisible}
                            snapshot={snapshot}
                            provided={provided}
                          >
                            {!data.sidebarVisible && <Divider />}
                            <Flex
                              key={uuidv4()}
                              direction={'row'}
                              justifyContent={'space-between'}
                              py={1}
                              px={0}
                              alignItems={'center'}
                            >
                              <StyledLink
                                key={uuidv4()}
                                activeStyle={{
                                  backgroundColor: theme.colors.gray[900],
                                }}
                                {...linkStyles}
                                textAlign={'center'}
                                data-tip
                                data-for={a.key}
                                to={`/areas/${a.key}`}
                              >
                                {data.sidebarVisible ? (
                                  <Flex p={0} alignItems="baseline" key={uuidv4()}>
                                    <Emoji
                                      key={uuidv4()}
                                      emoji={a.emoji ? a.emoji : ''}
                                      size={14}
                                      native={true}
                                    />
                                    <Text pl={1} key={uuidv4()} fontSize="md" color={'gray.100'}>
                                      {a.name}
                                    </Text>
                                  </Flex>
                                ) : a.emoji ? (
                                  <Emoji
                                    key={uuidv4()}
                                    emoji={a.emoji ? a.emoji : ''}
                                    size={16}
                                    native={true}
                                  />
                                ) : (
                                  <Text key={uuidv4()} fontSize="md" color={'gray.100'}>
                                    {createShortSidebarItem(a.name)}
                                  </Text>
                                )}
                              </StyledLink>

                              <Tooltip key={uuidv4()} id={a.key} text={a.name} />
                              {data.sidebarVisible && (
                                <Button
                                  key={uuidv4()}
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
                                    refetch()
                                    history.push('/views/' + projectKey)
                                  }}
                                />
                              )}
                            </Flex>
                            <Droppable key={uuidv4()} droppableId={a.key} type="PROJECT">
                              {(provided, snapshot) => (
                                <SidebarDroppableList
                                  key={uuidv4()}
                                  sidebarVisible={data.sidebarVisible}
                                  snapshot={snapshot}
                                  provided={provided}
                                >
                                  {orderBy(a.projects, ['sortOrder.sortOrder'], ['asc']).map(
                                    (p, index) => {
                                      // Don't render the inbox here
                                      if (p.key == '0') return
                                      const pathName = '/views/' + p.key
                                      //
                                      return (
                                        <Draggable key={p.key} draggableId={p.key} index={index}>
                                          {(provided, snapshot) => (
                                            <SidebarDraggableItem
                                              key={'draggable-' + p.key}
                                              sidebarVisible={data.sidebarVisible}
                                              snapshot={snapshot}
                                              provided={provided}
                                            >
                                              <StyledLink
                                                key={uuidv4()}
                                                activeStyle={{
                                                  backgroundColor: theme.colors.gray[900],
                                                }}
                                                {...linkStyles}
                                                data-tip
                                                data-for={p.key}
                                                to={pathName}
                                              >
                                                {data.sidebarVisible ? (
                                                  <Flex alignItems="baseline" key={uuidv4()}>
                                                    <Emoji
                                                      key={uuidv4()}
                                                      emoji={p.emoji ? p.emoji : ''}
                                                      size={14}
                                                      native={true}
                                                    />
                                                    <Text
                                                      key={uuidv4()}
                                                      fontSize="md"
                                                      color={'gray.100'}
                                                      pl={1}
                                                    >
                                                      {p.name}
                                                    </Text>
                                                  </Flex>
                                                ) : p.emoji ? (
                                                  <Emoji
                                                    key={uuidv4()}
                                                    emoji={p.emoji ? p.emoji : ''}
                                                    size={16}
                                                    native={true}
                                                  />
                                                ) : (
                                                  <Text
                                                    textAlign={'center'}
                                                    key={uuidv4()}
                                                    fontSize="md"
                                                    color={'gray.100'}
                                                  >
                                                    {createShortSidebarItem(p.name)}
                                                  </Text>
                                                )}
                                              </StyledLink>
                                              <Tooltip key={uuidv4()} id={p.key} text={p.name} />
                                            </SidebarDraggableItem>
                                          )}
                                        </Draggable>
                                      )
                                    },
                                  )}
                                </SidebarDroppableList>
                              )}
                            </Droppable>
                          </SidebarDraggableItem>
                        )}
                      </Draggable>
                    </>
                  )
                })}
              </SidebarDroppableList>
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
                refetch()
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
  )
}

export default Sidebar
