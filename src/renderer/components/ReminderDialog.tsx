import { ReactElement } from 'react';
import { add, startOfWeek, startOfTomorrow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { gql, useMutation } from '@apollo/client';
import { Flex, Icon, IconButton, Text, useColorMode } from '@chakra-ui/react';
import { Icons } from 'renderer/assets/icons';

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
    value: add(startOfWeek(new Date(), { weekStartsOn: 1 }), {
      hours: 9,
    }).toISOString(),
  },
  {
    label: `Don't remind`,
    value: '',
  },
];

const CREATE_REMINDER = gql`
  mutation CreateReminder(
    $key: String!
    $text: String!
    $remindAt: DateTime
    $itemKey: String
  ) {
    createReminder(
      input: { key: $key, text: $text, remindAt: $remindAt, itemKey: $itemKey }
    ) {
      key
      text
      remindAt
    }
  }
`;
const DELETE_REMINDER_FROM_ITEM = gql`
  mutation DeleteReminderFromItem($itemKey: String!) {
    deleteReminderFromItem(input: { itemKey: $itemKey }) {
      key
    }
  }
`;

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
    refetchQueries: ['itemByKey', 'getAppData'],
  });
  const [createReminder] = useMutation(CREATE_REMINDER, {
    refetchQueries: ['itemByKey', 'getAppData'],
  });

  return (
    <Flex
      direction="column"
      zIndex={2}
      position="relative"
      minW="180px"
      right="144px"
      top="36px"
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
        <Text fontSize="md" p={2} px={3}>
          Remind me:
        </Text>
      </Flex>
      <Flex direction="column" py={2} px={0}>
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
              <Text px={3} fontSize="xs">
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
