import { gql, useMutation, useQuery } from '@apollo/client'
import { orderBy } from 'lodash'
import React, { ReactElement } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { Transition, TransitionGroup } from 'react-transition-group'
import { v4 as uuidv4 } from 'uuid'
import { Component } from '../../main/generated/typescript-helpers'
import { Icons } from '../assets/icons'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import ButtonDropdown from './ButtonDropdown'
import FilteredItemList from './FilteredItemList'
import { Spinner } from './Spinner'
import {
  Container,
  DraggableContainer,
  DraggableList,
  DragHandle,
} from './styled/ReorderableComponentList'
import ViewHeader from './ViewHeader'

const GET_COMPONENTS_BY_VIEW = gql`
  query ComponentsByView($viewKey: String!) {
    view(key: $viewKey) {
      key
      name
      type
    }
    componentsByView(viewKey: $viewKey) {
      key
      type
      location
      parameters
      sortOrder {
        sortOrder
      }
    }
    theme @client
  }
`
const ADD_FILTERED_LIST = gql`
  mutation CreateFilteredItemListComponent($input: CreateFilteredItemListComponentInput!) {
    createFilteredItemListComponent(input: $input) {
      key
    }
  }
`

const ADD_HEADER = gql`
  mutation CreateViewHeaderComponent($input: CreateViewHeaderComponentInput!) {
    createViewHeaderComponent(input: $input) {
      key
    }
  }
`

const SET_COMPONENT_ORDER = gql`
  mutation SetComponentOrder($componentKey: String!, $sortOrder: Int!) {
    setComponentOrder(input: { componentKey: $componentKey, sortOrder: $sortOrder }) {
      componentKey
    }
  }
`

type ReorderableComponentListProps = {
  viewKey: string
}

const ReorderableComponentList = (props: ReorderableComponentListProps): ReactElement => {
  const { loading, error, data, refetch } = useQuery(GET_COMPONENTS_BY_VIEW, {
    variables: { viewKey: props.viewKey },
  })

  const [addFilteredList] = useMutation(ADD_FILTERED_LIST)
  const [addHeader] = useMutation(ADD_HEADER)
  const [setComponentOrder] = useMutation(SET_COMPONENT_ORDER)
  if (loading)
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignContent: 'center',
        }}
      >
        <Spinner loading={true}></Spinner>
      </div>
    )
  if (error) return null
  const sortedComponents: Component[] = orderBy(
    data.componentsByView,
    ['sortOrder.sortOrder'],
    ['asc'],
  )

  const componentSwitch = (params, comp, provided) => {
    switch (comp.type) {
      case 'FilteredItemList':
        return <FilteredItemList {...params} componentKey={comp.key} key={comp.key} />
      case 'ViewHeader':
        return (
          <ViewHeader
            dragHandle={provided.dragHandleProps}
            key={comp.key}
            componentKey={comp.key}
            id={comp.key}
            {...params}
          />
        )
    }
  }

  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <DragDropContext
          onDragEnd={(e) => {
            setComponentOrder({
              variables: { componentKey: e.draggableId, sortOrder: e.destination.index },
            })
            refetch()
          }}
          style={{ width: '100%' }}
        >
          <Droppable droppableId={uuidv4()} type="COMPONENT">
            {(provided, snapshot) => (
              <DraggableList
                {...provided.droppableProps}
                ref={provided.innerRef}
                isDraggingOver={snapshot.isDraggingOver}
              >
                <TransitionGroup component={null}>
                  {sortedComponents.map((comp, index) => {
                    if (comp.location == 'main') {
                      const params = JSON.parse(comp.parameters)
                      return (
                        <Transition
                          key={comp.key}
                          timeout={{
                            appear: 100,
                            enter: 100,
                            exit: 100,
                          }}
                        >
                          {(state) => {
                            return (
                              <Draggable
                                key={comp.key}
                                draggableId={comp.key}
                                index={index}
                                isDragDisabled={false}
                              >
                                {(provided, snapshot) => (
                                  <DraggableContainer
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    key={'container-' + comp.key}
                                    isDragging={snapshot.isDragging}
                                    draggableStyle={provided.draggableProps.style}
                                    state={state}
                                  >
                                    <DragHandle {...provided.dragHandleProps}>
                                      {Icons['dragHandle']()}
                                    </DragHandle>
                                    {componentSwitch(params, comp, provided)}
                                  </DraggableContainer>
                                )}
                              </Draggable>
                            )
                          }}
                        </Transition>
                      )
                    }
                  })}
                </TransitionGroup>
              </DraggableList>
            )}
          </Droppable>
        </DragDropContext>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: '10px',
            width: '100%',
          }}
        >
          <div style={{ width: '250px' }}>
            <ButtonDropdown
              defaultButtonText={'Add component'}
              defaultButtonIcon={'collapse'}
              createable={false}
              buttonText={'Add component'}
              onSubmit={(e) => {
                e()
              }}
              completed={false}
              options={[
                {
                  label: 'FilteredItemList',
                  value: () => {
                    addFilteredList({
                      variables: {
                        input: {
                          key: uuidv4(),
                          viewKey: props.viewKey,
                          type: 'FilteredItemList',
                          location: 'main',
                          parameters: {
                            filter: JSON.stringify({
                              text:
                                data.view.type == 'project'
                                  ? `project = "${data.view.name}"`
                                  : 'createdAt is today ',
                              value:
                                data.view.type == 'project'
                                  ? [
                                      {
                                        category: 'projectKey',
                                        operator: '=',
                                        value: data.view.key,
                                      },
                                    ]
                                  : [{ category: 'createdAt', operator: 'is', value: 'today' }],
                            }),
                            hiddenIcons: [],
                            isFilterable: true,
                            listName: 'New list',
                            flattenSubtasks: true,
                            showCompletedToggle: true,
                            initiallyExpanded: true,
                          },
                        },
                      },
                    })
                    refetch()
                  },
                },
                {
                  label: 'Header',
                  value: () => {
                    addHeader({
                      variables: {
                        input: {
                          key: uuidv4(),
                          viewKey: props.viewKey,
                          type: 'ViewHeader',
                          location: 'main',
                          parameters: {
                            name: data.view.name,
                            icon: 'view',
                          },
                        },
                      },
                    })
                    refetch()
                  },
                },
              ]}
            />
          </div>
        </div>
      </Container>
    </ThemeProvider>
  )
}

export default ReorderableComponentList
