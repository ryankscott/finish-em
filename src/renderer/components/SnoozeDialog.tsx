import { ReactElement, useState } from 'react';
import { add, sub, startOfTomorrow, lastDayOfWeek } from 'date-fns';
import { useMutation } from '@apollo/client';
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import {
  GET_APP_DATA,
  ITEMS_BY_FILTER,
  ITEM_BY_KEY,
  SNOOZE_ITEM,
} from '../queries';

const snoozeOptions: {
  label: string;
  value: string;
}[] = [
  {
    label: 'Tomorrow',
    value: add(startOfTomorrow(), { hours: 9 }).toISOString(),
  },
  {
    label: 'End of week',
    value: sub(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
      days: 2,
    }).toISOString(),
  },
  {
    label: 'Next week',
    value: add(lastDayOfWeek(new Date(), { weekStartsOn: 1 }), {
      days: 1,
    }).toISOString(),
  },
  {
    label: 'Custom date',
    value: '',
  },
];

type SnoozeDialogProps = {
  itemKey: string;
  onClose: () => void;
};

function SnoozeDialog({ itemKey, onClose }: SnoozeDialogProps): ReactElement {
  const [dayPickerVisible, setDayPickerVisible] = useState(false);
  const [snoozeItem] = useMutation(SNOOZE_ITEM, {
    refetchQueries: [ITEMS_BY_FILTER, ITEM_BY_KEY, GET_APP_DATA],
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
      borderColor={useColorModeValue('gray.200', 'gray.800')}
      borderRadius="md"
      py={1}
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Flex
        direction="row"
        alignItems="baseline"
        justifyContent="space-between"
      >
        <Text fontSize="md" py={1} px={3}>
          Snooze until:
        </Text>
      </Flex>
      <Flex direction="column" py={1} px={0}>
        {snoozeOptions.map((r) => {
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
                bg: useColorModeValue('gray.100', 'gray.900'),
                cursor: 'pointer',
              }}
              onClick={(e) => {
                if (r.label == 'Custom date') {
                  setDayPickerVisible(true);
                } else {
                  snoozeItem({
                    variables: {
                      key: itemKey,
                      snoozedUntil: r.value,
                    },
                  });
                  e.stopPropagation();
                  onClose();
                }
              }}
            >
              <Text px={3} fontSize="sm">
                {r.label}
              </Text>
            </Flex>
          );
        })}
      </Flex>

      {dayPickerVisible && (
        <Box position="absolute" top="0" right="180px">
          <DatePicker
            // @ts-ignore
            utcOffset={new Date().getTimezoneOffset()}
            inline
            tabIndex={0}
            onChange={(d) => {
              snoozeItem({
                variables: {
                  key: itemKey,
                  snoozedUntil: d?.toISOString(),
                },
              });
              onClose();
            }}
          />
        </Box>
      )}
    </Flex>
  );
}

export default SnoozeDialog;
