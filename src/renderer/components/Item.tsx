import { format, isPast, parseISO, isFuture } from 'date-fns';
import React, { ReactElement, useEffect, useState } from 'react';
import { RRule } from 'rrule';
import { get, isEmpty } from 'lodash';
import {
  Box,
  Grid,
  Tag,
  TagLabel,
  Flex,
  Text,
  useColorMode,
  Tooltip,
  useTheme,
  Icon,
  IconButton,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@apollo/client';
import {
  COMPLETE_ITEM,
  ITEM_BY_KEY,
  UNCOMPLETE_ITEM,
  RESTORE_ITEM,
  ITEMS_BY_FILTER,
} from 'renderer/queries';
import { Emoji } from 'emoji-mart';
import { Icons } from '../assets/icons';
import { ItemIcons } from '../interfaces';
import {
  capitaliseFirstLetter,
  createShortSidebarItem,
  formatRelativeDate,
  HTMLToPlainText,
  removeItemTypeFromString,
  rruleToText,
  truncateString,
} from '../utils';
import ItemAttribute from './ItemAttribute';
import MoreDropdown from './MoreDropdown';
import {
  activeItemVar,
  focusbarVisibleVar,
  subtasksVisibleVar,
} from '../cache';
import LoadingItem from './LoadingItem';
import { Item as ItemType } from '../../main/resolvers-types';
import ItemActionButton from './ItemActionButton';

type ItemProps = {
  compact: boolean;
  itemKey: string;
  componentKey: string;
  hiddenIcons: ItemIcons[] | undefined;
  shouldIndent: boolean;
  hideCollapseIcon?: boolean;
};

const determineTextColour = (deleted: boolean, colorMode: 'light' | 'dark') => {
  if (deleted) {
    if (colorMode === 'light') {
      return 'gray.500';
    }
    return 'gray.400';
  }
  if (colorMode === 'light') {
    return 'gray.800';
  }
  return 'gray.200';
};

const determineBackgroundColour = (
  isFocused: boolean,
  colorMode: 'light' | 'dark'
): string => {
  if (isFocused) {
    if (colorMode === 'light') {
      return 'gray.100';
    }
    return 'gray.900';
  }
  if (colorMode === 'light') {
    return 'gray.50';
  }
  return 'gray.800';
};

// Check if the item should be visible, based on a parent hiding subtasks
const determineItemVisiblility = (
  parentKey: string,
  componentKey: string
): boolean => {
  const subtasksVisible = subtasksVisibleVar();
  if (!parentKey || !componentKey || isEmpty(subtasksVisible)) return true;
  // If the item has a parent, then check if the parent is hidden
  if (parentKey) {
    const parentVisibility = subtasksVisible?.[parentKey]?.[componentKey];
    // If the parent doesn't have visibility then set it to true
    if (parentVisibility === undefined) {
      subtasksVisibleVar({
        ...subtasksVisibleVar(),
        [parentKey]: { [componentKey]: true },
      });
      return true;
    }
    if (parentVisibility === false) {
      // If the parent visibility is false, all subtasks should be hidden
      return false;
    }
  }
  return true;
};

// Determine if any subtasks of the item should be visible
const determineSubtasksVisibility = (
  itemKey: string,
  componentKey: string
): boolean => {
  const subtasksVisible = subtasksVisibleVar();
  if (!itemKey || !componentKey || isEmpty(subtasksVisible)) return true;

  const subtaskVisibility = subtasksVisible?.[itemKey]?.[componentKey];
  if (subtaskVisibility === undefined) {
    // Default to visible
    subtasksVisibleVar({
      ...subtasksVisibleVar(),
      [itemKey]: { [componentKey]: true },
    });
    return true;
  }
  return subtaskVisibility;
};

function Item({
  compact,
  itemKey,
  componentKey,
  hiddenIcons,
  shouldIndent,
  hideCollapseIcon,
}: ItemProps): ReactElement {
  const { colorMode } = useColorMode();
  const [moreButtonVisible, setMoreButtonVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [subtasksVisible, setSubtasksVisible] = useState(true);

  const [completeItem] = useMutation(COMPLETE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });

  const [restoreItem] = useMutation(RESTORE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER],
  });

  const { loading, error, data } = useQuery(ITEM_BY_KEY, {
    variables: { key: itemKey || null },
  });

  const generateProjectTag = (
    item: ItemType,
    compact: boolean
  ): ReactElement => {
    const project = item?.project;
    if (!project) return <></>;

    if (project?.emoji) {
      return <Emoji emoji={project.emoji} size={12} native />;
    }
    if (compact) {
      return <TagLabel>{createShortSidebarItem(project.name)}</TagLabel>;
    }

    if (project.name === 'Inbox') {
      return (
        <TagLabel>
          <Icon color="blue.500" as={Icons.inbox} />
        </TagLabel>
      );
    }

    return <TagLabel>{project.name}</TagLabel>;
  };
  useEffect(() => {
    if (!data) return;
    setIsVisible(
      determineItemVisiblility(data.item?.parent?.key ?? '', componentKey)
    );
    setSubtasksVisible(
      determineSubtasksVisibility(data.item?.key, componentKey)
    );
  }, [data, itemKey, componentKey, subtasksVisibleVar()]);

  let enterInterval: NodeJS.Timer;
  let exitInterval: NodeJS.Timer;
  if (loading) return <LoadingItem />;

  if (!data || !data.item) {
    return (
      <Flex
        w="100%"
        p={1}
        mx={0}
        my={1}
        alignItems="center"
        cursor="pointer"
        borderRadius="md"
        alignContent="center"
        justifyContent="center"
        bg="red.100"
        border="1px solid"
        borderColor="red.400"
      >
        <Text fontSize="md" color="red.500">
          Failed to load item
        </Text>
      </Flex>
    );
  }

  const { item } = data;

  if (error)
    return (
      <Flex
        w="100%"
        p={1}
        mx={0}
        my={1}
        alignItems="center"
        cursor="pointer"
        borderRadius="md"
        alignContent="center"
        justifyContent="center"
        bg="red.100"
        border="1px solid"
        borderColor="red.400"
      >
        <Text fontSize="md" color="red.500">
          Failed to load item - ${error}
        </Text>
      </Flex>
    );

  const handleIconClick: React.MouseEventHandler<HTMLElement> = (e): void => {
    e.stopPropagation();
    if (item.deleted) {
      restoreItem({ variables: { key: item.key } });
      return;
    }
    if (item.completed) {
      unCompleteItem({ variables: { key: item.key } });
    } else {
      completeItem({ variables: { key: item.key } });
    }
  };

  const handleExpand: React.MouseEventHandler<HTMLElement> = (e): void => {
    e.stopPropagation();
    const currentValue = get(
      subtasksVisibleVar(),
      `${item.key}.${componentKey}`,
      false
    );

    const newSubState = { [item.key]: { [componentKey]: !currentValue } };
    subtasksVisibleVar({ ...subtasksVisibleVar(), ...newSubState });
  };

  const isFocused = activeItemVar().findIndex((i) => i === item.key) >= 0;
  const reminder = item?.reminders?.[0];
  return (
    <Grid
      display={isVisible ? 'grid' : 'none'}
      height={isVisible ? 'auto' : '0px'}
      transition="all 0.2s ease-in-out"
      position="relative"
      maxHeight="200px"
      p={1}
      pl={shouldIndent ? 5 : 1}
      mx={0}
      my={1}
      gap={0.5}
      alignItems="center"
      cursor="pointer"
      borderRadius="md"
      gridTemplateColumns={
        compact
          ? 'repeat(5, 1fr)'
          : 'repeat(2, 30px) repeat(6, 1fr) repeat(1, 30px)'
      }
      gridTemplateRows="40px auto"
      gridTemplateAreas={
        compact
          ? `
            "description  description  description  description  description"
            "parent       due          scheduled    repeat       project    "
           `
          : `
            "collapse  complete  description  description  description  description description description more"
            ".         parent    parent       due          scheduled    repeat      project     reminder snooze"
           `
      }
      outline="none"
      outlineColor="transparent"
      _before={{
        content: "''",
        position: 'absolute',
        top: '-16px',
        left: '16px',
        height: shouldIndent ? 'calc(100% + 10px)' : '0px',
        transition: 'all 0.1s ease-in-out',
        background: colorMode === 'light' ? 'gray.400' : 'gray.200',
        width: '1px',
        zIndex: 9,
      }}
      _after={{
        content: "''",
        position: 'absolute',
        bottom: -1,
        right: '0px',
        left: '0px',
        margin: 'auto',
        width: shouldIndent || subtasksVisible ? '90%' : '100%',
        borderBottom: '1px',
        borderColor: colorMode === 'light' ? 'gray.100' : 'gray.700',
        opacity: 0.8,
      }}
      bg={determineBackgroundColour(isFocused, colorMode)}
      id={item.key}
      onMouseEnter={() => {
        enterInterval = setTimeout(() => setMoreButtonVisible(true), 250);
        clearTimeout(exitInterval);
      }}
      onMouseLeave={() => {
        clearTimeout(enterInterval);
        exitInterval = setTimeout(() => setMoreButtonVisible(false), 200);
      }}
      onClick={(e) => {
        if (e.shiftKey) {
          if (isFocused) {
            const activeItems = activeItemVar().filter((i) => i !== item.key);
            activeItemVar(activeItems);
            if (activeItems.length === 0) {
              focusbarVisibleVar(false);
            }
          } else {
            activeItemVar([item.key, ...activeItemVar()]);
            focusbarVisibleVar(true);
          }
        } else {
          activeItemVar([item.key]);
          if (
            focusbarVisibleVar() === false ||
            focusbarVisibleVar() === undefined
          ) {
            focusbarVisibleVar(true);
          }
        }
      }}
      tabIndex={0}
    >
      <Box gridArea="description">
        <Tooltip
          isDisabled={!item.text}
          label={HTMLToPlainText(item.text ?? '')}
        >
          <Text
            id="body"
            mx={0}
            my={2}
            fontSize="md"
            isTruncated
            textDecoration={item.completed ? 'line-through' : 'initial'}
            color={determineTextColour(item.deleted, colorMode)}
            sx={{
              p: {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
              a: {
                textDecoration: 'underline',
              },
            }}
            dangerouslySetInnerHTML={{
              __html: removeItemTypeFromString(item.text ?? ''),
            }}
          />
        </Tooltip>
      </Box>

      <Box gridArea="project">
        {!hiddenIcons?.includes(ItemIcons.Project) && (
          <Flex justifyContent="flex-end">
            <Tooltip label={item.project?.name}>
              <Tag size={compact ? 'sm' : 'md'} colorScheme="blue">
                {generateProjectTag(item, compact)}
              </Tag>
            </Tooltip>
          </Flex>
        )}
      </Box>

      {item.children && item.children.length > 0 && !hideCollapseIcon && (
        <Box gridArea="collapse">
          <IconButton
            aria-label={subtasksVisible ? 'collapse' : 'expand'}
            variant="default"
            size="sm"
            onClick={handleExpand}
            icon={<Icon as={subtasksVisible ? Icons.collapse : Icons.expand} />}
          />
        </Box>
      )}

      {!compact && (
        <Tooltip
          label={((deleted: boolean, completed: boolean) => {
            if (deleted) {
              return 'Restore';
            }
            if (completed) {
              return 'Uncomplete';
            }
            return 'Complete';
          })(item.deleted, item.completed)}
        >
          <Box gridArea="complete">
            <ItemActionButton
              onClick={handleIconClick}
              completed={item.completed}
              deleted={item.deleted}
              colour={item?.label?.colour}
            />
          </Box>
        </Tooltip>
      )}

      <Box gridArea="parent">
        {!hiddenIcons?.includes(ItemIcons.Subtask) && item.parent && (
          <ItemAttribute
            compact={compact}
            completed={item.completed ?? false}
            type="subtask"
            tooltipText={item.parent.text ?? ''}
            text={
              item.parent
                ? truncateString(
                    removeItemTypeFromString(item.parent.text ?? ''),
                    12
                  )
                : ''
            }
          />
        )}
      </Box>

      {!compact && (
        <Box gridArea="more">
          {moreButtonVisible && (
            <MoreDropdown
              itemKey={item.key}
              itemText={item.text}
              deleted={item.deleted}
            />
          )}
        </Box>
      )}

      <Box gridArea="scheduled">
        {item.scheduledAt != null &&
          !hiddenIcons?.includes(ItemIcons.Scheduled) && (
            <ItemAttribute
              compact={compact}
              completed={item.completed ?? false}
              type="scheduled"
              tooltipText={formatRelativeDate(parseISO(item.scheduledAt))}
              text={formatRelativeDate(parseISO(item.scheduledAt))}
            />
          )}
      </Box>

      <Box gridArea="reminder">
        {reminder && (
          <Tooltip
            label={`Reminder at: ${format(
              parseISO(item?.reminders?.[0]?.remindAt),
              'h:mm aaaa EEEE'
            )}`}
          >
            <Flex justifyContent="center">
              <Icon
                as={Icons.reminder}
                color={
                  isPast(parseISO(reminder.remindAt)) ? 'red.400' : 'gray.600'
                }
              />
            </Flex>
          </Tooltip>
        )}
      </Box>

      <Box gridArea="snooze">
        {item.snoozedUntil && isFuture(parseISO(item.snoozedUntil)) && (
          <Tooltip
            label={`Snoozed until: ${formatRelativeDate(
              parseISO(item?.snoozedUntil)
            )}`}
          >
            <Flex justifyContent="center">
              <Icon as={Icons.snooze} color={'gray.600'} />
            </Flex>
          </Tooltip>
        )}
      </Box>
      <Box gridArea="due">
        {item.dueAt != null && !hiddenIcons?.includes(ItemIcons.Due) && (
          <ItemAttribute
            compact={compact}
            completed={item.completed ?? false}
            type="due"
            tooltipText={formatRelativeDate(parseISO(item.dueAt))}
            text={formatRelativeDate(parseISO(item.dueAt))}
            isOverdue={isPast(parseISO(item.dueAt))}
          />
        )}
      </Box>

      <Box gridArea="repeat">
        {item.repeat && !hiddenIcons?.includes(ItemIcons.Repeat) && (
          <ItemAttribute
            compact={compact}
            completed={item.completed ?? false}
            type="repeat"
            tooltipText={capitaliseFirstLetter(
              rruleToText(RRule.fromString(item?.repeat))
            )}
            text={capitaliseFirstLetter(
              rruleToText(RRule.fromString(item?.repeat))
            )}
          />
        )}
      </Box>
    </Grid>
  );
}

export default Item;
