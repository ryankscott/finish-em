import React, { ReactElement, useState } from 'react'
import {
  Flex,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  IconButton,
  Text,
  Icon,
  useColorMode
} from '@chakra-ui/react'
import { useMutation } from '@apollo/client'
import {
  DELETE_ITEM,
  CLONE_ITEM,
  PERMANENT_DELETE_ITEM,
  RESTORE_ITEM,
  ITEMS_BY_FILTER
} from '../queries'
import { HTMLToPlainText } from '../utils'
import { Icons } from '../assets/icons'
import { IconType } from '../interfaces'
import LabelDialog from './LabelDialog'
import ReminderDialog from './ReminderDialog'
import SnoozeDialog from './SnoozeDialog'

export type MoreDropdownOptions = {
  label: string
  icon: IconType

  onClick: (e: React.MouseEvent) => void
}[]

type MoreDropdownProps = {
  disableClick?: boolean
  deleted: boolean
  itemKey: string
  itemText: string
}

const MoreDropdown = ({
  disableClick,
  itemKey,
  itemText,
  deleted
}: MoreDropdownProps): ReactElement => {
  const { colorMode } = useColorMode()
  const [showLabelDialog, setShowLabelDialog] = useState(false)
  const [showReminderDialog, setShowReminderDialog] = useState(false)
  const [showSnoozeDialog, setShowSnoozeDialog] = useState(false)
  const [deleteItem] = useMutation(DELETE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER]
  })
  const [cloneItem] = useMutation(CLONE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER]
  })
  const [permanentDeleteItem] = useMutation(PERMANENT_DELETE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER]
  })
  const [restoreItem] = useMutation(RESTORE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER]
  })

  const dropdownOptions: MoreDropdownOptions = deleted
    ? [
        {
          label: 'Delete permanently',
          onClick: (e: React.MouseEvent): void => {
            permanentDeleteItem({ variables: { itemKey } })
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'trashPermanent'
        },
        {
          label: 'Restore item',
          onClick: (e: React.MouseEvent): void => {
            restoreItem({ variables: { itemKey } })
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'restore'
        }
      ]
    : [
        {
          label: 'Add label',
          onClick: (e: React.MouseEvent): void => {
            e.stopPropagation()
            e.preventDefault()
            setShowLabelDialog(!showLabelDialog)
            return
          },
          icon: 'label'
        },
        {
          label: 'Delete item',
          onClick: (e: React.MouseEvent): void => {
            deleteItem({ variables: { key: itemKey } })
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'trash'
        },
        {
          label: 'Clone item',
          onClick: (e: React.MouseEvent): void => {
            cloneItem({ variables: { key: itemKey } })
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'copy'
        },
        {
          label: 'Remind me',
          onClick: (e: React.MouseEvent): void => {
            setShowReminderDialog(!showReminderDialog)
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'reminder'
        },
        {
          label: 'Snooze',
          onClick: (e: React.MouseEvent): void => {
            setShowSnoozeDialog(!showSnoozeDialog)
            e.stopPropagation()
            e.preventDefault()
            return
          },
          icon: 'snooze'
        }
      ]

  return (
    <>
      <Menu matchWidth>
        <MenuButton
          zIndex={100}
          tabIndex={-1}
          disabled={disableClick}
          as={IconButton}
          onClick={(e) => e.stopPropagation()}
          variant="subtle"
          color={colorMode === 'light' ? 'gray.800' : 'gray.400'}
          icon={<Icon as={Icons.more} />}
        />
        <MenuList minW="140px" zIndex={101}>
          {dropdownOptions.map((v, i) => {
            return (
              <MenuItem key={i} onClick={v.onClick}>
                <Flex direction="row" justifyContent="center" alignItems="center" py={0} px={2}>
                  <Icon as={Icons[v?.icon]} />
                  <Text pl={2} fontSize="sm">
                    {v.label}
                  </Text>
                </Flex>
              </MenuItem>
            )
          })}
        </MenuList>
      </Menu>
      {showLabelDialog && (
        <LabelDialog
          itemKey={itemKey}
          onClose={() => {
            setShowLabelDialog(false)
          }}
        />
      )}
      {showReminderDialog && (
        <ReminderDialog
          itemKey={itemKey}
          reminderText={HTMLToPlainText(itemText ?? '')}
          onClose={() => {
            setShowReminderDialog(false)
          }}
        />
      )}
      {showSnoozeDialog && (
        <SnoozeDialog
          itemKey={itemKey}
          onClose={() => {
            setShowSnoozeDialog(false)
          }}
        />
      )}
    </>
  )
}

export default MoreDropdown
