import { ReactElement, useState } from 'react';
import RRule from 'rrule';
import {
  NumberInput,
  NumberInputField,
  Menu,
  MenuItem,
  MenuButton,
  MenuList,
  Text,
  Flex,
  Button,
  Icon,
  FlexProps,
  TextProps,
  forwardRef,
} from '@chakra-ui/react';
import lowerCase from 'lodash/lowerCase';
import upperFirst from 'lodash/upperFirst';
import DatePicker from './DatePicker';
import { formatRelativeDate } from '../utils';
import { Icons } from '../assets/icons';

type RepeatDialogProps = {
  onSubmit: (rule: RRule) => void;
};
const RepeatDialog = ({ onSubmit }: RepeatDialogProps): ReactElement => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [repeatInterval, setRepeatInterval] = useState(1);
  const [repeatIntervalType, setRepeatIntervalType] = useState(RRule.WEEKLY);
  const [endType, setEndType] = useState('never');
  const [repeatNumber, setRepeatNumber] = useState(1);

  const startDateText = startDate
    ? formatRelativeDate(startDate)
    : 'Start date';
  const endDateText = endDate ? formatRelativeDate(endDate) : 'End date';

  const handleSubmit = (): void => {
    if (endType === 'on_a_date') {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
        until: endDate,
      });
      onSubmit(r);
    } else if (endType === 'after_x_times') {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
        count: repeatNumber,
      });
      onSubmit(r);
    } else {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
      });
      onSubmit(r);
    }
  };

  const translateFrequencyToString = (frequency: number): string => {
    switch (frequency) {
      case 0:
        return 'Years';
      case 1:
        return 'Months';
      case 2:
        return 'Weeks';
      case 3:
        return 'Days';
      default:
        return '';
    }
  };

  const Label = forwardRef<TextProps, 'p'>((props, ref) => (
    <Text
      fontSize="md"
      w="20%"
      minW="90px"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  ));

  const Option = forwardRef<FlexProps, 'div'>((props, ref) => (
    <Flex
      w="100%"
      justifyContent="space-between"
      alignItems="center"
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  ));

  return (
    <Flex
      direction="column"
      borderRadius="md"
      bg="white"
      p={2}
      mx={2}
      position="relative"
      zIndex="99"
      width="320px"
    >
      <Option>
        <Label>Starts: </Label>
        <DatePicker
          text={startDateText}
          defaultText="Start date"
          onSubmit={(val) => {
            setStartDate(val);
          }}
          completed={false}
        />
      </Option>
      <Option>
        <Label>Repeats every: </Label>
        <Flex justifyContent="start" alignItems="center" w="100%" pl="5px">
          <NumberInput
            size="sm"
            height="32px"
            width="60px"
            borderColor="transparent"
            defaultValue={1}
            min={1}
            max={999}
            borderRadius="5px"
            _hover={{ backgroundColor: 'gray.100', cursor: 'pointer' }}
            onChange={(s, n) => setRepeatInterval(n)}
          >
            <NumberInputField
              color="gray.900"
              fontSize="md"
              fontWeight="normal"
              borderRadius="5px"
              p={2}
              _hover={{ borderColor: 'gray.100' }}
            />
          </NumberInput>
          <Menu placement="bottom" gutter={0} arrowPadding={0}>
            <MenuButton
              height="32px"
              size="md"
              as={Button}
              fontWeight="normal"
              borderRadius="md"
              variant="subtle"
              _hover={{ bg: 'gray.100' }}
              rightIcon={<Icon as={Icons.collapse} />}
              width="100%"
              textAlign="start"
            >
              {repeatIntervalType
                ? translateFrequencyToString(repeatIntervalType)
                : 'Interval'}
            </MenuButton>
            <MenuList bg="white">
              <MenuItem onClick={() => setRepeatIntervalType(RRule.DAILY)}>
                Days
              </MenuItem>
              <MenuItem onClick={() => setRepeatIntervalType(RRule.WEEKLY)}>
                Weeks
              </MenuItem>
              <MenuItem onClick={() => setRepeatIntervalType(RRule.MONTHLY)}>
                Months
              </MenuItem>
              <MenuItem onClick={() => setRepeatIntervalType(RRule.YEARLY)}>
                Years
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Option>
      <Option>
        <Label>Ends: </Label>
        <Menu placement="bottom" gutter={0} arrowPadding={0}>
          <MenuButton
            height="32px"
            size="md"
            as={Button}
            rightIcon={<Icon as={Icons.collapse} />}
            fontWeight="normal"
            borderRadius="md"
            variant="subtle"
            _hover={{ bg: 'gray.100' }}
            width="100%"
            textAlign="start"
          >
            {endType ? upperFirst(lowerCase(endType)) : 'Never'}
          </MenuButton>
          <MenuList bg="white">
            <MenuItem onClick={() => setEndType('on_a_date')}>
              On a date
            </MenuItem>
            <MenuItem onClick={() => setEndType('after_x_times')}>
              After X times
            </MenuItem>
            <MenuItem onClick={() => setEndType('never')}>Never</MenuItem>
          </MenuList>
        </Menu>
      </Option>
      {endType === 'after_x_times' && (
        <Option>
          <Label>After: </Label>
          <Flex justifyContent="start" alignItems="center" w="100%" pl="5px">
            <NumberInput
              size="sm"
              height="32px"
              width="60px"
              borderColor="transparent"
              defaultValue={1}
              min={1}
              max={999}
              borderRadius="5px"
              _hover={{ backgroundColor: 'gray.100', cursor: 'pointer' }}
              onChange={(_, n) => setRepeatNumber(n)}
            >
              <NumberInputField
                color="gray.900"
                fontSize="md"
                fontWeight="normal"
                borderRadius="5px"
                p={2}
                _hover={{ borderColor: 'gray.100' }}
              />
            </NumberInput>
            <Text
              fontSize="md"
              width="100%"
              lineHeight="32px"
              height="32px"
              pl={2}
            >
              times{' '}
            </Text>
          </Flex>
        </Option>
      )}
      {endType === 'on_a_date' && (
        <Option>
          <Label>End date: </Label>
          <DatePicker
            completed={false}
            text={endDateText}
            defaultText="End date"
            onSubmit={(val) => {
              setEndDate(val);
            }}
          />
        </Option>
      )}
      <Flex direction="row" p={1} m={1} w="100%" justify="flex-end">
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            handleSubmit();
          }}
        >
          Set Repeat
        </Button>
      </Flex>
    </Flex>
  );
};

export default RepeatDialog;
