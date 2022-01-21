import { useMutation, useQuery } from '@apollo/client';
import {
  Divider,
  Flex,
  Stack,
  useTheme,
  VStack,
  useColorMode,
  Box,
  IconButton,
} from '@chakra-ui/react';
import { convertSVGElementToReact, Icons } from '../assets/icons';
import { orderBy } from 'lodash';
import { ReactElement, useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { sidebarVisibleVar } from '../index';
import { IconType } from '../interfaces';
import { getProductName } from '../utils';
import Button from './Button';
import SidebarDraggableItem from './SidebarDraggableItem';
import SidebarDroppableItem from './SidebarDroppableItem';
import SidebarItem from './SidebarItem';
import SidebarSection from './SidebarSection';
import {
  CREATE_AREA,
  CREATE_PROJECT,
  GET_SIDEBAR,
  SET_AREA_OF_PROJECT,
  SET_AREA_ORDER,
  SET_PROJECT_ORDER,
  SidebarData,
} from 'renderer/queries';
import { Area, Project, View } from 'main/generated/typescript-helpers';

const Sidebar = (): ReactElement => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { colorMode } = useColorMode();
  const { loading, error, data } = useQuery<SidebarData>(GET_SIDEBAR);
  const [setProjectOrder] = useMutation(SET_PROJECT_ORDER);
  const [setAreaOrder] = useMutation(SET_AREA_ORDER);
  const [setAreaOfProject] = useMutation(SET_AREA_OF_PROJECT);
  const [createProject] = useMutation(CREATE_PROJECT);
  const [createArea] = useMutation(CREATE_AREA, {
    refetchQueries: ['GetSidebarData'],
  });
  const [sortedAreas, setSortedAreas] = useState<Area[]>([]);
  const [sortedProjects, setSortedProjects] = useState<Project[]>([]);
  const [sortedViews, setSortedViews] = useState<View[]>([]);
  const sidebarVisible = data?.sidebarVisible;

  useEffect(() => {
    if (loading === false && data) {
      setSortedAreas(
        orderBy(data.areas, ['sortOrder.sortOrder'], ['asc']).filter(
          (a) => a.deleted == false
        )
      );
      setSortedProjects(
        orderBy(data.projects, ['sortOrder.sortOrder'], ['asc'])
      );

      setSortedViews(
        orderBy(data.views, ['sortOrder.sortOrder'], ['asc']).filter(
          (v) => v.type != 'default'
        )
      );
    }
  }, [loading, data]);

  // TODO: Loading and error states
  if (loading) return <></>;
  if (error) return <></>;

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

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (type == 'PROJECT') {
      if (!destination) {
        return;
      }
      const areaKey = destination.droppableId;
      //  Trying to detect drops in non-valid areas

      // Do nothing if it was a drop to the same place
      if (destination.index == source.index) return;

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
        variables: { key: draggableId, areaKey: areaKey },
      });

      setProjectOrder({
        variables: {
          projectKey: draggableId,
          sortOrder: projectAtDestination.sortOrder.sortOrder,
        },
      });
    }
    if (type == 'AREA') {
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
          sortOrder: areaAtDestination.sortOrder.sortOrder,
        },
      });
    }
  };

  return (
    <Flex
      zIndex={50}
      alignItems={sidebarVisible ? 'none' : 'center'}
      direction={'column'}
      justifyContent={'space-between'}
      transition={'all 0.2s ease-in-out'}
      w={sidebarVisible ? '250px' : '50px'}
      minW={sidebarVisible ? '250px' : '50px'}
      height={'100%'}
      p={2}
      bg={'gray.800'}
      shadow={'lg'}
      data-cy="sidebar-container"
      m={0}
      overflowY={'scroll'}
      border={'none'}
      borderRight={colorMode == 'light' ? 'none' : '1px solid'}
      borderColor={colorMode == 'light' ? 'transparent' : 'gray.900'}
      sx={{ scrollbarWidth: 'thin' }}
    >
      <VStack spacing={0} w={'100%'}>
        <SidebarSection
          name="Views"
          iconName="view"
          sidebarVisible={sidebarVisible}
        />
        <VStack spacing={0} w={'100%'}>
          {defaultViews.map((d) => {
            return (
              <SidebarItem
                key={d.path}
                sidebarVisible={sidebarVisible}
                iconName={d.iconName}
                text={d.text}
                activeColour={theme.colors.gray[900]}
                path={d.path}
                variant="defaultView"
              />
            );
          })}
          {sortedViews.map((view) => {
            if (view.type == 'project' || view.type == 'area') return null;
            return (
              <SidebarItem
                variant={'defaultView'}
                key={'sidebarItem-' + view.key}
                sidebarVisible={sidebarVisible}
                iconName={view.icon}
                text={view.name}
                path={`/views/${view.key}`}
                activeColour={theme.colors.gray[900]}
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
          <Droppable droppableId={uuidv4()} type="AREA">
            {(provided, snapshot) => (
              <SidebarDroppableItem
                sidebarVisible={sidebarVisible}
                provided={provided}
                snapshot={snapshot}
              >
                {sortedAreas.map((a, index) => {
                  return (
                    <Draggable
                      key={'draggable-' + a.key}
                      draggableId={a.key}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <SidebarDraggableItem
                          key={'draggable-' + a.key}
                          sidebarVisible={sidebarVisible}
                          snapshot={snapshot}
                          provided={provided}
                        >
                          {!sidebarVisible && <Divider />}
                          <Flex
                            direction={'row'}
                            justifyContent={'space-between'}
                            py={1}
                            px={0}
                            alignItems={'center'}
                          >
                            <SidebarItem
                              variant="customView"
                              sidebarVisible={sidebarVisible}
                              text={a.name ?? ''}
                              emoji={a.emoji ?? ''}
                              path={`/areas/${a.key}`}
                              activeColour={theme.colors.gray[900]}
                            />
                            {sidebarVisible && (
                              <Button
                                size="md"
                                tooltipText="Add Project"
                                variant="invert"
                                icon="add"
                                iconColour={'white'}
                                onClick={() => {
                                  const projectKey = uuidv4();
                                  createProject({
                                    variables: {
                                      key: projectKey,
                                      name: getProductName(),
                                      description: '',
                                      startAt: null,
                                      endAt: null,
                                      areaKey: a.key,
                                    },
                                  });
                                  navigate('/views/' + projectKey);
                                }}
                              />
                            )}
                          </Flex>

                          <Droppable
                            key={a.key}
                            droppableId={a.key}
                            type="PROJECT"
                          >
                            {(provided, snapshot) => (
                              <SidebarDroppableItem
                                sidebarVisible={sidebarVisible}
                                snapshot={snapshot}
                                provided={provided}
                              >
                                <Box px={1}>
                                  {sortedProjects.map((p, index) => {
                                    // Don't render the inbox here
                                    if (p.key == '0') return;
                                    const pathName = '/views/' + p.key;
                                    // Don't render projects not part of this area
                                    if (p.area.key != a.key) return;
                                    return (
                                      <Draggable
                                        key={p.key}
                                        draggableId={p.key}
                                        index={index}
                                      >
                                        {(provided, snapshot) => (
                                          <SidebarDraggableItem
                                            key={'draggable-' + p.key}
                                            sidebarVisible={sidebarVisible}
                                            snapshot={snapshot}
                                            provided={provided}
                                          >
                                            <SidebarItem
                                              variant="customView"
                                              sidebarVisible={sidebarVisible}
                                              text={p.name}
                                              emoji={p.emoji}
                                              path={pathName}
                                              activeColour={
                                                theme.colors.gray[900]
                                              }
                                            />
                                          </SidebarDraggableItem>
                                        )}
                                      </Draggable>
                                    );
                                  })}
                                  {provided.placeholder}
                                </Box>
                              </SidebarDroppableItem>
                            )}
                          </Droppable>
                        </SidebarDraggableItem>
                      )}
                    </Draggable>
                  );
                })}
              </SidebarDroppableItem>
            )}
          </Droppable>
        </DragDropContext>
        {sidebarVisible && (
          <Flex
            key={uuidv4()}
            mt={4}
            w={'100%'}
            justifyContent={'center'}
            bg={'gray.800'}
          >
            <Button
              key={uuidv4()}
              tooltipText="Add Area"
              variant="invert"
              size="md"
              text={sidebarVisible ? 'Add Area' : ''}
              iconSize="12px"
              icon="add"
              iconPosition="right"
              onClick={() => {
                const areaKey = uuidv4();
                createArea({
                  variables: {
                    key: areaKey,
                    name: getProductName(),
                    description: '',
                  },
                });
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
        direction={sidebarVisible ? 'row' : 'column'}
      >
        {!sidebarVisible && <Divider />}
        <Flex key={uuidv4()} alignItems={'center'}>
          <SidebarItem
            variant="defaultView"
            key={uuidv4()}
            sidebarVisible={sidebarVisible}
            iconName={'settings'}
            text={'Settings'}
            path="/settings"
            activeColour={theme.colors.gray[900]}
          />
        </Flex>
        <Flex
          position="absolute"
          bottom="5px"
          left={sidebarVisible ? '227px' : '37px'}
          key={uuidv4()}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <IconButton
            colorScheme="blue"
            aria-label={'Toggle sidebar'}
            borderRadius="50%"
            shadow="md"
            key={uuidv4()}
            icon={
              sidebarVisible
                ? convertSVGElementToReact(Icons['slideLeft']())
                : convertSVGElementToReact(Icons['slideRight']())
            }
            size={'sm'}
            transition={'all 0.2s ease-in-out'}
            onClick={() => {
              sidebarVisibleVar(!sidebarVisible);
            }}
            iconSize="18px"
          />
        </Flex>
      </Stack>
    </Flex>
  );
};

export default Sidebar;
