import React, { ReactElement, useState } from 'react'
import { Menu, MenuButton, MenuList, MenuItem, Button, Box } from '@chakra-ui/react'
import { add, sub, lastDayOfWeek } from 'date-fns'
import RDatePicker from 'react-datepicker'
import { Icons } from '../assets/icons'

type DatePickerProps = {
  text?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  defaultText?: string
  onSubmit: (d: Date) => void
  onEscape?: () => void
  tooltipText?: string
  completed: boolean
  deleted?: boolean
}

const DatePicker = (props: DatePickerProps): ReactElement => {
  const [dayPickerVisible, setDayPickerVisible] = useState(false)

  const handleDayChange = (input: Date) => {
    props.onSubmit(input)
    setDayPickerVisible(false)
    return
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
          {props.text ? props.text : props.defaultText}
        </MenuButton>
        <MenuList width={'235px'} bg={'gray.50'}>
          <MenuItem fontSize={'md'} onClick={() => handleDayChange(new Date())}>
            Today
          </MenuItem>
          <MenuItem fontSize={'md'} onClick={() => handleDayChange(add(new Date(), { days: 1 }))}>
            Tomorrow
          </MenuItem>
          <MenuItem
            fontSize={'md'}
            onClick={() =>
              handleDayChange(
                sub(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
                  days: 2,
                }),
              )
            }
          >
            End of week
          </MenuItem>
          <MenuItem
            fontSize={'md'}
            onClick={() =>
              handleDayChange(
                add(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
                  days: 1,
                }),
              )
            }
          >
            Next week
          </MenuItem>
          <MenuItem
            fontSize={'md'}
            onClick={(e) => {
              e.preventDefault()
              setDayPickerVisible(true)
            }}
          >
            Custom Date
          </MenuItem>
        </MenuList>
      </Menu>
      <Box position={'absolute'}>
        {dayPickerVisible && (
          <RDatePicker
            utcOffset={new Date().getTimezoneOffset()}
            inline
            tabIndex={0}
            onChange={handleDayChange}
          />
        )}
      </Box>
    </>
  )
}

export default DatePicker
