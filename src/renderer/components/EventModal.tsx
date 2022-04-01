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
} from '@chakra-ui/react';
import { format, parseISO, sub } from 'date-fns';
import { gql, useQuery } from '@apollo/client';
import RRule from 'rrule';
import { Icons2 } from 'renderer/assets/icons';
import { Event } from '../../main/generated/typescript-helpers';
import { capitaliseFirstLetter } from '../utils';

const GET_FEATURES = gql`
  query {
    bearNotesIntegration: featureByName(name: "bearNotesIntegration") {
      key
      enabled
    }
  }
`;

interface Props {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

const AttributeContainerStyles = {
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  my: 1,
  mx: 3,
  minH: 6,
};

const AttributeKeyStyles = {
  justifyContent: 'flex-start',
  fontWeight: 'semi-bold',
  alignItems: 'center',
  ml: 0,
  minW: '70px',
};

const AttributeValueStyles = {
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  minW: '180px',
  textOverflow: 'ellipsis',
};

const EventModal = ({ event, isOpen, onClose }: Props) => {
  const { loading, error, data } = useQuery(GET_FEATURES);
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
            <Flex direction="row" {...AttributeContainerStyles}>
              <Flex {...AttributeKeyStyles}>
                <Text fontSize="md">Time: </Text>
              </Flex>
              <Flex
                pl={3}
                postion="relative"
                direction="column"
                {...AttributeValueStyles}
              >
                {generateDuration()}
              </Flex>
            </Flex>
            {event?.recurrence && (
              <Flex direction="row" {...AttributeContainerStyles}>
                <Flex {...AttributeKeyStyles}>
                  <Text fontSize="md">Recurrence: </Text>
                </Flex>
                <Flex
                  pl={3}
                  postion="relative"
                  direction="column"
                  {...AttributeValueStyles}
                >
                  <Text fontSize="md">
                    {capitaliseFirstLetter(
                      RRule.fromString(event.recurrence).toText()
                    )}
                  </Text>
                </Flex>
              </Flex>
            )}
            <Flex direction="row" {...AttributeContainerStyles}>
              <Flex {...AttributeKeyStyles}>
                <Text fontSize="md">Location: </Text>
              </Flex>
              <Flex
                pl={3}
                postion="relative"
                direction="column"
                {...AttributeValueStyles}
              >
                {generateLocation()}
              </Flex>
            </Flex>
            <Flex direction="row" {...AttributeContainerStyles}>
              <Flex {...AttributeKeyStyles}>
                <Text fontSize="md">Attendees: </Text>
              </Flex>
              <Flex
                pl={3}
                postion="relative"
                direction="column"
                {...AttributeValueStyles}
              >
                {generateAttendees()}
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter>
            {data.bearNotesIntegration.enabled && (
              <Button
                variant="primary"
                size="md"
                rightIcon={<Icon as={Icons2.bear} />}
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
                  window.electron.ipcRenderer.sendMessage('create-bear-note', {
                    title,
                    content: contents,
                  });
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
