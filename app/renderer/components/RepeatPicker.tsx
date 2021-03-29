import React, { ReactElement, useState } from 'react'
import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react'
import { format } from 'date-fns'
import { RRule } from 'rrule'
import RepeatDialog from './RepeatDialog'
import { rruleToText, capitaliseFirstLetter } from '../utils'
import { Icons } from '../assets/icons'

type RepeatPickerProps = {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  repeat: RRule
  onSubmit: (value: RRule) => void
  onEscape?: () => void
  tooltipText?: string
  completed: boolean
  deleted?: boolean
}

function RepeatPicker(props: RepeatPickerProps): ReactElement {
  const [repeatDialogVisible, setRepeatDialogVisible] = useState(false)

  const handleRepeatChange = (input: RRule | null) => {
    if (input) {
      props.onSubmit(input)
      setRepeatDialogVisible(false)
      return
    } else {
      setRepeatDialogVisible(true)
      return
    }
  }
  const repeatText = props.repeat ? capitaliseFirstLetter(rruleToText(props.repeat)) : 'Add repeat'
  const tooltipText = props.repeat ? capitaliseFirstLetter(props.repeat.toText()) : 'Repeat'

  const menuItemStyle = {
    px: 2,
    py: 1,
    borderRadius: 4,
    fontSize: 'sm',
    bg: 'gray.50',
    fontWeight: 300,
    _hover: {
      fontWeight: 400,
    },
  }

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

  return (
    <>
      <Menu gutter={0} arrowPadding={0} closeOnSelect={true} closeOnBlur={true}>
        <MenuButton
          size={props.size ? props.size : 'md'}
          as={Button}
          rightIcon={Icons['collapse'](iconSize, iconSize)}
          fontWeight={'normal'}
          borderRadius={5}
          variant={'default'}
          width={'100%'}
          textAlign={'start'}
        >
          {repeatText}
        </MenuButton>
        <MenuList bg={'gray.50'}>
          <MenuItem
            {...menuItemStyle}
            onClick={() =>
              handleRepeatChange(
                new RRule({
                  freq: RRule.DAILY,
                  interval: 1,
                }),
              )
            }
          >
            Daily
          </MenuItem>
          <MenuItem
            {...menuItemStyle}
            onClick={() =>
              handleRepeatChange(
                new RRule({
                  freq: RRule.DAILY,
                  interval: 1,
                  byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
                }),
              )
            }
          >
            Weekdays
          </MenuItem>
          <MenuItem
            {...menuItemStyle}
            onClick={() =>
              handleRepeatChange(
                new RRule({
                  freq: RRule.WEEKLY,
                  interval: 1,
                  byweekday: new Date().getDay() == 0 ? 6 : new Date().getDay() - 1,
                }),
              )
            }
          >
            {'Weekly on ' + format(new Date(), 'EEE')}
          </MenuItem>
          <MenuItem
            {...menuItemStyle}
            onClick={() =>
              handleRepeatChange(
                new RRule({
                  freq: RRule.MONTHLY,
                  interval: 1,
                  bymonthday: new Date().getDate(),
                }),
              )
            }
          >
            {'Monthly on the ' + format(new Date(), 'do')}
          </MenuItem>
          <MenuItem {...menuItemStyle} onClick={() => handleRepeatChange(null)}>
            Custom repeat
          </MenuItem>
        </MenuList>
      </Menu>

      {repeatDialogVisible && (
        <RepeatDialog
          onSubmit={(r) => {
            props.onSubmit(r)
            setRepeatDialogVisible(false)
          }}
        />
      )}
    </>
  )
}

export default RepeatPicker
