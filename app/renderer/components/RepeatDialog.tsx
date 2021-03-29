import React, { ReactElement, useState } from 'react'
import RRule from 'rrule'
import Button from './Button'
import DatePicker from './DatePicker'
import { formatRelativeDate } from '../utils'
import { Icons } from '../assets/icons'
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Text,
  VStack,
  Flex,
  Grid,
  GridItem,
  Button as CButton,
} from '@chakra-ui/react'
import lowerCase from 'lodash/lowerCase'
import upperFirst from 'lodash/upperFirst'

type RepeatDialogProps = {
  onSubmit: (RRule) => void
}
const RepeatDialog = (props: RepeatDialogProps): ReactElement => {
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [repeatInterval, setRepeatInterval] = useState(1)
  const [repeatIntervalType, setRepeatIntervalType] = useState(RRule.WEEKLY)
  const [endType, setEndType] = useState('never')
  const [repeatNumber, setRepeatNumber] = useState(1)

  const startDateText = startDate ? formatRelativeDate(startDate) : 'Start date'
  const endDateText = endDate ? formatRelativeDate(endDate) : 'End date'

  const handleSubmit = (): void => {
    if (endType == 'on_a_date') {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
        until: endDate,
      })
      props.onSubmit(r)
    } else if (endType == 'after_x_times') {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
        count: repeatNumber,
      })
      props.onSubmit(r)
    } else {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
      })
      props.onSubmit(r)
    }
  }

  const translateFrequencyToString = (frequency: number): string => {
    switch (frequency) {
      case 0:
        return 'Years'
        break
      case 1:
        return 'Months'
        break
      case 2:
        return 'Weeks'
        break
      case 3:
        return 'Days'
        break

      default:
        break
    }
  }
  const gridStyle = {
    direction: 'row',
    p: 1,
    m: 1,
    gap: 1,
    w: '100%',
    templateColumns: 'repeat(5, 1fr)',
    alignItems: 'center',
  }
  const menuItemStyle = {
    px: 2,
    py: 1,
    borderRadius: 4,
    fontSize: 'sm',
    bg: 'white',
  }

  return (
    <VStack
      borderRadius={5}
      border={'1px solid'}
      borderColor={'gray.100'}
      bg={'white'}
      spacing={1}
      px={3}
      py={2}
      position="absolute"
      top="30px"
      right="0px"
      zIndex="99"
      width="275px"
      boxShadow="md"
    >
      <Grid {...gridStyle}>
        <GridItem colSpan={2}>
          <Text fontSize="sm">Starts: </Text>
        </GridItem>
        <GridItem colSpan={3}>
          <DatePicker
            size="sm"
            text={startDateText}
            defaultText={'Start date'}
            onSubmit={(val) => {
              setStartDate(val)
            }}
            completed={false}
          />
        </GridItem>
      </Grid>
      <Grid {...gridStyle}>
        <GridItem colSpan={2}>
          <Text fontSize="sm">Repeats every: </Text>
        </GridItem>
        <GridItem colSpan={1}>
          <NumberInput size="xs" min={1} max={999} onChange={(s, n) => setRepeatInterval(n)}>
            <NumberInputField />
            <NumberInputStepper size="xs">
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </GridItem>
        <GridItem colSpan={2}>
          <Menu placement="bottom" gutter={0} arrowPadding={0}>
            <MenuButton
              size="sm"
              as={CButton}
              fontWeight={'normal'}
              borderRadius={5}
              variant={'subtle'}
              rightIcon={Icons['collapse'](12, 12)}
            >
              {repeatIntervalType ? translateFrequencyToString(repeatIntervalType) : 'Interval'}
            </MenuButton>
            <MenuList bg={'white'}>
              <MenuItem {...menuItemStyle} onClick={() => setRepeatIntervalType(RRule.DAILY)}>
                Days
              </MenuItem>
              <MenuItem {...menuItemStyle} onClick={() => setRepeatIntervalType(RRule.WEEKLY)}>
                Weeks
              </MenuItem>
              <MenuItem {...menuItemStyle} onClick={() => setRepeatIntervalType(RRule.MONTHLY)}>
                Months
              </MenuItem>
              <MenuItem {...menuItemStyle} onClick={() => setRepeatIntervalType(RRule.YEARLY)}>
                Years
              </MenuItem>
            </MenuList>
          </Menu>
        </GridItem>
      </Grid>
      <Grid {...gridStyle}>
        <GridItem colSpan={2}>
          <Text fontSize="sm">Ends: </Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Menu placement="bottom" gutter={0} arrowPadding={0}>
            <MenuButton
              size="sm"
              as={CButton}
              rightIcon={Icons['collapse'](12, 12)}
              fontWeight={'normal'}
              borderRadius={5}
              variant={'subtle'}
            >
              {endType ? upperFirst(lowerCase(endType)) : 'Never'}
            </MenuButton>
            <MenuList bg={'white'}>
              <MenuItem {...menuItemStyle} onClick={() => setEndType('on_a_date')}>
                On a date
              </MenuItem>
              <MenuItem {...menuItemStyle} onClick={() => setEndType('after_x_times')}>
                After X times
              </MenuItem>
              <MenuItem {...menuItemStyle} onClick={() => setEndType('never')}>
                Never
              </MenuItem>
            </MenuList>
          </Menu>
        </GridItem>
      </Grid>
      {endType == 'after_x_times' && (
        <Grid {...gridStyle}>
          <GridItem colSpan={2}>
            <Text fontSize="sm">After </Text>
          </GridItem>
          <GridItem colSpan={2}>
            <NumberInput size="xs" min={0} max={100} onChange={(s, n) => setRepeatNumber(n)}>
              <NumberInputField />
              <NumberInputStepper size="xs">
                <NumberIncrementStepper size="xs" />
                <NumberDecrementStepper size="xs" />
              </NumberInputStepper>
            </NumberInput>
          </GridItem>
          <GridItem colSpan={1}>
            <Text fontSize="sm">times </Text>
          </GridItem>
        </Grid>
      )}
      {endType == 'on_a_date' && (
        <Grid {...gridStyle}>
          <GridItem colSpan={2}>
            <Text fontSize="sm">End date: </Text>
          </GridItem>
          <GridItem colSpan={2}>
            <DatePicker
              size="sm"
              completed={false}
              text={endDateText}
              defaultText="End date"
              onSubmit={(val) => {
                setEndDate(val)
              }}
            />
          </GridItem>
        </Grid>
      )}
      <Flex direction="row" p={1} m={1} w="100%" justify="flex-end">
        <Button
          variant="primary"
          size="sm"
          text="Set Repeat"
          onClick={() => {
            handleSubmit()
          }}
        ></Button>
      </Flex>
    </VStack>
  )
}

export default RepeatDialog
