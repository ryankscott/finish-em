import { gql, useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  useColorMode,
  VStack,
} from '@chakra-ui/react';
import { parseISO } from 'date-fns';
import React, { ReactElement } from 'react';
import RRule from 'rrule';
import { activeItemVar, focusbarVisibleVar } from '..';
import { Item as ItemType } from '../../main/generated/typescript-helpers';
import { Icons } from '../assets/icons';
import { IconType } from '../interfaces';
import { ItemIcons } from '../interfaces/item';
import { formatRelativeDate } from '../utils';
import AttributeSelect from './AttributeSelect';
import Button from './Button';
import DatePicker from './DatePicker';
import EditableText2 from './EditableText2';
import Item from './Item';
import ItemCreator from './ItemCreator';
import RepeatPicker from './RepeatPicker';

const GET_DATA = gql`
  query itemByKey($key: String!) {
    item: item(key: $key) {
      key
      type
      text
      deleted
      completed
      dueAt
      scheduledAt
      lastUpdatedAt
      completedAt
      createdAt
      deletedAt
      repeat
      area {
        key
        name
      }
      reminders {
        remindAt
      }
      label {
        key
        name
        colour
      }
      project {
        key
        name
      }
      parent {
        key
        text
      }
      children {
        key
      }
    }
    focusbarVisible @client
    activeItem @client
  }
`;

const RENAME_ITEM = gql`
  mutation RenameItem($key: String!, $text: String!) {
    renameItem(input: { key: $key, text: $text }) {
      key
      text
    }
  }
`;

const COMPLETE_ITEM = gql`
  mutation CompleteItem($key: String!) {
    completeItem(input: { key: $key }) {
      key
      completed
      completedAt
    }
  }
`;
const UNCOMPLETE_ITEM = gql`
  mutation UnCompleteItem($key: String!) {
    unCompleteItem(input: { key: $key }) {
      key
      completed
      completedAt
    }
  }
`;

const DELETE_ITEM = gql`
  mutation DeleteItem($key: String!) {
    deleteItem(input: { key: $key }) {
      key
      deleted
      deletedAt
      children {
        key
        deleted
        deletedAt
      }
    }
  }
`;
const RESTORE_ITEM = gql`
  mutation RestoreItem($key: String!) {
    restoreItem(input: { key: $key }) {
      key
      deleted
      deletedAt
    }
  }
`;

const SET_PROJECT = gql`
  mutation SetProjectOfItem($key: String!, $projectKey: String) {
    setProjectOfItem(input: { key: $key, projectKey: $projectKey }) {
      key
      project {
        key
      }
    }
  }
`;

const SET_AREA = gql`
  mutation SetAreaOfItem($key: String!, $areaKey: String) {
    setAreaOfItem(input: { key: $key, areaKey: $areaKey }) {
      key
      area {
        key
        name
      }
    }
  }
`;

const SET_SCHEDULED_AT = gql`
  mutation SetScheduledAtOfItem($key: String!, $scheduledAt: DateTime) {
    setScheduledAtOfItem(input: { key: $key, scheduledAt: $scheduledAt }) {
      key
      scheduledAt
    }
  }
`;
const SET_DUE_AT = gql`
  mutation SetDueAtOfItem($key: String!, $dueAt: DateTime) {
    setDueAtOfItem(input: { key: $key, dueAt: $dueAt }) {
      key
      dueAt
    }
  }
`;
const SET_REPEAT = gql`
  mutation SetRepeatOfItem($key: String!, $repeat: String) {
    setRepeatOfItem(input: { key: $key, repeat: $repeat }) {
      key
      repeat
      dueAt
    }
  }
`;
const SET_PARENT = gql`
  mutation SetParentOfItem($key: String!, $parentKey: String) {
    setParentOfItem(input: { key: $key, parentKey: $parentKey }) {
      key
      parent {
        key
      }
    }
  }
`;
const SET_LABEL = gql`
  mutation SetLabelOfItem($key: String!, $labelKey: String) {
    setLabelOfItem(input: { key: $key, labelKey: $labelKey }) {
      key
      label {
        key
      }
    }
  }
`;

interface DispatchProps {}
interface StateProps {}

type FocusbarProps = DispatchProps & StateProps;
const Focusbar = (props: FocusbarProps): ReactElement => {
  const { colorMode } = useColorMode();
  const activeItem = activeItemVar();
  const { loading, error, data } = useQuery(GET_DATA, {
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
    refetchQueries: ['itemsByFilter'],
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
    return null;
  }
  if (loading) {
    return (
      <Flex
        direction="column"
        border={'1px solid'}
        borderColor={colorMode == 'light' ? 'gray.200' : 'gray.900'}
        shadow={'md'}
        minW={focusbarVisibleVar() ? '350px' : 0}
        opacity={focusbarVisibleVar() ? 1 : 0}
        px={3}
        py={3}
        h={'100%'}
        bg={colorMode == 'light' ? 'gray.50' : 'gray.800'}
        transition={'all 0.2s ease-in-out'}
      />
    );
  }

  const item: ItemType = data?.item;
  if (!item) return null;

  const attributeContainerStyles = {
    justifyContent: 'space-between',
    width: '100%',
    minW: '180px',
    px: 4,
    my: 1,
  };

  const generateSidebarTitle = (icon: IconType, text: string) => {
    return (
      <Flex minW={'100px'} alignItems={'center'}>
        {Icons[icon]()}
        <Text fontSize="md" pl={1}>
          {text}
        </Text>
      </Flex>
    );
  };

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
      border={'1px solid'}
      borderColor={colorMode == 'light' ? 'gray.200' : 'gray.900'}
      shadow={'md'}
      w={focusbarVisibleVar() ? '350px' : 0}
      minW={focusbarVisibleVar() ? '350px' : 0}
      opacity={focusbarVisibleVar() ? 1 : 0}
      px={3}
      py={3}
      h={'100%'}
      bg={colorMode == 'light' ? 'gray.50' : 'gray.800'}
      transition={'all 0.2s ease-in-out'}
    >
      <Grid templateColumns={'repeat(5, 1fr)'} width={'100%'} m={0} p={0}>
        {item?.parent != null && (
          <GridItem colSpan={1}>
            <Button
              variant="default"
              size="sm"
              tooltipText={'Up level'}
              onClick={() => {
                activeItemVar([item.parent.key]);
              }}
              icon={'upLevel'}
            />
          </GridItem>
        )}
        <GridItem colStart={5} colSpan={1}>
          <Flex justifyContent={'flex-end'}>
            <Button
              variant="default"
              size="sm"
              onClick={() => focusbarVisibleVar(false)}
              icon={'close'}
            />
          </Flex>
        </GridItem>
      </Grid>
      <Flex
        alignItems={'baseline'}
        w={'100%'}
        direction="row"
        m={0}
        px={2}
        py={4}
      >
        <Button
          disabled={item?.deleted}
          variant="default"
          size="sm"
          iconColour={item.label ? item.label.colour : null}
          onClick={() => {
            if (item.type == 'TODO') {
              item.completed
                ? unCompleteItem({ variables: { key: item.key } })
                : completeItem({ variables: { key: item.key } });
            }
          }}
          icon={
            item?.type == 'NOTE'
              ? 'note'
              : item?.completed
              ? 'todoChecked'
              : 'todoUnchecked'
          }
        />
        <Box
          w={'100%'}
          textDecoration={item?.completed ? 'line-through' : 'inherit'}
        >
          <EditableText2
            readOnly={item?.deleted}
            key={item?.key}
            height={'45px'}
            width={'260px'}
            input={item.text}
            singleLine={true}
            shouldClearOnSubmit={false}
            shouldSubmitOnBlur={true}
            hideToolbar={false}
            onUpdate={(text) => {
              renameItem({ variables: { key: item.key, text: text } });
            }}
          />
        </Box>
        {item.deleted ? (
          <Button
            variant="default"
            icon="restore"
            size="sm"
            tooltipText="Restore"
            onClick={() => {
              restoreItem({ variables: { key: item.key } });
            }}
          />
        ) : (
          <Button
            variant="default"
            icon="trash"
            size="sm"
            tooltipText="Delete"
            onClick={() => {
              deleteItem({ variables: { key: item.key } });
            }}
          />
        )}
      </Flex>
      {item.project?.key == '0' && (
        <Flex {...attributeContainerStyles}>
          {generateSidebarTitle('area', 'Area: ')}
          <AttributeSelect
            attribute="area"
            currentAttribute={item.area}
            completed={item.completed}
            deleted={item.deleted}
            onSubmit={(areaKey) =>
              setArea({ variables: { key: item.key, areaKey: areaKey } })
            }
          />
        </Flex>
      )}
      <Flex {...attributeContainerStyles}>
        {generateSidebarTitle('project', 'Project: ')}
        <AttributeSelect
          attribute={'project'}
          currentAttribute={item.project}
          deleted={item.deleted}
          completed={item.completed}
          onSubmit={(projectKey) => {
            setProject({
              variables: {
                key: item.key,
                projectKey: projectKey,
              },
            });
          }}
        />
      </Flex>
      {item.type == 'TODO' && (
        <>
          <Flex {...attributeContainerStyles}>
            {generateSidebarTitle('scheduled', 'Scheduled: ')}
            <DatePicker
              key={'sd' + item.key}
              defaultText={'Scheduled at: '}
              onSubmit={(d: Date) => {
                setScheduledAt({
                  variables: { key: item.key, scheduledAt: d },
                });
              }}
              text={scheduledDate}
              completed={item.completed}
              deleted={item.deleted}
            />
          </Flex>
          <Flex {...attributeContainerStyles}>
            {generateSidebarTitle('due', 'Due: ')}
            <DatePicker
              key={'dd' + item.key}
              defaultText={'Due at: '}
              onSubmit={(d: Date) =>
                setDueAt({ variables: { key: item.key, dueAt: d } })
              }
              text={dueDate}
              completed={item.completed}
              deleted={item.deleted}
            />
          </Flex>
          <Flex {...attributeContainerStyles}>
            {generateSidebarTitle('repeat', 'Repeating: ')}
            <RepeatPicker
              repeat={
                item.repeat && item.repeat != 'undefined'
                  ? RRule.fromString(item.repeat)
                  : null
              }
              completed={item.completed}
              deleted={item.deleted}
              key={'rp' + item.key}
              onSubmit={(r: RRule) =>
                setRepeat({
                  variables: { key: item.key, repeat: r?.toString() },
                })
              }
            />
          </Flex>
        </>
      )}
      {item.children.length == 0 && (
        <Flex {...attributeContainerStyles}>
          {generateSidebarTitle('subtask', 'Parent: ')}
          <AttributeSelect
            attribute={'item'}
            currentAttribute={item}
            completed={item.completed}
            deleted={item.deleted}
            onSubmit={(itemKey: string) =>
              setParent({ variables: { key: item.key, parentKey: itemKey } })
            }
          />
        </Flex>
      )}
      <Flex {...attributeContainerStyles}>
        {generateSidebarTitle('label', 'Label: ')}
        <AttributeSelect
          attribute={'label'}
          currentAttribute={item.label}
          completed={item.completed}
          deleted={item.deleted}
          onSubmit={(labelKey) => {
            setLabel({ variables: { key: item.key, labelKey: labelKey } });
          }}
        />
      </Flex>
      {item.deleted && (
        <Flex {...attributeContainerStyles}>
          {generateSidebarTitle('trash', 'Deleted at: ')}
          <Text fontSize="md" m={1} py={2} px={3}>
            {formatRelativeDate(parseISO(item?.deletedAt))}
          </Text>
        </Flex>
      )}
      {item.completed && (
        <Flex {...attributeContainerStyles}>
          {generateSidebarTitle('todoChecked', 'Completed at: ')}
          <Text fontSize="md" m={1} py={2} px={3}>
            {formatRelativeDate(parseISO(item?.completedAt))}
          </Text>
        </Flex>
      )}
      {item.parent?.key == null && item.type == 'TODO' && (
        <>
          <Flex pt={6} pb={2} alignItems="baseline">
            <Text fontSize="lg" px={2}>
              Subtasks
            </Text>
            {item.children.length > 0 && (
              <Text fontSize="sm" color="gray.600">
                {item.children.length} items
              </Text>
            )}
          </Flex>
          {item.children.length ? (
            <Box
              overflow="scroll"
              py={0}
              px={2}
              w={'100%'}
              key={`box-${item.key}`}
            >
              {item.children?.map((childItem) => {
                return (
                  <Item
                    compact={false}
                    key={childItem.key}
                    componentKey={null}
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
