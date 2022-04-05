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
import { add, sub, lastDayOfWeek, format } from 'date-fns';
import RDatePicker from 'react-datepicker';
import { Icons } from 'renderer/assets/icons';

type CustomDatePickerProps = {
  completed: boolean;
  onSubmit: (d: string) => void;
  text?: string;
  defaultText?: string;
  deleted?: boolean;
  onEscape?: () => void;
};

const CustomDatePicker = ({
  completed,
  onSubmit,
  text,
  defaultText,
  deleted,
  onEscape,
}: CustomDatePickerProps): ReactElement => {
  const [dayPickerVisible, setDayPickerVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDayChange = (input: string) => {
    setDayPickerVisible(false);
    setShowMenu(false);
    onSubmit(input);
  };

  type MenuItemType = {
    name: string;
    clickHandler: () => void;
  };
  const menuItems: MenuItemType[] = [
    {
      name: 'Today',
      clickHandler: () => handleDayChange('Today'),
    },
    {
      name: 'Tomorrow',
      clickHandler: () => handleDayChange('Tomorrow'),
    },
    {
      name: 'Week',
      clickHandler: () => handleDayChange('This week'),
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
              onChange={(d: Date) => {
                console.log('heres');
                handleDayChange(format(d, 'yyyy-MM-dd'));
              }}
            />
          </Box>
        )}
      </MenuList>
    </Menu>
  );
};

export default CustomDatePicker;
