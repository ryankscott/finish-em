import { useMutation, useQuery } from '@apollo/client';
import { orderBy } from 'lodash';
import { ReactElement, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  useColorMode,
  Icon,
} from '@chakra-ui/react';
import {
  ADD_COMPONENT,
  GET_COMPONENTS_BY_VIEW,
  SET_COMPONENT_ORDER,
} from 'renderer/queries';
import { Component } from 'main/resolvers-types';
import { Icons } from '../assets/icons';
import ComponentActions from './ComponentActions';
import FilteredItemList from './FilteredItemList';
import ItemCreator from './ItemCreator';
import Spinner from './Spinner';
import ViewHeader from './ViewHeader';

type ReorderableComponentListProps = {
  viewKey: string;
};

const ReorderableComponentList = ({
  viewKey,
}: ReorderableComponentListProps): ReactElement => {
  const { colorMode } = useColorMode();
  const { loading, error, data } = useQuery(GET_COMPONENTS_BY_VIEW, {
    variables: { viewKey },
    fetchPolicy: 'no-cache',
  });
  const [addComponent] = useMutation(ADD_COMPONENT, {
    refetchQueries: [GET_COMPONENTS_BY_VIEW],
  });
  const [setComponentOrder] = useMutation(SET_COMPONENT_ORDER);
  const [sortedComponents, setSortedComponents] = useState<Component[] | []>(
    []
  );

  useEffect(() => {
    if (loading === false && data) {
      setSortedComponents(
        orderBy(data.componentsByView, ['sortOrder.sortOrder'], ['asc'])
      );
    }
  }, [loading, data]);

  if (loading) {
    return (
      <Flex h="100%" w="100%" justifyContent="center" alignContent="center">
        <Spinner />
      </Flex>
    );
  }
  if (error) {
    console.log(error);
    return <></>;
  }

  const componentSwitch = (params, comp, provided) => {
    switch (comp.type) {
      case 'FilteredItemList':
        return (
          <FilteredItemList
            {...params}
            componentKey={comp.key}
            key={comp.key}
          />
        );
      case 'ViewHeader':
        return (
          <ViewHeader
            dragHandle={provided.dragHandleProps}
            key={comp.key}
            componentKey={comp.key}
            id={comp.key}
            {...params}
          />
        );
      case 'ItemCreator':
        return (
          <ItemCreator componentKey={comp.key} key={comp.key} {...params} />
        );
      default:
        return <></>;
    }
  };

  return (
    <Flex
      direction="column"
      justifyContent="flex-end"
      w="100%"
      my={3}
      mx={0}
      mt={6}
    >
      <DragDropContext
        onDragEnd={(result: DropResult) => {
          const { destination, source, draggableId, type } = result;

          //  Trying to detect drops in non-valid areas
          if (!destination) {
            return;
          }
          // Do nothing if it was a drop to the same place
          if (destination.index === source.index) return;

          const componentAtDestination = sortedComponents[destination.index];
          const componentAtSource = sortedComponents[source.index];

          // Sync update
          const newSortedComponents = sortedComponents;
          newSortedComponents.splice(source.index, 1);
          newSortedComponents.splice(destination.index, 0, componentAtSource);
          setSortedComponents(newSortedComponents);

          // Async update
          setComponentOrder({
            variables: {
              componentKey: draggableId,
              sortOrder: componentAtDestination.sortOrder.sortOrder,
            },
          });
        }}
      >
        <Droppable droppableId={uuidv4()} type="COMPONENT">
          {(provided, snapshot) => (
            <Flex
              direction="column"
              justifyContent="center"
              bg="inherit"
              w="100%"
              m={0}
              py={snapshot.isDraggingOver ? 18 : 3}
              px={3}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {sortedComponents.map((comp, index) => {
                if (comp.location === 'main') {
                  try {
                    const params = JSON.parse(comp?.parameters);
                    return (
                      <Draggable
                        key={comp.key}
                        draggableId={comp.key}
                        index={index}
                        isDragDisabled={false}
                        _hover={{
                          shadow: 'sm',
                        }}
                      >
                        {(provided, snapshot) => (
                          <Flex
                            position="relative"
                            flexDirection="column"
                            height="auto"
                            userSelect="none"
                            p={0}
                            m={0}
                            borderRadius="md"
                            mb={8}
                            border="1px solid"
                            borderColor={
                              snapshot.isDragging ? 'gray.200' : 'transparent'
                            }
                            bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
                            shadow={snapshot.isDragging ? 'md' : 'none'}
                            ref={provided.innerRef}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...provided.draggableProps}
                            key={`container-${comp.key}`}
                          >
                            <Flex
                              position="absolute"
                              direction="row"
                              justifyContent="center"
                              alignItems="center"
                              h={6}
                              top={0}
                              w="100%"
                              zIndex={100}
                              borderTopLeftRadius={'md'}
                              borderTopRightRadius={'md'}
                              opacity={0}
                              borderColor={
                                colorMode === 'light' ? 'gray.200' : 'gray.700'
                              }
                              _active={{
                                opacity: 0.6,
                                bg:
                                  colorMode === 'light'
                                    ? 'gray.100'
                                    : 'gray.900',
                              }}
                              _hover={{
                                opacity: 0.6,
                                bg:
                                  colorMode === 'light'
                                    ? 'gray.100'
                                    : 'gray.900',
                              }}
                              // eslint-disable-next-line react/jsx-props-no-spreading
                              {...provided.dragHandleProps}
                            >
                              <Icon as={Icons.drag} opacity={1} />
                            </Flex>
                            <ComponentActions
                              readOnly={false}
                              componentKey={comp.key}
                            >
                              {componentSwitch(params, comp, provided)}
                            </ComponentActions>
                          </Flex>
                        )}
                      </Draggable>
                    );
                  } catch (e) {
                    console.log(
                      `Failed to parse parameters of sortedComponent - ${comp.key}, with error - ${e}`
                    );
                  }
                }
              })}
            </Flex>
          )}
        </Droppable>
      </DragDropContext>

      {/* TODO extract to a component */}
      <Flex w="100%" position="relative" justifyContent="center" pb={6}>
        <Menu
          placement="bottom"
          gutter={0}
          arrowPadding={0}
          closeOnSelect
          closeOnBlur
        >
          <MenuButton
            size="md"
            as={Button}
            rightIcon={<Icon as={Icons.collapse} />}
            borderRadius="md"
            variant="default"
            textAlign="start"
          >
            Add component
          </MenuButton>
          <MenuList>
            <MenuItem
              onClick={() => {
                addComponent({
                  variables: {
                    input: {
                      key: uuidv4(),
                      viewKey,
                      type: 'FilteredItemList',
                      location: 'main',
                      parameters: {
                        filter: JSON.stringify({
                          combinator: 'and',
                          rules: [
                            {
                              combinator: 'and',
                              rules: [
                                {
                                  field: 'projectKey',
                                  operator: '=',
                                  valueSource: 'value',
                                  value: data.view.key,
                                },
                                {
                                  field: 'deleted',
                                  operator: '=',
                                  valueSource: 'value',
                                  value: false,
                                },
                                {
                                  field: 'areaKey',
                                  operator: 'null',
                                  valueSource: 'value',
                                  value: '0',
                                },
                              ],
                              not: false,
                            },
                          ],
                          not: false,
                        }),
                        hiddenIcons: [],
                        isFilterable: true,
                        listName: 'Todo',
                        flattenSubtasks: true,
                        showCompletedToggle: true,
                        initiallyExpanded: true,
                      },
                    },
                  },
                });
              }}
            >
              Item list
            </MenuItem>
            <MenuItem
              onClick={() => {
                addComponent({
                  variables: {
                    input: {
                      key: uuidv4(),
                      viewKey,
                      type: 'ViewHeader',
                      location: 'main',
                      parameters: {
                        name: data.view.name,
                        icon: 'view',
                      },
                    },
                  },
                });
              }}
            >
              Header
            </MenuItem>
            <MenuItem
              onClick={() => {
                addComponent({
                  variables: {
                    input: {
                      key: uuidv4(),
                      viewKey,
                      type: 'ItemCreator',
                      location: 'main',
                      parameters: {
                        initiallyExpanded: false,
                      },
                    },
                  },
                });
              }}
            >
              Item creator
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Flex>
  );
};

export default ReorderableComponentList;
