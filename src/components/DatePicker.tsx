import { ReactElement, useState } from 'react';
import {
  Flex,
  Button,
  Box,
  Icon,
  MenuButton,
  Menu,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react';
import { add, lastDayOfWeek } from 'date-fns';
import RDatePicker from 'react-datepicker';
import './styled/ReactDatePicker.css';
import { Icons } from '../assets/icons';
import { DayOfWeekPicker } from './DayOfWeekPicker';

type DatePickerProps = {
  completed: boolean;
  onSubmit: (d: Date | null) => void;
  text?: string;
  defaultText?: string;
  deleted?: boolean;
  onEscape?: () => void;
  forceDark?: boolean;
};

const DatePicker = ({
  completed,
  onSubmit,
  text,
  defaultText,
  deleted,
  forceDark,
}: DatePickerProps): ReactElement => {
  const [dayPickerVisible, setDayPickerVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDayChange = (input: Date | null) => {
    setDayPickerVisible(false);
    setShowMenu(false);
    onSubmit(input);
  };

  return (
    <Menu flip={false} offset={[0, 4]} placement={'bottom-end'}>
      <MenuButton
        as={Button}
        w="100%"
        isDisabled={deleted || completed}
        fontSize="md"
        rightIcon={<Icon p={0} m={0} as={Icons.collapse} />}
        borderRadius="md"
        justifyContent="space-between"
        onClick={() => {
          setShowMenu(!showMenu);
          setDayPickerVisible(false);
        }}
        fontWeight="normal"
        textAlign="start"
        variant={forceDark ? 'dark' : 'default'}
      >
        {text || defaultText}
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => handleDayChange(new Date())}>Today</MenuItem>

        <MenuItem closeOnSelect={false}>
          <Flex direction="column">
            <Text pb={2}>This week</Text>
            <DayOfWeekPicker
              selectedDays={[]}
              onSelect={(days: number[]) => {
                const today = new Date();
                const currentDay = today.getDay();
                const diff = days?.[0] - currentDay;
                today.setDate(today.getDate() + (diff + 1));
                handleDayChange(today);
              }}
            />
          </Flex>
        </MenuItem>
        <MenuItem
          onClick={() =>
            handleDayChange(
              add(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
                days: 1,
              })
            )
          }
        >
          Next week
        </MenuItem>

        <MenuItem
          closeOnSelect={false}
          onClick={() => setDayPickerVisible(!dayPickerVisible)}
        >
          Custom Date
        </MenuItem>

        <MenuItem onClick={() => handleDayChange(null)}>No date</MenuItem>

        {dayPickerVisible && (
          <Box mt={-3} mb={-4} pb={-2}>
            <RDatePicker
              inline
              tabIndex={0}
              onChange={(d: Date) => {
                const now = new Date();

                // TODO: #430 This is a hack fix to add the current time to the date, this still doesn't fix the underlying problem
                const dateWithTime = add(d, {
                  hours: now.getHours(),
                  minutes: now.getMinutes(),
                });
                handleDayChange(dateWithTime);
              }}
            />
          </Box>
        )}
      </MenuList>
    </Menu>
  );
};

export default DatePicker;
