import { ReactElement, useEffect, useState } from 'react';
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

type RepeatTimesInputProps = {
  defaultValue: number;
  onChange: (afterNumber: number) => void;
};

const RepeatTimesInput = ({
  defaultValue,
  onChange,
}: RepeatTimesInputProps) => (
  <Flex justifyContent="start" alignItems="center" w="100%" pl="5px">
    <NumberInput
      size="sm"
      height="32px"
      width="60px"
      borderColor="transparent"
      defaultValue={defaultValue}
      min={1}
      max={999}
      borderRadius="5px"
      _hover={{ backgroundColor: 'gray.100', cursor: 'pointer' }}
      onChange={(_, n) => {
        if (!Number.isNaN(n)) {
          onChange(n);
        }
      }}
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
    <Text fontSize="md" width="100%" lineHeight="32px" height="32px" pl={2}>
      times
    </Text>
  </Flex>
);

type RepeatNumberInputProps = {
  defaultValue: number;
  onChange: (repeatNumber: number) => void;
};
const RepeatNumberInput = ({
  defaultValue,
  onChange,
}: RepeatNumberInputProps) => (
  <NumberInput
    size="sm"
    height="32px"
    width="60px"
    borderColor="transparent"
    defaultValue={defaultValue}
    max={999}
    borderRadius="5px"
    _hover={{ backgroundColor: 'gray.100', cursor: 'pointer' }}
    onChange={(_, vn) => {
      if (!Number.isNaN(vn)) {
        onChange(vn);
      }
    }}
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
);

type RepeatDialogProps = {
  repeat: RRule;
  onSubmit: (rule: RRule) => void;
};

type EndType = 'never' | 'on_a_date' | 'after_x_times';

const RepeatDialog = ({
  repeat,
  onSubmit,
}: RepeatDialogProps): ReactElement => {
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [repeatInterval, setRepeatInterval] = useState<number>(1);
  const [repeatIntervalType, setRepeatIntervalType] = useState(RRule.WEEKLY);
  const [endType, setEndType] = useState<EndType>('never');
  const [repeatTimes, setRepeatTimes] = useState(1);

  const startDateText = startDate
    ? formatRelativeDate(startDate)
    : 'Start date';

  useEffect(() => {
    setStartDate(repeat.options.dtstart);
    setRepeatInterval(repeat.options.interval);
    setRepeatIntervalType(repeat.options.freq);

    if (repeat.options.until) {
      setEndType('on_a_date');
      setEndDate(repeat.options.until);
    }

    if (repeat.options.count) {
      setEndType('after_x_times');
      setRepeatTimes(repeat.options.count);
    }
  }, [repeat]);

  const endDateText = endDate ? formatRelativeDate(endDate) : 'End date';

  const handleSubmit = (): void => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // This is terrible and I hate it. Because the RRULE library seems to be doing some sort of time conversion
    // and I haven't worked out what it is, I'm going to hack this by manually setting the hours.
    // This means when it changes the timezone from local to UTC it should always end up with the same date

    startDate?.setHours(12);
    endDate?.setHours(12);

    if (endType === 'on_a_date') {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
        until: endDate,
        tzid: timezone,
      });
      onSubmit(r);
    } else if (endType === 'after_x_times') {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
        count: repeatTimes,
        tzid: timezone,
      });
      onSubmit(r);
    } else {
      const r = new RRule({
        freq: repeatIntervalType,
        interval: repeatInterval,
        dtstart: startDate,
        tzid: timezone,
      });
      onSubmit(r);
      console.log(r);
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
          defaultText="Start date"
          text={startDateText}
          onSubmit={(d) => setStartDate(d)}
          completed={false}
        />
      </Option>
      <Option>
        <Label>Repeats every: </Label>
        <RepeatNumberInput
          defaultValue={repeatInterval}
          onChange={(n) => {
            setRepeatInterval(n);
          }}
        />
        <Flex justifyContent="start" alignItems="center" w="100%" pl="5px">
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
            <MenuList>
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
          <RepeatTimesInput
            defaultValue={repeatTimes}
            onChange={(v) => setRepeatTimes(v)}
          />
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
