import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Divider,
  Flex,
  Stack,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { orderBy } from 'lodash';
import { ReactElement, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import {
  GET_SIDEBAR,
  SET_AREA_OF_PROJECT,
  SET_AREA_ORDER,
  SET_PROJECT_ORDER,
  SidebarData,
} from 'renderer/queries';
import { v4 as uuidv4 } from 'uuid';
import { Area, Project, View } from '../../main/resolvers-types';
import { IconType } from '../interfaces';
import { AppState, useBoundStore } from '../state';
import { SidebarAddAreaButton } from './SidebarAddAreaButton';
import { SidebarAddProjectButton } from './SidebarAddProjectButton';
import SidebarDraggableItem from './SidebarDraggableItem';
import SidebarDroppableItem from './SidebarDroppableItem';
import SidebarItem from './SidebarItem';
import SidebarSection from './SidebarSection';
import SidebarToggleButton from './SidebarToggleButton';

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
];

const Sidebar = (): ReactElement => {
  const { colorMode } = useColorMode();
  const { loading, error, data } = useQuery<SidebarData>(GET_SIDEBAR);
  const [setProjectOrder] = useMutation(SET_PROJECT_ORDER, {
    refetchQueries: [GET_SIDEBAR],
  });
  const [setAreaOrder] = useMutation(SET_AREA_ORDER, {
    refetchQueries: [GET_SIDEBAR],
  });
  const [setAreaOfProject] = useMutation(SET_AREA_OF_PROJECT);
  const [sortedAreas, setSortedAreas] = useState<Area[]>([]);
  const [sortedProjects, setSortedProjects] = useState<Project[]>([]);
  const [sortedViews, setSortedViews] = useState<View[]>([]);
  const [sidebarVisible] = useBoundStore((state: AppState) => [
    state.sidebarVisible,
    state.setSidebarVisible,
  ]);

  useEffect(() => {
    if (loading === false && data) {
      setSortedAreas(
        orderBy(data.areas, ['sortOrder.sortOrder'], ['asc']).filter(
          (a) => a.deleted === false
        )
      );
      setSortedProjects(
        orderBy(data.projects, ['sortOrder.sortOrder'], ['asc']).filter(
          (p) => p.deleted === false
        )
      );

      setSortedViews(
        orderBy(data.views, ['sortOrder.sortOrder'], ['asc']).filter(
          (v) => v.type !== 'default'
        )
      );
    }
  }, [loading, data]);

  // TODO: Loading and error states
  if (loading) return <></>;
  if (error) {
    console.log(error);
    return <></>;
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (type === 'PROJECT') {
      const areaKey = destination.droppableId;
      //  Trying to detect drops in non-valid areas

      // Do nothing if it was a drop to the same place
      if (destination.index === source.index) return;

      // Project Order is harder as the index is based on the area
      const projectAtDestination = sortedProjects[destination.index];
      const projectAtSource = sortedProjects[source.index];
      // If there's no projects in the area
      if (!projectAtDestination) {
        return;
      }

      // Sync update
      const newSortedProjects = sortedProjects;
      newSortedProjects.splice(source.index, 1);
      newSortedProjects.splice(destination.index, 0, projectAtSource);
      setSortedProjects(newSortedProjects);

      // Async update
      setAreaOfProject({
        variables: { key: draggableId, areaKey },
      });

      setProjectOrder({
        variables: {
          projectKey: draggableId,
          sortOrder: projectAtDestination?.sortOrder?.sortOrder,
        },
      });
    }
    if (type === 'AREA') {
      // Project Order is harder as the index is based on the area
      const areaAtDestination = sortedAreas[destination.index];
      const areaAtSource = sortedAreas[source.index];

      // Sync update
      const newSortedAreas = sortedAreas;
      newSortedAreas.splice(source.index, 1);
      newSortedAreas.splice(destination.index, 0, areaAtSource);
      setSortedAreas(newSortedAreas);

      // async update
      setAreaOrder({
        variables: {
          areaKey: draggableId,
          sortOrder: areaAtDestination?.sortOrder?.sortOrder,
        },
      });
    }
  };

  return (
    <Flex
      zIndex={50}
      alignItems={sidebarVisible ? 'none' : 'center'}
      direction="column"
      justifyContent="space-between"
      transition="all 0.2s ease-in-out"
      w={sidebarVisible ? '250px' : '50px'}
      minW={sidebarVisible ? '250px' : '50px'}
      height="100%"
      py={2}
      px={sidebarVisible ? 2 : 0.5}
      bg="gray.800"
      shadow="lg"
      data-cy="sidebar-container"
      m={0}
      overflowY="scroll"
      border="none"
      borderRight="1px solid"
      borderColor={colorMode === 'light' ? 'transparent' : 'gray.900'}
      sx={{ scrollbarWidth: 'thin' }}
    >
      <VStack spacing={0} w="100%">
        <SidebarSection
          name="Views"
          iconName="view"
          sidebarVisible={sidebarVisible}
        />
        <VStack spacing={0.5} w="100%">
          {defaultViews.map((d) => {
            return (
              <SidebarItem
                key={d.text}
                iconName={d.iconName}
                text={d.text}
                path={d.path}
                variant="defaultView"
                type="project"
              />
            );
          })}
          {sortedViews
            .filter((v) => v.type != 'project' && v.type != 'area')
            .map((view) => {
              return (
                <SidebarItem
                  variant="defaultView"
                  key={`sidebarItem-${view.key}`}
                  iconName={view.icon as IconType}
                  text={view.name}
                  path={`/views/${view.key}`}
                  type="project"
                />
              );
            })}
        </VStack>
        <SidebarSection
          name="Areas"
          iconName="area"
          sidebarVisible={sidebarVisible}
        />
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId={'areas'} type="AREA">
            {(provided, snapshot) => (
              <SidebarDroppableItem provided={provided} snapshot={snapshot}>
                {sortedAreas.map((a, idx) => (
                  <Draggable
                    key={`draggable-${a.key}`}
                    draggableId={a.key}
                    index={idx}
                  >
                    {(draggableProvided, draggableSnapshot) => (
                      <SidebarDraggableItem
                        provided={draggableProvided}
                        snapshot={draggableSnapshot}
                      >
                        {!sidebarVisible && <Divider my={1} bg="gray.100" />}
                        <Flex alignItems="center">
                          <SidebarItem
                            key={`sidebar-item-${uuidv4()}`}
                            type="area"
                            variant="customView"
                            text={a.name ?? ''}
                            emoji={a.emoji ?? ''}
                            path={`/areas/${a.key}`}
                          />

                          {sidebarVisible && !snapshot.isDraggingOver && (
                            <SidebarAddProjectButton areaKey={a.key} />
                          )}
                        </Flex>

                        <Droppable droppableId={a.key} type="PROJECT">
                          {(provided, snapshot) => (
                            <SidebarDroppableItem
                              key={`droppable-${a.key}`}
                              snapshot={snapshot}
                              provided={provided}
                            >
                              {sortedProjects.map((p, idx) => {
                                // Don't display inbox or projects not in this area
                                // NB: This is intentionally filtered here as the logic for re-ordering needs indices this way
                                if (p.key === '0' || p?.area?.key !== a.key) {
                                  return <></>;
                                }
                                const pathName = `/views/${p.key}`;
                                return (
                                  <Draggable
                                    key={`${a.key}-${p.key}`}
                                    draggableId={`${p.key}`}
                                    index={idx}
                                  >
                                    {(provided, snapshot) => (
                                      <SidebarDraggableItem
                                        snapshot={snapshot}
                                        provided={provided}
                                      >
                                        <Box px={sidebarVisible ? 2 : 0}>
                                          <SidebarItem
                                            key={`draggablesidebaritem-${uuidv4()}`}
                                            type="project"
                                            variant="customView"
                                            text={p.name}
                                            emoji={p.emoji ?? undefined}
                                            path={pathName}
                                          />
                                        </Box>
                                      </SidebarDraggableItem>
                                    )}
                                  </Draggable>
                                );
                              })}
                            </SidebarDroppableItem>
                          )}
                        </Droppable>
                      </SidebarDraggableItem>
                    )}
                  </Draggable>
                ))}

                {sidebarVisible && !snapshot.isDraggingOver && (
                  <SidebarAddAreaButton />
                )}
              </SidebarDroppableItem>
            )}
          </Droppable>
        </DragDropContext>
      </VStack>
      <Stack
        justifyContent="space-between"
        w="100%"
        my={2}
        direction={sidebarVisible ? 'row' : 'column'}
      >
        {!sidebarVisible && <Divider py={1} />}
        <Flex alignItems="center">
          <SidebarItem
            variant="defaultView"
            iconName="settings"
            text="Settings"
            path="/settings"
            type="project"
          />
        </Flex>
        <SidebarToggleButton />
      </Stack>
    </Flex>
  );
};

export default Sidebar;
