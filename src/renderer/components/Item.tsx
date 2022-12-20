import { useMutation, useQuery } from '@apollo/client';
import {
  Box,
  Flex,
  Grid,
  Icon,
  IconButton,
  Tag,
  TagLabel,
  Text,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { format, isFuture, isPast, parseISO } from 'date-fns';
import React, { ReactElement, useState } from 'react';
import {
  COMPLETE_ITEM,
  ITEMS_BY_FILTER,
  ITEM_BY_KEY,
  RESTORE_ITEM,
  UNCOMPLETE_ITEM,
} from 'renderer/queries';
import { RRule } from 'rrule';
import { Item as ItemType } from '../../main/resolvers-types';
import { Icons } from '../assets/icons';
import { AppState, useAppStore } from 'renderer/state';
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
import EmojiDisplay from './EmojiDisplay';
import ItemActionButton from './ItemActionButton';
import ItemAttribute from './ItemAttribute';
import LoadingItem from './LoadingItem';
import MoreDropdown from './MoreDropdown';
import { FailedItem } from './FailedItem';

type ItemProps = {
  compact: boolean;
  itemKey: string;
  parentKey?: string;
  componentKey: string;
  hiddenIcons: ItemIcons[] | undefined;
  shouldIndent: boolean;
  hideCollapseIcon?: boolean;
};

const generateProjectTag = (item: ItemType, compact: boolean): ReactElement => {
  const project = item?.project;
  if (!project) return <></>;

  if (project?.emoji) {
    return <EmojiDisplay emojiId={project.emoji} size={12} />;
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

const determineTextColour = (deleted: boolean, colorMode: 'light' | 'dark') => {
  if (deleted) {
    return colorMode === 'light' ? 'gray.500' : 'gray.400';
  }
  return colorMode === 'light' ? 'gray.800' : 'gray.200';
};

const determineBackgroundColour = (
  isFocused: boolean,
  colorMode: 'light' | 'dark'
): string => {
  if (isFocused) {
    return colorMode === 'light' ? 'gray.100' : 'gray.900';
  }
  return colorMode === 'light' ? 'gray.50' : 'gray.800';
};

function Item({
  compact,
  itemKey,
  parentKey,
  componentKey,
  hiddenIcons,
  shouldIndent,
  hideCollapseIcon,
}: ItemProps): ReactElement {
  const { colorMode } = useColorMode();
  const [moreButtonVisible, setMoreButtonVisible] = useState(false);
  const [
    activeItemIds,
    setActiveItemIds,
    setFocusbarVisible,
    setSubtaskVisibility,
  ] = useAppStore((state: AppState) => [
    state.activeItemIds,
    state.setActiveItemIds,
    state.setFocusbarVisible,
    state.setSubtaskVisibility,
  ]);

  const subtasksVisible = useAppStore((state) => {
    if (state.visibleSubtasks?.[itemKey]) {
      const visibility = state.visibleSubtasks?.[itemKey]?.[componentKey];
      return visibility === undefined ? true : visibility;
    }

    return true;
  });

  const isVisible = useAppStore((state) => {
    if (!parentKey) {
      return true;
    }
    if (state.visibleSubtasks?.[parentKey]) {
      const visibility = state.visibleSubtasks?.[parentKey]?.[componentKey];
      return visibility === undefined ? true : visibility;
    }
    return true;
  });

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

  let enterInterval: NodeJS.Timer;
  let exitInterval: NodeJS.Timer;
  if (loading) return <LoadingItem />;

  if (!data || !data.item) {
    return <FailedItem />;
  }

  const { item } = data;

  if (error) return <FailedItem reason={error.message} />;

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
    setSubtaskVisibility(itemKey, componentKey, !subtasksVisible);
  };

  const isFocused = activeItemIds.findIndex((i) => i === item.key) >= 0;
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
            const activeItems = activeItemIds.filter((i) => i !== item.key);
            setActiveItemIds(activeItems);
            if (activeItems.length === 0) {
              setFocusbarVisible(false);
            }
          } else {
            setActiveItemIds([item.key, ...activeItemIds]);
            setFocusbarVisible(true);
          }
        } else {
          setActiveItemIds([item.key]);
          setFocusbarVisible(true);
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
              tooltipText={`Scheduled ${formatRelativeDate(
                parseISO(item.scheduledAt)
              )}`}
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
            label={`Snoozed until ${formatRelativeDate(
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
            tooltipText={`Due ${formatRelativeDate(parseISO(item.dueAt))}`}
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
            tooltipText={`Repeating ${capitaliseFirstLetter(
              rruleToText(RRule.fromString(item?.repeat))
            )}`}
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
