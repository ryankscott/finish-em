import { ReactElement, useState } from 'react';
import {
  Flex,
  Text,
  Button,
  forwardRef,
  FlexProps,
  useColorMode,
  Icon,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { RRule } from 'rrule';
import RepeatDialog from './RepeatDialog';
import { rruleToText, capitaliseFirstLetter } from '../utils';
import { Icons } from '../assets/icons';

type RepeatPickerProps = {
  repeat: RRule | null;
  onSubmit: (value: RRule) => void;
  completed: boolean;
  onEscape?: () => void;
  tooltipText?: string;
  deleted?: boolean;
};
type MenuItemType = {
  name: string;
  clickHandler: () => void;
};

const RepeatPicker = ({
  repeat,
  onSubmit,
  completed,
  onEscape,
  tooltipText,
  deleted,
}: RepeatPickerProps): ReactElement => {
  const [showMenu, setShowMenu] = useState(false);
  const [repeatDialogVisible, setRepeatDialogVisible] = useState(false);
  const { colorMode } = useColorMode();

  type RepeatOption = {
    type: 'custom' | 'default';
    repeat: RRule | null;
  };

  type MenuItemProps = FlexProps & { text: string };
  const MenuItem = ({ text, ...props }: MenuItemProps) => (
    <Flex
      px={2}
      my={0.5}
      py={1.5}
      _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.900' }}
      cursor="pointer"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      zIndex={4}
      justifyContent="start"
      minW={repeatDialogVisible ? '130px' : '192'}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      <Text fontSize="md" px={2}>
        {text}
      </Text>
    </Flex>
  );

  const MenuList = forwardRef<FlexProps, 'div'>((props, ref) => (
    <Flex
      direction="row"
      shadow="md"
      py={2}
      px={repeatDialogVisible ? 2 : 0}
      border="1px solid"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
      borderColor={colorMode === 'light' ? 'gray.100' : 'gray.900'}
      borderRadius="md"
      position="absolute"
      zIndex={2}
      top="36px"
      right="-2px"
      minW="190px"
      transition="0.2s all ease-in-out"
      justifyContent="center"
      ref={ref}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  ));
  const handleRepeatChange = (input: RepeatOption) => {
    if (input.type === 'default') {
      props.onSubmit(input.repeat);
      setRepeatDialogVisible(false);
      setShowMenu(false);
    } else {
      setRepeatDialogVisible(true);
    }
  };

  const menuItems: MenuItemType[] = [
    {
      name: 'Daily',
      clickHandler: () =>
        handleRepeatChange({
          type: 'default',
          repeat: new RRule({
            freq: RRule.DAILY,
            interval: 1,
          }),
        }),
    },
    {
      name: 'Weekdays',
      clickHandler: () =>
        handleRepeatChange({
          type: 'default',
          repeat: new RRule({
            freq: RRule.DAILY,
            interval: 1,
            byweekday: [RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR],
          }),
        }),
    },
    {
      name: `Weekly on ${format(new Date(), 'EEE')}`,
      clickHandler: () =>
        handleRepeatChange({
          type: 'default',
          repeat: new RRule({
            freq: RRule.WEEKLY,
            interval: 1,
            byweekday: new Date().getDay() == 0 ? 6 : new Date().getDay() - 1,
          }),
        }),
    },
    {
      name: `Monthly on the ${format(new Date(), 'do')}`,
      clickHandler: () =>
        handleRepeatChange({
          type: 'default',
          repeat: new RRule({
            freq: RRule.MONTHLY,
            interval: 1,
            bymonthday: new Date().getDate(),
          }),
        }),
    },
    {
      name: 'Custom repeat',
      clickHandler: () => handleRepeatChange({ type: 'custom', repeat: null }),
    },
    {
      name: 'No repeat',
      clickHandler: () => handleRepeatChange({ type: 'default', repeat: null }),
    },
  ];

  const repeatText = repeat
    ? capitaliseFirstLetter(rruleToText(repeat))
    : 'Add repeat';

  return (
    <Flex direction="column" minW="190px" w="100%">
      <Flex position="relative" direction="column" minW="190px" w="100%">
        <Button
          w="100%"
          isDisabled={deleted || completed}
          fontSize="md"
          fontWeight="normal"
          bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
          rightIcon={
            <Icon p={0} m={0}>
              {Icons.collapse('24px', '24px')}
            </Icon>
          }
          variant="ghost"
          borderRadius={5}
          width="100%"
          justifyContent="space-between"
          onClick={() => setShowMenu(!showMenu)}
        >
          {repeatText}
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
                <MenuItem key={m.name} onClick={m.clickHandler} text={m.name} />
              ))}
            </Flex>

            {repeatDialogVisible && (
              <RepeatDialog
                onSubmit={(r) => {
                  onSubmit(r);
                  setRepeatDialogVisible(false);
                  setShowMenu(false);
                }}
              />
            )}
          </MenuList>
        )}
      </Flex>
    </Flex>
  );
};

export default RepeatPicker;
