import { ReactElement, useState } from 'react';
import {
  Button,
  Box,
  Icon,
  MenuButton,
  Menu,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { add, sub, lastDayOfWeek } from 'date-fns';
import RDatePicker from 'react-datepicker';
import { Icons } from '../assets/icons';

type DatePickerProps = {
  completed: boolean;
  onSubmit: (d: Date | null) => void;
  text?: string;
  defaultText?: string;
  deleted?: boolean;
  onEscape?: () => void;
  forceDark?: boolean;
};

type MenuItemType = {
  name: string;
  clickHandler: () => void;
};

const DatePicker = ({
  completed,
  onSubmit,
  text,
  defaultText,
  deleted,
  onEscape,
  forceDark,
}: DatePickerProps): ReactElement => {
  const [dayPickerVisible, setDayPickerVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDayChange = (input: Date | null) => {
    setDayPickerVisible(false);
    setShowMenu(false);
    onSubmit(input);
  };

  const menuItems: MenuItemType[] = [
    {
      name: 'Today',
      clickHandler: () => handleDayChange(new Date()),
    },
    {
      name: 'Tomorrow',
      clickHandler: () => handleDayChange(add(new Date(), { days: 1 })),
    },
    {
      name: 'End of week',
      clickHandler: () =>
        handleDayChange(
          sub(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
            days: 2,
          })
        ),
    },
    {
      name: 'Next week',
      clickHandler: () =>
        handleDayChange(
          add(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
            days: 1,
          })
        ),
    },
    {
      name: 'Custom date',
      clickHandler: () => {
        setDayPickerVisible(!dayPickerVisible);
      },
    },
    {
      name: 'No date',
      clickHandler: () => handleDayChange(null),
    },
  ];

  return (
    <Menu matchWidth>
      <MenuButton
        as={Button}
        w="100%"
        isDisabled={deleted || completed}
        fontSize="md"
        rightIcon={<Icon p={0} m={0} as={Icons.collapse} />}
        borderRadius="md"
        width="100%"
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
        {!dayPickerVisible &&
          menuItems.map((m) => (
            <MenuItem
              key={m.name}
              onClick={m.clickHandler}
              closeOnSelect={m.name !== 'Custom date'}
            >
              {m.name}
            </MenuItem>
          ))}
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
