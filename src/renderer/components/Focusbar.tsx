import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import {
  Box,
  Flex,
  FlexProps,
  Grid,
  GridItem,
  Text,
  useColorMode,
  Tooltip,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { parseISO } from 'date-fns';
import { ReactElement } from 'react';
import {
  GET_ITEM_BY_KEY,
  RENAME_ITEM,
  COMPLETE_ITEM,
  SET_AREA,
  SET_PROJECT,
  UNCOMPLETE_ITEM,
  SET_SCHEDULED_AT,
  SET_DUE_AT,
  SET_REPEAT,
  SET_PARENT,
  SET_LABEL,
  DELETE_ITEM,
  RESTORE_ITEM,
} from 'renderer/queries';
import RRule from 'rrule';
import { activeItemVar, focusbarVisibleVar } from '..';
import { Item as ItemType } from '../../main/generated/typescript-helpers';
import { convertSVGElementToReact, Icons } from '../assets/icons';
import { IconType } from '../interfaces';
import { ItemIcons } from '../interfaces/item';
import { formatRelativeDate } from '../utils';
import AreaSelect from './AreaSelect';
import ItemSelect from './ItemSelect';
import DatePicker from './DatePicker';
import EditableText2 from './EditableText2';
import Item from './Item';
import ItemCreator from './ItemCreator';
import LabelSelect from './LabelSelect';
import ProjectSelect from './ProjectSelect';
import RepeatPicker from './RepeatPicker';

const Focusbar = (): ReactElement => {
  const { colorMode } = useColorMode();
  const activeItem = useReactiveVar(activeItemVar);
  const focusbarVisible = useReactiveVar(focusbarVisibleVar);
  const { loading, error, data } = useQuery(GET_ITEM_BY_KEY, {
    variables: {
      key: activeItem.length ? activeItem[0] : '',
    },
  });

  const [renameItem] = useMutation(RENAME_ITEM);
  const [completeItem] = useMutation(COMPLETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [setProject] = useMutation(SET_PROJECT, {
    refetchQueries: ['itemsByFilter'],
  });
  const [setArea] = useMutation(SET_AREA, {
    refetchQueries: ['itemsByFilter, itemByKey'],
  });
  const [setScheduledAt] = useMutation(SET_SCHEDULED_AT, {
    refetchQueries: ['itemsByFilter', 'weeklyItems'],
  });
  const [setDueAt] = useMutation(SET_DUE_AT, {
    refetchQueries: ['itemsByFilter'],
  });
  const [setRepeat] = useMutation(SET_REPEAT, {
    refetchQueries: ['itemsByFilter'],
  });
  const [setParent] = useMutation(SET_PARENT, {
    refetchQueries: ['itemsByFilter'],
  });
  const [setLabel] = useMutation(SET_LABEL, {
    refetchQueries: ['itemsByFilter'],
  });
  const [deleteItem] = useMutation(DELETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [restoreItem] = useMutation(RESTORE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });

  if (error) {
    console.log(error);
    return <></>;
  }

  if (loading) {
    return (
      <Flex
        direction="column"
        border="1px solid"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        shadow="md"
        minW={focusbarVisible ? '350px' : 0}
        opacity={focusbarVisible ? 1 : 0}
        px={3}
        py={3}
        h="100%"
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
        transition="all 0.2s ease-in-out"
      />
    );
  }

  const item: ItemType = data?.item;
  if (!item) return <></>;

  // TODO: Refactor me
  const AttributeContainer = (props: FlexProps) => (
    <Flex
      justifyContent="space-between"
      width="100%"
      minW="180px"
      px={4}
      my={1}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );

  const SidebarTitle = ({ text, icon }: { text: string; icon: IconType }) => (
    <Flex minW="100px" alignItems="center">
      {convertSVGElementToReact(Icons[icon]())}
      <Text fontSize="md" pl={1}>
        {text}
      </Text>
    </Flex>
  );

  // TODO: Do I need these? Or can I move to the component
  const dueDate = item?.dueAt
    ? formatRelativeDate(parseISO(item?.dueAt))
    : 'Add due date';
  const scheduledDate = item?.scheduledAt
    ? formatRelativeDate(parseISO(item?.scheduledAt))
    : 'Add scheduled date';

  return (
    <Flex
      direction="column"
      border="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
      shadow="md"
      w={focusbarVisible ? '350px' : 0}
      minW={focusbarVisible ? '350px' : 0}
      opacity={focusbarVisible ? 1 : 0}
      px={3}
      py={3}
      h="100%"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      transition="all 0.2s ease-in-out"
    >
      <Grid templateColumns="repeat(5, 1fr)" width="100%" m={0} p={0}>
        {item?.parent && (
          <GridItem colSpan={1}>
            <Tooltip label="Up level">
              <IconButton
                aria-label="up"
                variant="default"
                size="sm"
                onClick={() => {
                  if (item?.parent) {
                    activeItemVar([item?.parent?.key]);
                  }
                }}
                icon={
                  <Icon p={0} m={0}>
                    {Icons.upLevel('24px', '24px')}
                  </Icon>
                }
              />
            </Tooltip>
          </GridItem>
        )}
        <GridItem colStart={5} colSpan={1}>
          <Flex justifyContent="flex-end">
            <IconButton
              aria-label="close"
              variant="default"
              size="sm"
              onClick={() => focusbarVisibleVar(false)}
              icon={
                <Icon p={0} m={0}>
                  {Icons.close('24px', '24px')}
                </Icon>
              }
            />
          </Flex>
        </GridItem>
      </Grid>
      <Flex alignItems="baseline" w="100%" direction="row" m={0} px={2} py={4}>
        <IconButton
          size="md"
          aria-label="toggle-complete"
          disabled={item?.deleted ?? false}
          variant="default"
          onClick={() => {
            if (item.completed) {
              unCompleteItem({ variables: { key: item.key } });
            }
            completeItem({ variables: { key: item.key } });
          }}
          icon={
            <Icon p={0} m={0}>
              {item?.completed
                ? Icons.todoChecked(
                    '24px',
                    '24px',
                    item.label ? item.label.colour : undefined
                  )
                : Icons.todoUnchecked(
                    '24px',
                    '24px',
                    item.label ? item.label.colour : undefined
                  )}
            </Icon>
          }
        />
        <Box
          w="100%"
          textDecoration={item?.completed ? 'line-through' : 'inherit'}
        >
          <EditableText2
            readOnly={item.deleted ?? false}
            key={item?.key}
            height="45px"
            width="260px"
            input={item.text ?? ''}
            singleLine
            shouldClearOnSubmit={false}
            shouldSubmitOnBlur
            hideToolbar={false}
            onUpdate={(text) => {
              renameItem({ variables: { key: item.key, text } });
            }}
          />
        </Box>
        {item.deleted ? (
          <Tooltip label="Restore">
            <IconButton
              aria-label="restore"
              variant="default"
              icon={
                <Icon p={0} m={0}>
                  {Icons.restore('24px', '24px')}
                </Icon>
              }
              size="sm"
              onClick={() => {
                restoreItem({ variables: { key: item.key } });
              }}
            />
          </Tooltip>
        ) : (
          <Tooltip label="delete">
            <IconButton
              variant="default"
              aria-label="delete"
              icon={
                <Icon p={0} m={0}>
                  {Icons.trash('24px', '24px')}
                </Icon>
              }
              size="sm"
              onClick={() => {
                deleteItem({ variables: { key: item.key } });
              }}
            />
          </Tooltip>
        )}
      </Flex>
      {item.project?.key === '0' && (
        <AttributeContainer>
          <SidebarTitle icon="area" text="Area: " />
          <AreaSelect
            currentArea={item.area ?? null}
            completed={item.completed ?? false}
            deleted={item.deleted ?? false}
            onSubmit={(areaKey) => {
              setArea({ variables: { key: item.key, areaKey } });
            }}
          />
        </AttributeContainer>
      )}
      <AttributeContainer>
        <SidebarTitle icon="project" text="Project: " />
        <ProjectSelect
          currentProject={item.project ?? null}
          deleted={item.deleted ?? false}
          completed={item.completed ?? false}
          onSubmit={(projectKey: string) => {
            setProject({
              variables: {
                key: item.key,
                projectKey,
              },
            });
          }}
        />
      </AttributeContainer>
      {item.type === 'TODO' && (
        <>
          <AttributeContainer>
            <SidebarTitle icon="scheduled" text="Scheduled: " />
            <DatePicker
              key={`sd${item.key}`}
              defaultText="Scheduled at: "
              onSubmit={(d: Date | null) => {
                setScheduledAt({
                  variables: { key: item.key, scheduledAt: d },
                });
              }}
              text={scheduledDate}
              completed={item.completed ?? false}
              deleted={item.deleted ?? false}
            />
          </AttributeContainer>
          <AttributeContainer>
            <SidebarTitle icon="due" text="Due: " />
            <DatePicker
              key={`dd${item.key}`}
              defaultText="Due at: "
              onSubmit={(d: Date | null) =>
                setDueAt({ variables: { key: item.key, dueAt: d } })
              }
              text={dueDate}
              completed={item.completed ?? false}
              deleted={item.deleted ?? false}
            />
          </AttributeContainer>
          <AttributeContainer>
            <SidebarTitle icon="repeat" text="Repeating: " />
            <RepeatPicker
              repeat={
                item.repeat && item.repeat !== 'undefined'
                  ? RRule.fromString(item.repeat)
                  : null
              }
              completed={item.completed ?? false}
              deleted={item.deleted ?? false}
              key={`rp${item.key}`}
              onSubmit={(r: RRule) =>
                setRepeat({
                  variables: { key: item.key, repeat: r?.toString() },
                })
              }
            />
          </AttributeContainer>
        </>
      )}
      {item.children?.length === 0 && (
        <AttributeContainer>
          <SidebarTitle icon="subtask" text="Parent: " />
          <ItemSelect
            currentItem={item}
            completed={item.completed ?? false}
            deleted={item.deleted ?? false}
            onSubmit={(itemKey: string) =>
              setParent({ variables: { key: item.key, parentKey: itemKey } })
            }
          />
        </AttributeContainer>
      )}
      <AttributeContainer>
        <SidebarTitle icon="label" text="Label: " />
        <LabelSelect
          currentLabel={item.label ?? null}
          completed={item.completed ?? false}
          deleted={item.deleted ?? false}
          onSubmit={(labelKey) => {
            setLabel({ variables: { key: item.key, labelKey } });
          }}
        />
      </AttributeContainer>
      {item.deleted && (
        <AttributeContainer>
          <SidebarTitle icon="trash" text="Deleted at: " />
          <Text fontSize="md" m={1} py={2} px={3}>
            {formatRelativeDate(parseISO(item?.deletedAt))}
          </Text>
        </AttributeContainer>
      )}
      {item.completed && (
        <AttributeContainer>
          <SidebarTitle icon="todoChecked" text="Completed at: " />
          <Text fontSize="md" m={1} py={2} px={3}>
            {formatRelativeDate(parseISO(item?.completedAt))}
          </Text>
        </AttributeContainer>
      )}

      {item.parent?.key == null && item.type === 'TODO' && (
        <>
          <Flex pt={6} pb={2} alignItems="baseline">
            <Text fontSize="lg" px={2}>
              Subtasks
            </Text>
            {item.children && item.children?.length > 0 && (
              <Text fontSize="sm" color="gray.600">
                {item.children.length} items
              </Text>
            )}
          </Flex>
          {item.children && item.children?.length > 0 ? (
            <Box
              overflow="scroll"
              py={0}
              px={2}
              w="100%"
              key={`box-${item.key}`}
            >
              {item.children?.map((childItem) => {
                if (!childItem) return <></>;
                return (
                  <Item
                    compact={false}
                    key={childItem.key}
                    componentKey=""
                    itemKey={childItem.key}
                    shouldIndent={false}
                    hiddenIcons={[ItemIcons.Project, ItemIcons.Subtask]}
                  />
                );
              })}
            </Box>
          ) : (
            <Text fontSize="md" pl={4} py={2} color="gray.600">
              No subtasks
            </Text>
          )}
          <ItemCreator
            key={`${item.key}-subtask`}
            parentKey={item.key}
            initiallyExpanded={false}
          />
        </>
      )}
    </Flex>
  );
};

export default Focusbar;
