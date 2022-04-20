import React, { ReactElement, useState } from 'react';
import {
  Flex,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  IconButton,
  Text,
  useColorMode,
  Icon,
} from '@chakra-ui/react';
import { useMutation } from '@apollo/client';
import {
  DELETE_ITEM,
  CLONE_ITEM,
  PERMANENT_DELETE_ITEM,
  RESTORE_ITEM,
} from 'renderer/queries';
import { HTMLToPlainText } from 'renderer/utils';
import { Icons } from '../assets/icons';
import { IconType } from '../interfaces';
import LabelDialog from './LabelDialog';
import ReminderDialog from './ReminderDialog';

export type MoreDropdownOptions = {
  label: string;
  icon: IconType;

  onClick: (e: React.MouseEvent) => void;
}[];

type MoreDropdownProps = {
  disableClick?: boolean;
  deleted: boolean;
  itemKey: string;
  itemText: string;
};

const MoreDropdown = ({
  disableClick,
  itemKey,
  itemText,
  deleted,
}: MoreDropdownProps): ReactElement => {
  const { colorMode } = useColorMode();
  const [showLabelDialog, setShowLabelDialog] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);
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

  const dropdownOptions: MoreDropdownOptions = deleted
    ? [
        {
          label: 'Delete permanently',
          onClick: (e: React.MouseEvent) => {
            permanentDeleteItem({ variables: { itemKey } });
            e.stopPropagation();
            e.preventDefault();
          },
          icon: 'trashPermanent',
        },
        {
          label: 'Restore item',
          onClick: (e: React.MouseEvent) => {
            restoreItem({ variables: { itemKey } });
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
          icon: 'label',
        },
        {
          label: 'Delete item',
          onClick: (e: React.MouseEvent) => {
            deleteItem({ variables: { itemKey } });
            e.stopPropagation();
            e.preventDefault();
          },
          icon: 'trash',
        },
        {
          label: 'Clone item',
          onClick: (e: React.MouseEvent) => {
            cloneItem({ variables: { itemKey } });
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

  return (
    <>
      <Menu matchWidth>
        <MenuButton
          disabled={disableClick}
          as={IconButton}
          onClick={(e) => e.stopPropagation()}
          variant="subtle"
          color={colorMode === 'light' ? 'gray.800' : 'gray.400'}
          icon={<Icon as={Icons.more} />}
        />
        <MenuList minW="140px">
          {dropdownOptions.map((v, i) => {
            return (
              <MenuItem key={i} onClick={v.onClick}>
                <Flex
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  py={0}
                  px={2}
                >
                  <Icon as={Icons[v?.icon]} />
                  <Text pl={2} fontSize="sm">
                    {v.label}
                  </Text>
                </Flex>
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
      {showLabelDialog && (
        <LabelDialog
          itemKey={itemKey}
          onClose={() => {
            setShowLabelDialog(false);
          }}
        />
      )}
      {showReminderDialog && (
        <ReminderDialog
          itemKey={itemKey}
          reminderText={HTMLToPlainText(itemText ?? '')}
          onClose={() => {
            setShowReminderDialog(false);
          }}
        />
      )}
    </>
  );
};

export default MoreDropdown;
