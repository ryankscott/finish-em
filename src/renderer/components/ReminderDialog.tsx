import { ReactElement } from 'react';
import { add, startOfWeek, startOfTomorrow } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { gql, useMutation } from '@apollo/client';
import { Flex, Icon, IconButton, Text } from '@chakra-ui/react';
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
      position="absolute"
      minW="180px"
      right="144px"
      top="36px"
      border="1px solid"
      borderColor="gray.200"
      borderRadius="md"
      py={1}
      px={2}
      bg="gray.50"
    >
      <Flex
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
      >
        <Text fontSize="md" pl={2} p={1}>
          Remind at:
        </Text>
        <IconButton
          aria-label="close"
          variant="default"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          icon={<Icon as={Icons.close} />}
        />
      </Flex>
      <Flex direction="column" py={2} px={1}>
        {reminderOptions.map((r) => {
          return (
            <div key={r.label}>
              <Flex
                key={`lc-${r.label}`}
                justifyContent="space-between"
                alignItems="center"
                height="25px"
                borderRadius="md"
                _hover={{
                  bg: 'gray.100',
                  fontWeight: 'semibold',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  createReminder({
                    variables: {
                      key: uuidv4(),
                      text: reminderText,
                      remindAt: r.value,
                      itemKey,
                    },
                  });

                  e.stopPropagation();
                  onClose();
                }}
              >
                <Text
                  fontSize="xs"
                  p={1}
                  pl={4}
                  _hover={{
                    fontWeight: 'semibold',
                    cursor: 'pointer',
                  }}
                >
                  {r.label}
                </Text>
              </Flex>
            </div>
          );
        })}
        <Flex
          key="lc"
          justifyContent="space-between"
          alignItems="center"
          height="25px"
          borderRadius="md"
          _hover={{
            bg: 'gray.100',
            fontWeight: 'semibold',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            deleteReminderFromItem({ variables: { itemKey } });
            e.stopPropagation();
            onClose();
          }}
        >
          <Text
            fontSize="xs"
            p={1}
            pl={4}
            _hover={{
              fontWeight: 'semibold',
              cursor: 'pointer',
            }}
          >
            {`Don't remind`}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default ReminderDialog;
