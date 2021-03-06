import React, { ReactElement, useState } from 'react'
import { Menu, MenuButton, MenuList, MenuItem, Button, Box } from '@chakra-ui/react'
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

function RepeatPicker(props: RepeatPickerProps): ReactElement {
  const [repeatDialogVisible, setRepeatDialogVisible] = useState(false)

  type repeatOption = {
    type: 'custom' | 'default'
    repeat: RRule | null
  }

  const handleRepeatChange = (input: repeatOption) => {
    console.log(input)
    if (input.type == 'default') {
      props.onSubmit(input.repeat)
      setRepeatDialogVisible(false)
      return
    } else {
      setRepeatDialogVisible(true)
      return
    }
  }
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

  return (
    <Box w={'100%'} position="relative">
      <Menu gutter={0} arrowPadding={0} closeOnSelect={true} closeOnBlur={true}>
        <MenuButton
          variant={'default'}
          isDisabled={props.deleted || props.completed}
          fontSize={props.size ? props.size : 'md'}
          as={Button}
          rightIcon={Icons['collapse'](iconSize, iconSize)}
          borderRadius={5}
          width={'100%'}
          textAlign={'start'}
          fontWeight={'normal'}
        >
          {repeatText}
        </MenuButton>
        <MenuList minW={'188px'}>
          <MenuItem
            fontSize={'md'}
            onClick={() =>
              handleRepeatChange({
                type: 'default',
                repeat: new RRule({
                  freq: RRule.DAILY,
                  interval: 1,
                }),
              })
            }
          >
            Daily
          </MenuItem>
          <MenuItem
            fontSize={'md'}
            onClick={() =>
              handleRepeatChange({
                type: 'default',
                repeat: new RRule({
                  freq: RRule.DAILY,
                  interval: 1,
                  byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
                }),
              })
            }
          >
            Weekdays
          </MenuItem>
          <MenuItem
            fontSize={'md'}
            onClick={() =>
              handleRepeatChange({
                type: 'default',
                repeat: new RRule({
                  freq: RRule.WEEKLY,
                  interval: 1,
                  byweekday: new Date().getDay() == 0 ? 6 : new Date().getDay() - 1,
                }),
              })
            }
          >
            {'Weekly on ' + format(new Date(), 'EEE')}
          </MenuItem>
          <MenuItem
            fontSize={'md'}
            onClick={() =>
              handleRepeatChange({
                type: 'default',
                repeat: new RRule({
                  freq: RRule.MONTHLY,
                  interval: 1,
                  bymonthday: new Date().getDate(),
                }),
              })
            }
          >
            {'Monthly on the ' + format(new Date(), 'do')}
          </MenuItem>
          <MenuItem
            fontSize={'md'}
            onClick={() => handleRepeatChange({ type: 'custom', repeat: null })}
          >
            Custom repeat
          </MenuItem>
          <MenuItem
            fontSize={'md'}
            onClick={() => handleRepeatChange({ type: 'default', repeat: null })}
          >
            No repeat
          </MenuItem>
        </MenuList>
      </Menu>
      {repeatDialogVisible && (
        <RepeatDialog
          onClose={() => setRepeatDialogVisible(false)}
          onSubmit={(r) => {
            props.onSubmit(r)
            setRepeatDialogVisible(false)
          }}
        />
      )}
    </Box>
  )
}

export default RepeatPicker
