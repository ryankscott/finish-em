import { ReactElement } from 'react';
import { add, lastDayOfWeek, startOfTomorrow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { useMutation } from '@apollo/client';
import { Flex, Text, useColorMode } from '@chakra-ui/react';
import { GET_APP_DATA, ITEM_BY_KEY } from '../queries';
import {
  CREATE_REMINDER,
  DELETE_REMINDER_FROM_ITEM,
} from '../queries/reminder';

const reminderOptions: {
  label: string;
  value: string;
}[] = [
  {
    label: 'In 20 minutes',
    value: add(new Date(), { minutes: 20 }).toISOString(),
  },
  {
    label: 'In an hour',
    value: add(new Date(), { hours: 1 }).toISOString(),
  },
  {
    label: 'In three hours',
    value: add(new Date(), { hours: 3 }).toISOString(),
  },
  {
    label: 'Tomorrow',
    value: add(startOfTomorrow(), { hours: 9 }).toISOString(),
  },
  {
    label: 'Next week',
    value: add(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
      days: 1,
    }).toISOString(),
  },
  {
    label: `Don't remind`,
    value: '',
  },
];

type ReminderDialogProps = {
  itemKey: string;
  reminderText: string;
  onClose: () => void;
};

function ReminderDialog({
  itemKey,
  reminderText,
  onClose,
}: ReminderDialogProps): ReactElement {
  const { colorMode } = useColorMode();
  const [deleteReminderFromItem] = useMutation(DELETE_REMINDER_FROM_ITEM, {
    refetchQueries: [ITEM_BY_KEY, GET_APP_DATA],
  });
  const [createReminder] = useMutation(CREATE_REMINDER, {
    refetchQueries: [ITEM_BY_KEY, GET_APP_DATA],
  });

  return (
    <Flex
      direction="column"
      zIndex={2}
      position="absolute"
      minW="180px"
      right="0px"
      top="0px"
      border="1px solid"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.800'}
      borderRadius="md"
      py={1}
      bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
    >
      <Flex
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
      >
        <Text fontSize="md" p={1} px={3}>
          Remind me:
        </Text>
      </Flex>
      <Flex direction="column" py={1} px={0}>
        {reminderOptions.map((r) => {
          return (
            <Flex
              px={3}
              py={0.5}
              my={0.5}
              height="25px"
              key={`lc-${r.label}`}
              justifyContent="space-between"
              alignItems="center"
              _hover={{
                bg: colorMode === 'light' ? 'gray.100' : 'gray.900',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                if (r.label === `Don't remind`) {
                  deleteReminderFromItem({ variables: { itemKey } });
                } else {
                  createReminder({
                    variables: {
                      key: uuidv4(),
                      text: reminderText,
                      remindAt: r.value,
                      itemKey,
                    },
                  });
                }

                e.stopPropagation();
                onClose();
              }}
            >
              <Text px={3} fontSize="sm">
                {r.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}

export default ReminderDialog;
