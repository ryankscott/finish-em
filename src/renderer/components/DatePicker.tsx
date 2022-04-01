import { ReactElement, useState } from 'react';
import {
  Flex,
  Button,
  Text,
  Box,
  forwardRef,
  FlexProps,
  useColorMode,
  Icon,
} from '@chakra-ui/react';
import { add, sub, lastDayOfWeek } from 'date-fns';
import RDatePicker from 'react-datepicker';
import { Icons } from '../assets/icons';

type DatePickerProps = {
  completed: boolean;
  onSubmit: (d: Date | null) => void;
  text?: string;
  tooltipText?: string;
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
  tooltipText,
  defaultText,
  deleted,
  onEscape,
}: DatePickerProps): ReactElement => {
  const [dayPickerVisible, setDayPickerVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { colorMode } = useColorMode();

  const MenuList = forwardRef<FlexProps, 'div'>((props, ref) => (
    <Flex
      direction="row"
      shadow="md"
      py={2}
      px={dayPickerVisible ? 2 : 0}
      border="1px solid"
      borderColor={colorMode === 'light' ? 'gray.100' : 'gray.900'}
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      borderRadius="md"
      position="absolute"
      zIndex={99}
      top="36px"
      right="-2px"
      minW="190px"
      transition="0.2s all ease-in-out"
      justifyContent="center"
      ref={ref}
      {...props}
    >
      {props.children}
    </Flex>
  ));

  type MenuItemProps = FlexProps;
  const MenuItem = (props: MenuItemProps) => {
    return (
      <Flex
        px={2}
        my={0.5}
        py={1.5}
        _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.900' }}
        cursor="pointer"
        bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
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
  };

  const handleDayChange = (input: Date | null) => {
    onSubmit(input);
    setDayPickerVisible(false);
    setShowMenu(false);
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

  return (
    <Flex direction="column" minW="190px" w="100%">
      <Flex position="relative" direction="column" minW="190px" w="100%">
        <Button
          w="100%"
          variant="default"
          isDisabled={deleted || completed}
          fontSize="md"
          rightIcon={
            <Icon p={0} m={0}>
              {Icons.collapse('24px', '24px')}{' '}
            </Icon>
          }
          borderRadius={5}
          width="100%"
          justifyContent="space-between"
          onClick={() => setShowMenu(!showMenu)}
          fontWeight="normal"
          zIndex={1}
        >
          {text || defaultText}
        </Button>
        {showMenu && (
          <MenuList>
            <Flex
              direction="column"
              w="100%"
              justifyContent="center"
              borderRadius="md"
            >
              {menuItems.map((m) => (
                <MenuItem key={m.name} onClick={m.clickHandler}>
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
