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
import { Icons } from 'renderer/assets/icons';

type DatePickerProps = {
  completed: boolean;
  onSubmit: (d: Date | null) => void;
  text?: string;
  defaultText?: string;
  deleted?: boolean;
  onEscape?: () => void;
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
        variant="default"
        isDisabled={deleted || completed}
        fontSize="md"
        rightIcon={<Icon p={0} m={0} as={Icons.collapse} />}
        borderRadius={5}
        width="100%"
        justifyContent="space-between"
        onClick={() => {
          setShowMenu(!showMenu);
          setDayPickerVisible(false);
        }}
        fontWeight="normal"
        textAlign="start"
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
              // @ts-ignore
              utcOffset={new Date().getTimezoneOffset()}
              inline
              tabIndex={0}
              onChange={handleDayChange}
            />
          </Box>
        )}
      </MenuList>
    </Menu>
  );
};

export default DatePicker;
