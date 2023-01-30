import {
  Button,
  Flex,
  Input,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  Text,
  useToast,
} from '@chakra-ui/react';
import CloudIcon from './CloudIcon';
import { setLinkURL } from '../client';

interface CloudSyncSignedInProps {
  onClose: () => void;
  email: string;
}
const CloudSyncSignedIn = ({ onClose, email }: CloudSyncSignedInProps) => {
  const toast = useToast();

  return (
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
        <Button
          colorScheme="blue"
          mr={3}
          onClick={() => {
            toast({
              title: 'Signed out.',
              variant: 'subtle',
              description: 'Successfully out of Finish Em Cloud.',
              status: 'success',
              duration: 9000,
              isClosable: true,
            });

            window.electronAPI.ipcRenderer.setSetting('cloudSync', {
              enabled: false,
              email: '',
              token: '',
            });

            localStorage.setItem('token', '');

            setLinkURL('local');

            window.electronAPI.ipcRenderer.restartApp();
          }}
        >
          Sign out
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </ModalContent>
  );
};

export default CloudSyncSignedIn;
