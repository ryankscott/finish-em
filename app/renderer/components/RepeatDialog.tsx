import React, { ReactElement, useState } from 'react'
import RRule from 'rrule'
import Button from './Button'
import DatePicker from './DatePicker'
import { formatRelativeDate } from '../utils'
import { Icons } from '../assets/icons'
import {
  NumberInput,
  NumberInputField,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  VStack,
  Text,
  Flex,
  CloseButton,
  Button as CButton,
} from '@chakra-ui/react'
import lowerCase from 'lodash/lowerCase'
import upperFirst from 'lodash/upperFirst'

type RepeatDialogProps = {
  onSubmit: (rule: RRule) => void
  onClose: () => void
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
      case 1:
        return 'Months'
      case 2:
        return 'Weeks'
      case 3:
        return 'Days'
      default:
        break
    }
  }

  const labelStyle = {
    fontSize: 'sm',
    w: '20%',
    minW: '90px',
  }

  const optionStyle = {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  }

  return (
    <VStack
      borderRadius={5}
      border={'1px solid'}
      borderColor={'gray.100'}
      bg={'white'}
      spacing={1}
      px={4}
      py={2}
      position="absolute"
      top="38px"
      right="-2px"
      zIndex="99"
      width="290px"
      boxShadow="md"
    >
      <Flex w={'100%'} justifyContent="flex-end" py={2}>
        <CloseButton size="xs" onClick={props.onClose} />
      </Flex>
      <Flex {...optionStyle}>
        <Text {...labelStyle}>Starts: </Text>
        <DatePicker
          size="sm"
          text={startDateText}
          defaultText={'Start date'}
          onSubmit={(val) => {
            setStartDate(val)
          }}
          completed={false}
        />
      </Flex>
      <Flex {...optionStyle}>
        <Text {...labelStyle}>Repeats every: </Text>
        <Flex justifyContent="start" alignItems="center" w={'100%'} pl="5px">
          <NumberInput
            size="sm"
            height="32px"
            width="60px"
            borderColor={'transparent'}
            defaultValue={1}
            min={1}
            max={999}
            borderRadius="5px"
            _hover={{ backgroundColor: 'gray.100', cursor: 'pointer' }}
            onChange={(s, n) => setRepeatInterval(n)}
          >
            <NumberInputField
              color="gray.900"
              fontSize="sm"
              fontWeight="normal"
              borderRadius={'5px'}
              p={2}
              _hover={{ borderColor: 'gray.100' }}
            />
          </NumberInput>
          <Menu placement="bottom" gutter={0} arrowPadding={0}>
            <MenuButton
              height="32px"
              size="sm"
              as={CButton}
              fontWeight={'normal'}
              borderRadius={5}
              variant={'subtle'}
              _hover={{ bg: 'gray.100' }}
              rightIcon={Icons['collapse'](12, 12)}
              width="100%"
              textAlign="start"
            >
              {repeatIntervalType ? translateFrequencyToString(repeatIntervalType) : 'Interval'}
            </MenuButton>
            <MenuList bg={'white'}>
              <MenuItem onClick={() => setRepeatIntervalType(RRule.DAILY)}>Days</MenuItem>
              <MenuItem onClick={() => setRepeatIntervalType(RRule.WEEKLY)}>Weeks</MenuItem>
              <MenuItem onClick={() => setRepeatIntervalType(RRule.MONTHLY)}>Months</MenuItem>
              <MenuItem onClick={() => setRepeatIntervalType(RRule.YEARLY)}>Years</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
      <Flex {...optionStyle}>
        <Text {...labelStyle}>Ends: </Text>
        <Menu placement="bottom" gutter={0} arrowPadding={0}>
          <MenuButton
            height="32px"
            size="sm"
            as={CButton}
            rightIcon={Icons['collapse'](12, 12)}
            fontWeight={'normal'}
            borderRadius={5}
            variant={'subtle'}
            _hover={{ bg: 'gray.100' }}
            width="100%"
            textAlign="start"
          >
            {endType ? upperFirst(lowerCase(endType)) : 'Never'}
          </MenuButton>
          <MenuList bg={'white'}>
            <MenuItem onClick={() => setEndType('on_a_date')}>On a date</MenuItem>
            <MenuItem onClick={() => setEndType('after_x_times')}>After X times</MenuItem>
            <MenuItem onClick={() => setEndType('never')}>Never</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      {endType == 'after_x_times' && (
        <Flex {...optionStyle}>
          <Text {...labelStyle}>After: </Text>
          <Flex justifyContent="start" alignItems="center" w={'100%'} pl={'5px'}>
            <NumberInput
              size="sm"
              height="32px"
              width="60px"
              borderColor={'transparent'}
              defaultValue={1}
              min={1}
              max={999}
              borderRadius="5px"
              _hover={{ backgroundColor: 'gray.100', cursor: 'pointer' }}
              onChange={(s, n) => setRepeatNumber(n)}
            >
              <NumberInputField
                color="gray.900"
                fontSize="sm"
                fontWeight="normal"
                borderRadius={'5px'}
                p={2}
                _hover={{ borderColor: 'gray.100' }}
              />
            </NumberInput>
            <Text fontSize="sm" width="100%" lineHeight="32px" height="32px" pl={2}>
              times{' '}
            </Text>
          </Flex>
        </Flex>
      )}
      {endType == 'on_a_date' && (
        <Flex {...optionStyle}>
          <Text {...labelStyle}>End date: </Text>
          <DatePicker
            size="sm"
            completed={false}
            text={endDateText}
            defaultText="End date"
            onSubmit={(val) => {
              setEndDate(val)
            }}
          />
        </Flex>
      )}
      <Flex direction="row" p={1} m={1} w="100%" justify="flex-end">
        <Button
          variant="primary"
          size="md"
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
