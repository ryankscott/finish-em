import { ReactElement, useState } from 'react';
import {
  Flex,
  Button,
  Text,
  Box,
  forwardRef,
  FlexProps,
} from '@chakra-ui/react';
import { add, sub, lastDayOfWeek } from 'date-fns';
import RDatePicker from 'react-datepicker';
import { Icons } from '../assets/icons';

type DatePickerProps = {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  defaultText?: string;
  onSubmit: (d: Date) => void;
  onEscape?: () => void;
  tooltipText?: string;
  completed: boolean;
  deleted?: boolean;
};

type MenuItemType = {
  name: string;
  clickHandler: () => void;
};

// TODO: Refactor me
const DatePicker = (props: DatePickerProps): ReactElement => {
  const [dayPickerVisible, setDayPickerVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const MenuList = forwardRef<FlexProps, 'div'>((props, ref) => (
    <Flex
      direction="row"
      shadow="md"
      py={2}
      px={dayPickerVisible ? 2 : 0}
      border="1px solid"
      borderColor="gray.100"
      borderRadius="md"
      position="absolute"
      zIndex={2}
      bg="gray.50"
      top="36px"
      right="-2px"
      minW="190px"
      transition={'0.2s all ease-in-out'}
      justifyContent="center"
      ref={ref}
      {...props}
    >
      {props.children}
    </Flex>
  ));

  const MenuItem = (props) => (
    <Flex
      px={2}
      my={0.5}
      py={1.5}
      _hover={{ bg: 'gray.100' }}
      cursor="pointer"
      bg="gray.50"
      zIndex={4}
      justifyContent={dayPickerVisible ? 'center' : 'start'}
      minW={dayPickerVisible ? '110px' : '190px'}
      {...props}
    >
      <Text fontSize="md" px={2}>
        {props.children}
      </Text>
    </Flex>
  );

  const handleDayChange = (input: Date | null) => {
    props.onSubmit(input);
    setDayPickerVisible(false);
    setShowMenu(false);
    return;
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
      clickHandler: () => setDayPickerVisible(!dayPickerVisible),
    },
    {
      name: 'No date',
      clickHandler: () => handleDayChange(null),
    },
  ];

  const generateIconSize = (size: string) => {
    switch (size) {
      case 'md':
        return '12px';
      case 'sm':
        return '10px';
      case 'xs':
        return '8px';
      default:
        return '12px';
    }
  };
  const iconSize = generateIconSize(props.size);

  return (
    <Flex direction="column" minW="190px" zindex={99} w="100%">
      <Flex position="relative" direction="column" minW="190px" w="100%">
        <Button
          bg={showMenu ? 'gray.100' : 'gray.50'}
          w="100%"
          isDisabled={props.deleted || props.completed}
          fontSize={props.size ? props.size : 'md'}
          rightIcon={Icons['collapse'](iconSize, iconSize)}
          variant={'default'}
          borderRadius={5}
          width={'100%'}
          justifyContent={'space-between'}
          onClick={() => setShowMenu(!showMenu)}
        >
          {props.text ? props.text : props.defaultText}
        </Button>
        {showMenu && (
          <MenuList>
            <Flex
              direction="column"
              w="100%"
              justifyContent="center"
              borderRadius="md"
            >
              {menuItems.map((m, idx) => (
                <MenuItem
                  bg={
                    m.name == 'Custom date' && dayPickerVisible
                      ? 'gray.100'
                      : 'gray.50'
                  }
                  key={idx}
                  onClick={m.clickHandler}
                >
                  {m.name}
                </MenuItem>
              ))}
            </Flex>
            {dayPickerVisible && (
              <Box p={2}>
                <RDatePicker
                  utcOffset={new Date().getTimezoneOffset()}
                  inline
                  tabIndex={0}
                  onChange={handleDayChange}
                />
              </Box>
            )}
          </MenuList>
        )}
      </Flex>
    </Flex>
  );
};

export default DatePicker;