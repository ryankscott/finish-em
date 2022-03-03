import { format, isPast, parseISO } from 'date-fns';
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
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@apollo/client';
import {
  COMPLETE_ITEM,
  GET_ITEM_BY_KEY,
  DELETE_ITEM,
  CLONE_ITEM,
  UNCOMPLETE_ITEM,
  RESTORE_ITEM,
  PERMANENT_DELETE_ITEM,
} from 'renderer/queries';
import { Emoji } from 'emoji-mart';
import { convertSVGElementToReact, Icons } from '../assets/icons';
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
import Button from './Button';
import ItemAttribute from './ItemAttribute';
import LabelDialog from './LabelDialog';
import MoreDropdown, { MoreDropdownOptions } from './MoreDropdown';
import ReminderDialog from './ReminderDialog';
import { activeItemVar, focusbarVisibleVar, subtasksVisibleVar } from '..';
import { LoadingItem } from './LoadingItem';
import { Item as ItemType } from '../../main/generated/typescript-helpers';

type ItemProps = {
  compact: boolean;
  itemKey: string;
  componentKey: string;
  hiddenIcons: ItemIcons[];
  shouldIndent: boolean;
  hideCollapseIcon?: boolean;
};

const generateProjectTag = (item: ItemType, compact: boolean): ReactElement => {
  const project = item?.project;
  if (!project) return <></>;

  if (project?.emoji) {
    if (compact) {
      return <Emoji emoji={project.emoji} size={8} native />;
    }

    return (
      <Flex alignItems="baseline">
        <Emoji emoji={project.emoji} size={8} native />
        <Text pl={1} fontSize="xs">
          {project.name}
        </Text>
      </Flex>
    );
  }

  if (compact) {
    return <TagLabel>{createShortSidebarItem(project.name)}</TagLabel>;
  }

  return <TagLabel>{project.name}</TagLabel>;
};

function Item(props: ItemProps): ReactElement {
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const [moreButtonVisible, setMoreButtonVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [subtasksVisible, setSubtasksVisible] = useState(true);
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [completeItem] = useMutation(COMPLETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [deleteItem] = useMutation(DELETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [cloneItem] = useMutation(CLONE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [permanentDeleteItem] = useMutation(PERMANENT_DELETE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });
  const [restoreItem] = useMutation(RESTORE_ITEM, {
    refetchQueries: ['itemsByFilter'],
  });

  const { loading, error, data } = useQuery(GET_ITEM_BY_KEY, {
    variables: { key: props.itemKey ? props.itemKey : null },
  });

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
      if (parentVisibility == undefined) {
        subtasksVisibleVar({
          ...subtasksVisibleVar(),
          [parentKey]: { [componentKey]: true },
        });
        return true;
      }
      if (parentVisibility == false) {
        // If the parent visibility is false, all subtasks should be hidden
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (!data) return;
    setIsVisible(
      determineItemVisiblility(data.item?.parent?.key ?? '', props.componentKey)
    );
    setSubtasksVisible(
      determineSubtasksVisibility(data.item?.key, props.componentKey)
    );
  }, [data, props.itemKey, props.componentKey]);

  // Determine if any subtasks of the item should be visible
  const determineSubtasksVisibility = (
    itemKey: string,
    componentKey: string
  ): boolean => {
    const subtasksVisible = subtasksVisibleVar();
    if (!itemKey || !componentKey || isEmpty(subtasksVisible)) return true;

    const subtaskVisibility = subtasksVisible?.[itemKey]?.[componentKey];
    if (subtaskVisibility == undefined) {
      // Default to visible
      subtasksVisibleVar({
        ...subtasksVisibleVar(),
        [itemKey]: { [componentKey]: true },
      });
      return true;
    }
    return subtaskVisibility;
  };

  let enterInterval: NodeJS.Timer;
  let exitInterval: NodeJS.Timer;

  if (!data || !data.item) return <></>;

  const { item } = data;

  if (loading) return <LoadingItem />;

  if (error) return <></>;

  // TODO: Move this to the MoreDropdown component
  const dropdownOptions: MoreDropdownOptions = item.deleted
    ? [
        {
          label: 'Delete permanently',
          onClick: (e: React.MouseEvent) => {
            permanentDeleteItem({ variables: { key: item.key } });
            e.stopPropagation();
            e.preventDefault();
          },
          icon: 'trashPermanent',
        },
        {
          label: 'Restore item',
          onClick: (e: React.MouseEvent) => {
            restoreItem({ variables: { key: item.key } });
            e.stopPropagation();
            e.preventDefault();
          },
          icon: 'restore',
        },
      ]
    : [
        {
          label: 'Add label',
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            e.preventDefault();
            setShowLabelDialog(!showLabelDialog);
          },
          icon: 'flag',
        },
        {
          label: 'Delete item',
          onClick: (e: React.MouseEvent) => {
            deleteItem({ variables: { key: item.key } });
            e.stopPropagation();
            e.preventDefault();
          },
          icon: 'trash',
        },
        {
          label: 'Clone item',
          onClick: (e: React.MouseEvent) => {
            cloneItem({ variables: { key: item.key } });
            e.stopPropagation();
            e.preventDefault();
          },
          icon: 'copy',
        },
        {
          label: 'Remind me',
          onClick: (e: React.MouseEvent) => {
            setShowReminderDialog(!showReminderDialog);
            e.stopPropagation();
            e.preventDefault();
          },
          icon: 'reminder',
        },
      ];

  const handleIconClick: React.MouseEventHandler<HTMLElement> = (e): void => {
    e.stopPropagation();
    if (item.deleted) {
      restoreItem({ variables: { key: item.key } });
      return;
    }
    if (item.type == 'TODO') {
      item.completed
        ? unCompleteItem({ variables: { key: item.key } })
        : completeItem({ variables: { key: item.key } });
    }
  };

  const handleExpand: React.MouseEventHandler<HTMLElement> = (e): void => {
    e.stopPropagation();
    const currentValue = get(
      subtasksVisibleVar(),
      `${item.key}.${props.componentKey}`,
      false
    );
    const newSubState = { [item.key]: { [props.componentKey]: !currentValue } };
    subtasksVisibleVar({ ...subtasksVisibleVar(), ...newSubState });
  };

  const isFocused = activeItemVar().findIndex((i) => i == item.key) >= 0;
  const reminder = item?.reminders?.[0];
  return (
    <Grid
      display={isVisible ? 'grid' : 'none'}
      height={isVisible ? 'auto' : '0px'}
      transition="all 0.2s ease-in-out"
      position="relative"
      maxHeight="200px"
      p={1}
      pl={props.shouldIndent ? 5 : 1}
      mx={0}
      my={1}
      gap={0.5}
      alignItems="center"
      cursor="pointer"
      borderRadius={5}
      gridTemplateColumns={
        props.compact
          ? 'repeat(5, 1fr)'
          : 'repeat(2, 25px) repeat(5, 1fr) repeat(1, 30px)'
      }
      gridTemplateRows="40px auto"
      gridTemplateAreas={
        props.compact
          ? `
            "description  description  description  description  description"
            "parent       due          scheduled    repeat       project    "
           `
          : `
            "collapse  complete  description  description  .            .           .          more"
            ".         .         parent       due          scheduled    repeat      project    reminder"
           `
      }
      outline="none"
      outlineColor="transparent"
      _before={{
        content: "''",
        position: 'absolute',
        top: '-16px',
        left: '16px',
        height: props.shouldIndent ? 'calc(100% + 10px)' : '0px',
        transition: 'all 0.1s ease-in-out',
        background: colorMode == 'light' ? 'gray.400' : 'gray.200',
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
        width: props.shouldIndent || subtasksVisible ? '90%' : '100%',
        borderBottom: '1px',
        borderColor: colorMode == 'light' ? 'gray.100' : 'gray.700',
        opacity: 0.8,
      }}
      bg={
        isFocused
          ? colorMode == 'light'
            ? 'gray.100'
            : 'gray.900'
          : colorMode == 'light'
          ? 'gray.50'
          : 'gray.800'
      }
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
            const activeItems = activeItemVar().filter((i) => i != item.key);
            activeItemVar(activeItems);
            if (activeItems.length == 0) {
              focusbarVisibleVar(false);
            }
          } else {
            activeItemVar([item.key, ...activeItemVar()]);
            focusbarVisibleVar(true);
          }
        } else {
          activeItemVar([item.key]);
          if (
            focusbarVisibleVar() == false ||
            focusbarVisibleVar() == undefined
          ) {
            focusbarVisibleVar(true);
          }
        }
      }}
      tabIndex={0}
    >
      <Box gridArea="description">
        <Tooltip
          delay={500}
          disabled={!item.text}
          label={HTMLToPlainText(item.text ?? '')}
        >
          <Text
            id="body"
            mx={0}
            my={2}
            fontSize="md"
            isTruncated
            textDecoration={item.completed ? 'line-through' : 'initial'}
            color={
              item.deleted
                ? colorMode == 'light'
                  ? 'gray.500'
                  : 'gray.400'
                : colorMode == 'light'
                ? 'gray.800'
                : 'gray.200'
            }
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

      {/* TODO: use emoji for projects names  */}
      <Box gridArea="project">
        {(!props.hiddenIcons?.includes(ItemIcons.Project) ||
          item.project == null) && (
          <Flex justifyContent="flex-end">
            <Tooltip delay={500} label={item.project?.name}>
              <Tag
                size={props.compact ? 'sm' : 'md'}
                color="white"
                bg="blue.500"
              >
                {generateProjectTag(item, props.compact)}
              </Tag>
            </Tooltip>
          </Flex>
        )}
      </Box>

      {item.children && item.children.length > 0 && !props.hideCollapseIcon && (
        <Box gridArea="collapse">
          <Button
            variant="default"
            size="sm"
            onClick={handleExpand}
            icon={subtasksVisible ? 'collapse' : 'expand'}
            iconSize="16px"
          />
        </Box>
      )}

      {!props.compact && (
        <Box gridArea="complete">
          <Button
            variant="subtle"
            size="sm"
            tooltipText={
              item.deleted
                ? 'Restore'
                : item.completed
                ? 'Uncomplete'
                : 'Complete'
            }
            onClick={handleIconClick}
            icon={
              item.deleted
                ? 'restore'
                : item.completed
                ? 'todoChecked'
                : 'todoUnchecked'
            }
            iconSize="16px"
            iconColour={item?.label?.colour || undefined}
          />
        </Box>
      )}

      <Box gridArea="parent">
        {!props.hiddenIcons?.includes(ItemIcons.Subtask) && item.parent && (
          <ItemAttribute
            compact={props.compact}
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

      {!props.compact && (
        <Box>
          {showReminderDialog && (
            <ReminderDialog
              itemKey={item.key}
              reminderText={HTMLToPlainText(item.text ?? '')}
              onClose={() => {
                setShowReminderDialog(false);
              }}
            />
          )}
        </Box>
      )}

      {!props.compact && (
        <Box gridArea="more">
          {moreButtonVisible && (
            <>
              <MoreDropdown options={dropdownOptions} />
              {showLabelDialog && (
                <LabelDialog
                  itemKey={item.key}
                  onClose={() => {
                    setShowLabelDialog(false);
                  }}
                />
              )}
            </>
          )}
        </Box>
      )}

      <Box gridArea="scheduled">
        {item.scheduledAt != null &&
          !props.hiddenIcons?.includes(ItemIcons.Scheduled) && (
            <ItemAttribute
              compact={props.compact}
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
            delay={500}
            label={`Reminder at: ${format(
              parseISO(item?.reminders?.[0]?.remindAt),
              'h:mm aaaa EEEE'
            )}`}
          >
            <Flex justifyContent="center">
              {convertSVGElementToReact(
                Icons.reminder(
                  '12px',
                  '12px',
                  isPast(parseISO(reminder.remindAt))
                    ? theme?.colors?.gray[400]
                    : theme?.colors?.blue[400]
                )
              )}
            </Flex>
          </Tooltip>
        )}
      </Box>

      <Box gridArea="due">
        {item.dueAt != null && !props.hiddenIcons?.includes(ItemIcons.Due) && (
          <ItemAttribute
            compact={props.compact}
            completed={item.completed ?? false}
            type="due"
            tooltipText={formatRelativeDate(parseISO(item.dueAt))}
            text={formatRelativeDate(parseISO(item.dueAt))}
          />
        )}
      </Box>

      <Box gridArea="repeat">
        {item.repeat && !props.hiddenIcons?.includes(ItemIcons.Repeat) && (
          <ItemAttribute
            compact={props.compact}
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
