import { gql, useMutation, useQuery } from '@apollo/client'
import { orderBy } from 'lodash'
import React, { ReactElement } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { NavLink, NavLinkProps, useHistory } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { Area, View } from '../../main/generated/typescript-helpers'
import { Icons } from '../assets/icons'
import { sidebarVisibleVar } from '../index'
import { ThemeType } from '../interfaces'
import styled, { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { createShortSidebarItem, getProductName } from '../utils'
import Button from './Button'
import {
  AddAreaContainer,
  BodyContainer,
  CollapseContainer,
  Container,
  DraggableItem,
  DroppableList,
  Footer,
  HeaderName,
  SectionHeader,
  StyledHorizontalRule,
  SubsectionHeader,
  ViewContainer,
} from './styled/Sidebar'
import Tooltip from './Tooltip'

interface StyledLinkProps extends NavLinkProps {
  sidebarVisible: boolean
}

export const StyledLink = styled(({ sidebarVisible, ...rest }: StyledLinkProps) => {
  return <NavLink {...rest} />
})`
  display: flex;
  box-sizing: border-box;
  justify-content: ${(props) => (props.sidebarVisible ? 'flex-start' : 'center')};
  align-items: center;
  font-size: ${(props) =>
    props.sidebarVisible ? props.theme.fontSizes.xsmall : props.theme.fontSizes.regular};
  font-weight: ${(props) => props.theme.fontWeights.regular};
  color: ${(props) => props.theme.colours.altTextColour};
  border-radius: 5px;
  margin: 1px 0px;
  text-decoration: none;
  padding: 5px 15px;
  outline: none;
  :active {
    outline: none;
  }
  :focus {
    outline: none;
  }
  :hover {
    background-color: ${(props) => props.theme.colours.focusAltDialogBackgroundColour};
  }
  svg {
    margin-right: ${(props) => (props.sidebarVisible ? '5px' : '0px')};
  }
`
interface ProjectLinkProps {
  sidebarVisible: boolean
}
export const ProjectLink = styled(StyledLink)<ProjectLinkProps>`
  width: 100%;
  padding: ${(props) => (props.sidebarVisible ? '5px 2px 5px 25px' : '5px 2px 5px 2px')};
  font-size: ${(props) =>
    props.sidebarVisible ? props.theme.fontSizes.xsmall : props.theme.fontSizes.xxsmall};
`
interface AreaLinkProps {
  sidebarVisible: boolean
}
export const AreaLink = styled(StyledLink)<AreaLinkProps>`
  width: 100%;
  font-size: ${(props) => props.theme.fontSizes.small};
  padding: 7px 5px;
`

const SidebarItem = (props: {
  sidebarVisible: boolean
  iconName: string
  text: string
}): React.ReactElement => {
  const id = uuidv4()
  if (props.sidebarVisible) {
    return (
      <>
        <div data-tip data-for={id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
          {props.iconName && Icons[props.iconName](16, 16)}
          {props.text}
        </div>
        <Tooltip id={id} text={props.text} />
      </>
    )
  }
  return (
    <>
      <div data-tip data-for={id} style={{ display: 'flex', justifyContent: 'center' }}>
        {Icons[props.iconName](20, 20)}
      </div>

      <Tooltip id={id} text={props.text} />
    </>
  )
}

const GET_AREAS = gql`
  query GetSidebarData {
    areas {
      name
      key
      deleted
      sortOrder {
        areaKey
        sortOrder
      }
      projects {
        key
        name
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
    theme @client
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
  const { loading, error, data, refetch } = useQuery(GET_AREAS)
  const [setProjectOrder] = useMutation(SET_PROJECT_ORDER)
  const [setAreaOrder] = useMutation(SET_AREA_ORDER)
  const [setAreaOfProject] = useMutation(SET_AREA_OF_PROJECT)
  const [createProject] = useMutation(CREATE_PROJECT)
  const [createArea] = useMutation(CREATE_AREA)

  // TODO: Loading and error states
  if (loading) return null
  if (error) return null

  const theme: ThemeType = themes[data.theme]

  const sortedAreas: Area[] = orderBy(data.areas, ['sortOrder.sortOrder'], ['asc']).filter(
    (a) => a.deleted == false,
  )
  const sortedViews: View[] = orderBy(data.views, ['sortOrder.sortOrder'], ['asc']).filter(
    (v) => v.type != 'default',
  )

  return (
    <ThemeProvider theme={theme}>
      <Container visible={data.sidebarVisible} data-cy="sidebar-container">
        <BodyContainer>
          <SectionHeader visible={data.sidebarVisible}>
            {Icons['view'](22, 22, theme.colours.primaryColour)}
            {data.sidebarVisible && <HeaderName>Views</HeaderName>}
          </SectionHeader>
          <ViewContainer collapsed={!data.sidebarVisible}>
            <StyledLink
              sidebarVisible={data.sidebarVisible}
              to="/inbox"
              activeStyle={{
                backgroundColor: theme.colours.focusAltDialogBackgroundColour,
              }}
            >
              <SidebarItem sidebarVisible={data.sidebarVisible} iconName={'inbox'} text={'Inbox'} />
            </StyledLink>
            <StyledLink
              sidebarVisible={data.sidebarVisible}
              to="/dailyAgenda"
              activeStyle={{
                backgroundColor: theme.colours.focusAltDialogBackgroundColour,
              }}
            >
              <SidebarItem
                sidebarVisible={data.sidebarVisible}
                iconName={'calendar'}
                text={'Daily Agenda'}
              />
            </StyledLink>
            <StyledLink
              sidebarVisible={data.sidebarVisible}
              to="/weeklyAgenda"
              activeStyle={{
                backgroundColor: theme.colours.focusAltDialogBackgroundColour,
              }}
            >
              <SidebarItem
                sidebarVisible={data.sidebarVisible}
                iconName={'weekly'}
                text={'Weekly Agenda'}
              />
            </StyledLink>
            {sortedViews.map((view) => {
              if (view.type == 'project') return null
              return (
                <StyledLink
                  sidebarVisible={data.sidebarVisible}
                  key={view.key}
                  to={`/views/${view.key}`}
                  activeStyle={{
                    backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                  }}
                >
                  <SidebarItem
                    sidebarVisible={data.sidebarVisible}
                    iconName={view.icon}
                    text={view.name}
                  />
                </StyledLink>
              )
            })}
          </ViewContainer>
          <SectionHeader visible={data.sidebarVisible}>
            {Icons['area'](22, 22, theme.colours.primaryColour)}
            {data.sidebarVisible && <HeaderName>Areas</HeaderName>}
          </SectionHeader>

          <DragDropContext
            onDragEnd={(e) => {
              console.log(e)

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
            <Droppable droppableId={uuidv4()} type="AREA">
              {(provided, snapshot) => (
                <DroppableList
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  isDraggingOver={snapshot.isDraggingOver}
                  sidebarVisible={data.sidebarVisible}
                >
                  {sortedAreas.map((a, index) => {
                    return (
                      <Draggable key={a.key} draggableId={a.key} index={index}>
                        {(provided, snapshot) => (
                          <DraggableItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            key={'container-' + a.key}
                            isDragging={snapshot.isDragging}
                            draggableStyle={provided.draggableProps.style}
                            sidebarVisible={data.sidebarVisible}
                          >
                            {!data.sidebarVisible && <StyledHorizontalRule />}
                            <SubsectionHeader visible={data.sidebarVisible}>
                              <AreaLink
                                data-tip
                                data-for={a.key}
                                sidebarVisible={data.sidebarVisible}
                                to={`/areas/${a.key}`}
                                activeStyle={{
                                  backgroundColor: theme.colours.focusAltDialogBackgroundColour,
                                }}
                              >
                                {data.sidebarVisible ? a.name : createShortSidebarItem(a.name)}
                              </AreaLink>
                              <Tooltip id={a.key} text={a.name} />
                              {data.sidebarVisible && (
                                <Button
                                  tooltipText="Add Project"
                                  type="invert"
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
                                    history.push('/projects/' + projectKey)
                                  }}
                                />
                              )}
                            </SubsectionHeader>
                            <Droppable droppableId={a.key} type="PROJECT">
                              {(provided, snapshot) => (
                                <DroppableList
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  isDraggingOver={snapshot.isDraggingOver}
                                  sidebarVisible={data.sidebarVisible}
                                >
                                  {orderBy(a.projects, ['sortOrder.sortOrder'], ['asc']).map(
                                    (p, index) => {
                                      // Don't render the inbox here
                                      if (p.key == '0') return
                                      const pathName = '/projects/' + p.key
                                      //
                                      return (
                                        <Draggable key={p.key} draggableId={p.key} index={index}>
                                          {(provided, snapshot) => (
                                            <DraggableItem
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              key={'container-' + p.key}
                                              isDragging={snapshot.isDragging}
                                              draggableStyle={provided.draggableProps.style}
                                              siebarVisible={data.sidebarVisible}
                                            >
                                              <ProjectLink
                                                data-tip
                                                data-for={p.key}
                                                sidebarVisible={data.sidebarVisible}
                                                key={p.key}
                                                to={pathName}
                                                activeStyle={{
                                                  backgroundColor:
                                                    theme.colours.focusAltDialogBackgroundColour,
                                                }}
                                              >
                                                {data.sidebarVisible
                                                  ? p.name
                                                  : createShortSidebarItem(p.name)}
                                              </ProjectLink>
                                              <Tooltip id={p.key} text={p.name} />
                                            </DraggableItem>
                                          )}
                                        </Draggable>
                                      )
                                    },
                                  )}
                                </DroppableList>
                              )}
                            </Droppable>
                          </DraggableItem>
                        )}
                      </Draggable>
                    )
                  })}
                </DroppableList>
              )}
            </Droppable>
          </DragDropContext>
          {data.sidebarVisible && (
            <AddAreaContainer>
              <Button
                tooltipText="Add Area"
                width="110px"
                type="invert"
                spacing="compact"
                text={data.sidebarVisible ? 'Add Area' : ''}
                iconSize="12px"
                icon="add"
                onClick={() => {
                  const areaKey = uuidv4()
                  createArea({
                    variables: { key: areaKey, name: getProductName(), description: '' },
                  })
                  refetch()
                }}
              />
            </AddAreaContainer>
          )}
        </BodyContainer>
        <Footer visible={data.sidebarVisible}>
          <StyledLink
            sidebarVisible={data.sidebarVisible}
            to="/settings"
            activeStyle={{
              backgroundColor: theme.colours.focusAltDialogBackgroundColour,
              borderRadius: '5px',
            }}
          >
            <SidebarItem
              sidebarVisible={data.sidebarVisible}
              iconName={'settings'}
              text={'Settings'}
            />
          </StyledLink>
          <CollapseContainer data-cy="sidebar-btn-container">
            <Button
              tooltipText="Toggle sidebar"
              spacing="compact"
              icon={data.sidebarVisible ? 'slideLeft' : 'slideRight'}
              type="invert"
              onClick={() => {
                sidebarVisibleVar(!data.sidebarVisible)
              }}
              iconSize="18px"
            />
          </CollapseContainer>
        </Footer>
      </Container>
    </ThemeProvider>
  )
}

export default Sidebar
