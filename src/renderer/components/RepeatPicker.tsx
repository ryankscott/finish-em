import { ReactElement, useState } from 'react';
import {
  Button,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
  deleted,
}: RepeatPickerProps): ReactElement => {
  const [showMenu, setShowMenu] = useState(false);
  const [repeatDialogVisible, setRepeatDialogVisible] = useState(false);

  type RepeatOption = {
    type: 'custom' | 'default';
    repeat: RRule | null;
  };

  const handleRepeatChange = (input: RepeatOption) => {
    if (input.type === 'default') {
      onSubmit(input.repeat);
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
            byweekday: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
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
      clickHandler: () => {
        setRepeatDialogVisible(!repeatDialogVisible);
      },
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
    <Menu matchWidth>
      <MenuButton
        as={Button}
        w="100%"
        isDisabled={deleted || completed}
        fontSize="md"
        rightIcon={<Icon p={0} m={0} as={Icons.collapse} />}
        borderRadius="md"
        width="100%"
        textAlign="start"
        fontWeight="normal"
        variant="default"
        onClick={() => {
          setShowMenu(!showMenu);
          setRepeatDialogVisible(false);
        }}
      >
        {repeatText}
      </MenuButton>
      {showMenu && (
        <MenuList minW="250px">
          {!repeatDialogVisible &&
            menuItems.map((m) => (
              <MenuItem
                key={m.name}
                onClick={m.clickHandler}
                closeOnSelect={m.name !== 'Custom repeat'}
              >
                {m.name}
              </MenuItem>
            ))}
          {repeatDialogVisible && (
            <RepeatDialog
              repeat={repeat}
              onSubmit={(r) => {
                onSubmit(r);
                setRepeatDialogVisible(false);
                setShowMenu(false);
              }}
            />
          )}
        </MenuList>
      )}
    </Menu>
  );
};

export default RepeatPicker;
