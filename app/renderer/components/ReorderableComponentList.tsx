import { gql, useMutation, useQuery } from '@apollo/client'
import { orderBy } from 'lodash'
import React, { ReactElement } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { Transition, TransitionGroup } from 'react-transition-group'
import { v4 as uuidv4 } from 'uuid'
import { Component } from '../../main/generated/typescript-helpers'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Button from './Button'
import FilteredItemList from './FilteredItemList'
import { Container, DraggableContainer, DraggableList } from './styled/ReorderableComponentList'
import ViewHeader from './ViewHeader'

const GET_COMPONENTS_BY_VIEW = gql`
  query ComponentsByView($viewKey: String!) {
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
const ADD_COMPONENT = gql`
  mutation CreateFilteredItemListComponent($input: CreateFilteredItemListComponentInput!) {
    createFilteredItemListComponent(input: $input) {
      key
    }
  }
`

const SET_COMPONENT_ORDER = gql`
  mutation SetComponentOrder($componentKey: String!, $sortOrder: Int!) {
    setComponentOrder(componentKey: $componentKey, sortOrder: $sortOrder) {
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

  const [addComponent] = useMutation(ADD_COMPONENT)
  const [setComponentOrder] = useMutation(SET_COMPONENT_ORDER)
  if (loading) return null
  if (error) return null

  const sortedComponents: Component[] = orderBy(
    data.componentsByView,
    ['sortOrder.sortOrder'],
    ['asc'],
  )
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <DragDropContext
          onDragEnd={(e) => {
            setComponentOrder({
              variables: { componentKey: e.draggableId, sortOrder: e.destination.index },
            })
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
                      switch (comp.type) {
                        case 'FilteredItemList':
                          const params = JSON.parse(comp.parameters)
                          console.log(
                            `Component key in ReorderableComponentList: ${comp.key} for index: ${index}`,
                          )
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
                                    isDragDisabled={true}
                                  >
                                    {(provided, snapshot) => (
                                      <DraggableContainer
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        key={'container-' + comp.key}
                                        isDragging={snapshot.isDragging}
                                        draggableStyle={provided.draggableProps.style}
                                        state={state}
                                      >
                                        <FilteredItemList
                                          {...params}
                                          componentKey={comp.key}
                                          key={comp.key}
                                        />
                                      </DraggableContainer>
                                    )}
                                  </Draggable>
                                )
                              }}
                            </Transition>
                          )
                        case 'ViewHeader':
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
                                  <Draggable key={comp.key} draggableId={comp.key} index={index}>
                                    {(provided, snapshot) => (
                                      <DraggableContainer
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        key={'container-' + comp.key}
                                        isDragging={snapshot.isDragging}
                                        draggableStyle={provided.draggableProps.style}
                                        state={state}
                                      >
                                        <ViewHeader key={comp.key} id={comp.key} {...params} />
                                      </DraggableContainer>
                                    )}
                                  </Draggable>
                                )
                              }}
                            </Transition>
                          )
                      }
                    }
                  })}
                </TransitionGroup>
              </DraggableList>
            )}
          </Droppable>
        </DragDropContext>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            paddingBottom: '10px',
          }}
        >
          <Button
            type={'default'}
            iconSize="14px"
            width="90px"
            icon={'add'}
            text={'Add list'}
            onClick={() => {
              addComponent({
                variables: {
                  input: {
                    key: uuidv4(),
                    viewKey: props.viewKey,
                    type: 'FilteredItemList',
                    location: 'main',
                    parameters: {
                      filter: JSON.stringify({
                        text: 'createdAt is today ',
                        value: [{ category: 'createdAt', operator: 'is', value: 'today' }],
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
            }}
          />
        </div>
      </Container>
    </ThemeProvider>
  )
}

export default ReorderableComponentList
