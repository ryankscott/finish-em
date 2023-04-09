import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Flex,
  Text,
  Link,
  Button,
  FlexProps,
  Icon,
} from '@chakra-ui/react';
import { format, parseISO, sub } from 'date-fns';
import { gql, useQuery } from '@apollo/client';
import { RRule } from 'rrule';
import { Icons } from '../assets/icons';
import { Event } from '../resolvers-types';
import { capitaliseFirstLetter } from '../utils';

const GET_BEAR_INTEGRATION = gql`
  query {
    bearNotesIntegration: featureByName(name: "bearNotesIntegration") {
      key
      enabled
    }
  }
`;

interface Props {
  event: Event | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const AttributeContainer = (props: FlexProps) => (
  <Flex
    direction="row"
    alignItems="flex-start"
    justifyContent="flex-start"
    my={1}
    mx={3}
    minH={6}
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

const AttributeKey = (props: FlexProps) => (
  <Flex
    direction="row"
    justifyContent="flex-start"
    fontWeight="semibold"
    alignItems="center"
    ml={0}
    minW="70px"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

const AttributeValue = (props: FlexProps) => (
  <Flex
    justifyContent="flex-start"
    alignItems="flex-start"
    minW="180px"
    textOverflow="ellipsis"
    pl={3}
    position="relative"
    direction="column"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  />
);

const EventModal = ({ event, isOpen, onClose }: Props) => {
  const { loading, error, data } = useQuery(GET_BEAR_INTEGRATION);
  if (loading) return null;
  if (error) {
    console.log(error);
    return null;
  }

  const offset = new Date().getTimezoneOffset();
  const startAt = event?.startAt
    ? format(sub(parseISO(event?.startAt), { minutes: offset }), 'h:mm aa')
    : '';
  const endAt = event?.endAt
    ? format(sub(parseISO(event?.endAt), { minutes: offset }), 'h:mm aa')
    : '';

  const generateDuration = () => {
    if (!startAt || !endAt) {
      return <Text fontSize="md" />;
    }
    return (
      <Text fontSize="md">
        {startAt} - {endAt}
      </Text>
    );
  };

  const generateLocation = () => {
    if (!event?.location) {
      return <Text fontSize="md">-</Text>;
    }
    if (event?.location?.startsWith('http')) {
      return (
        <Link fontSize="md" href={event.location}>
          {event.location}
        </Link>
      );
    }
    return <Text fontSize="md">{event.location} </Text>;
  };

  const generateAttendees = () => {
    if (!event?.attendees) {
      return <Text fontSize="md">-</Text>;
    }
    return event?.attendees?.map((a, _) => (
      <Text fontSize="md" key={a?.name}>
        {a?.name ?? '-'}
      </Text>
    ));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader pr="40px">{event?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AttributeContainer>
              <AttributeKey>
                <Text fontSize="md">Time: </Text>
              </AttributeKey>
              <AttributeValue>{generateDuration()}</AttributeValue>
            </AttributeContainer>
            {event?.recurrence && (
              <AttributeContainer>
                <AttributeKey>
                  <Text fontSize="md">Recurrence: </Text>
                </AttributeKey>
                <AttributeValue>
                  <Text fontSize="md">
                    {capitaliseFirstLetter(
                      RRule.fromString(event.recurrence).toText()
                    )}
                  </Text>
                </AttributeValue>
              </AttributeContainer>
            )}
            <AttributeContainer>
              <AttributeKey>
                <Text fontSize="md">Location: </Text>
              </AttributeKey>
              <AttributeValue>{generateLocation()}</AttributeValue>
            </AttributeContainer>
            <AttributeContainer>
              <AttributeKey>
                <Text fontSize="md">Attendees: </Text>
              </AttributeKey>
              <AttributeValue>{generateAttendees()}</AttributeValue>
            </AttributeContainer>
          </ModalBody>
          <ModalFooter>
            {data.bearNotesIntegration.enabled && (
              <Button
                variant="primary"
                size="md"
                rightIcon={<Icon as={Icons.bear} />}
                color="white"
                onClick={() => {
                  const title = `${format(new Date(), 'yyyy-MM-dd')} - ${
                    event?.title
                  }`;
                  const contents = `
_${startAt} - ${endAt}_

## Attendees:
${event?.attendees
  ?.map((a) => {
    return `- ${a?.name}`;
  })
  .join('\n')}

## Notes:


## Action Items:
`;
                  // @ts-ignore
                  window.electronAPI.ipcRenderer.createBearNote(
                    title,
                    contents
                  );
                }}
              >
                Create note
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default EventModal;
