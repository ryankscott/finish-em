import {
  Button,
  Flex,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  Text,
} from '@chakra-ui/react';
import CloudIcon from './CloudIcon';

interface CloudSyncSignedInProps {
  onClose: () => void;
  email: string;
}
const CloudSyncSignedIn = ({ onClose, email }: CloudSyncSignedInProps) => (
  <ModalContent>
    <ModalCloseButton />
    <ModalBody mx={4}>
      <Flex direction="column" my={2} mt={8}>
        <CloudIcon />
        <Text fontSize="lg" my={2} w="100%" justifyContent="center">
          You're signed in to Finish Em cloud sync with the following email
          address
        </Text>

        <Input
          readOnly
          type="email"
          value={email}
          borderRadius="md"
          size="md"
          my={2}
        />
      </Flex>
    </ModalBody>

    <ModalFooter>
      <Button isDisabled={true} colorScheme="blue" mr={3} onClick={() => {}}>
        Sign out
      </Button>
      <Button variant="ghost" onClick={onClose}>
        Close
      </Button>
    </ModalFooter>
  </ModalContent>
);

export default CloudSyncSignedIn;
