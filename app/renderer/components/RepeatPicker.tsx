import React, { ReactElement, useState } from 'react'
import {
  Menu,
  MenuButton,
  Flex,
  Text,
  MenuList,
  MenuItem,
  Button,
  Box,
  forwardRef
  useOutsideClick,
  FlexProps,
} from '@chakra-ui/react'
import { format } from 'date-fns'
import { RRule } from 'rrule'
import RepeatDialog from './RepeatDialog'
import { rruleToText, capitaliseFirstLetter } from '../utils'
import { Icons } from '../assets/icons'

type RepeatPickerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'invert'
  repeat: RRule
  onSubmit: (value: RRule) => void
  onEscape?: () => void
  tooltipText?: string
  completed: boolean
  deleted?: boolean
}
type MenuItemType = {
  name: string
  clickHandler: () => void
}

function RepeatPicker(props: RepeatPickerProps): ReactElement {
  const [showMenu, setShowMenu] = useState(false)
  const [repeatDialogVisible, setRepeatDialogVisible] = useState(false)

  type repeatOption = {
    type: 'custom' | 'default'
    repeat: RRule | null
  }


  const MenuItem = (props) => (
    <Flex
      px={2}
      my={0.5}
      py={1.5}
      _hover={{ bg: 'gray.100' }}
      cursor="pointer"
      bg="gray.50"
      zIndex={4}
      justifyContent={'start'}
      minW={repeatDialogVisible ? '130px' : '192'}
      {...props}
    >
      <Text fontSize="md" px={2}>
        {props.children}
      </Text>
    </Flex>
  )

  const MenuList = forwardRef<FlexProps, "div">((props, ref) => (
    <Flex
      direction="row"
      shadow="md"
      py={2}
      px={repeatDialogVisible ? 2 : 0}
      border="1px solid"
      borderColor="gray.100"
      borderRadius="md"
      position="absolute"
      zIndex={2}
      bg="gray.50"
      top="36px"
      right="-2px"
      minW="190px"
      transition={'0.2s all ease-in-out'}
      justifyContent="center"
      ref={ref} 
      {...props}
    >
      {props.children}
    </Flex>
  ))


  const handleRepeatChange = (input: repeatOption) => {
    if (input.type == 'default') {
      props.onSubmit(input.repeat)
      setRepeatDialogVisible(false)
      setShowMenu(false)
      return
    } else {
      setRepeatDialogVisible(true)
      return
    }
  }

  const menuItems: MenuItemType[] = [
    {
      name: 'Daily',
      clickHandler: () =>
        handleRepeatChange({
          type: 'default',
          repeat: new RRule({
            freq: RRule.DAILY,
            interval: 1,
          }),
        }),
    },
    {
      name: 'Weekdays',
      clickHandler: () =>
        handleRepeatChange({
          type: 'default',
          repeat: new RRule({
            freq: RRule.DAILY,
            interval: 1,
            byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
          }),
        }),
    },
    {
      name: 'Weekly on ' + format(new Date(), 'EEE'),
      clickHandler: () =>
        handleRepeatChange({
          type: 'default',
          repeat: new RRule({
            freq: RRule.WEEKLY,
            interval: 1,
            byweekday: new Date().getDay() == 0 ? 6 : new Date().getDay() - 1,
          }),
        }),
    },
    {
      name: 'Monthly on the ' + format(new Date(), 'do'),
      clickHandler: () =>
        handleRepeatChange({
          type: 'default',
          repeat: new RRule({
            freq: RRule.MONTHLY,
            interval: 1,
            bymonthday: new Date().getDate(),
          }),
        }),
    },
    {
      name: 'Custom repeat',
      clickHandler: () => handleRepeatChange({ type: 'custom', repeat: null }),
    },
    {
      name: 'No repeat',
      clickHandler: () => handleRepeatChange({ type: 'default', repeat: null }),
    },
  ]

  const repeatText = props.repeat ? capitaliseFirstLetter(rruleToText(props.repeat)) : 'Add repeat'

  const generateIconSize = (size: string) => {
    switch (size) {
      case 'md':
        return '12px'
      case 'sm':
        return '10px'
      case 'xs':
        return '8px'
      default:
        return '12px'
    }
  }
  const iconSize = generateIconSize(props.size)
  const ref = React.useRef()
  useOutsideClick({
    ref: ref,
    handler: () => {
      setShowMenu(false) 
      setRepeatDialogVisible(false)
    }
  })
  return (
    <Flex direction="column" minW="190px" zindex={99} w="100%">
      <Flex position="relative" direction="column" minW="190px" w="100%">
        <Button
          bg={showMenu ? 'gray.100' : 'gray.50'}
          w="100%"
          isDisabled={props.deleted || props.completed}
          fontSize={props.size ? props.size : 'md'}
          rightIcon={Icons['collapse'](iconSize, iconSize)}
          variant={'default'}
          borderRadius={5}
          width={'100%'}
          justifyContent={'space-between'}
          onClick={() => setShowMenu(!showMenu)}
        >
          {repeatText}
        </Button>
        {showMenu && (
          <MenuList ref={ref}>
            <Flex direction="column" w="100%" justifyContent="center" borderRadius="md">
              {menuItems.map((m, idx) => (
                <MenuItem
                  bg={m.name == 'Custom repeat' && repeatDialogVisible ? 'gray.100' : 'gray.50'}
                  key={idx}
                  onClick={m.clickHandler}
                >
                  {m.name}
                </MenuItem>
              ))}
            </Flex>

            {repeatDialogVisible && (
              <RepeatDialog
                onSubmit={(r) => {
                  props.onSubmit(r)
                  setRepeatDialogVisible(false)
                  setShowMenu(false)
                }}
              />
            )}
          </MenuList>
        )}
      </Flex>
    </Flex>
  )
}

export default RepeatPicker
