import {
  Button,
  Modal,
  ModalOverlay,
  Switch,
  useDisclosure,
} from '@chakra-ui/react';
import CloudSyncSignedIn from './CloudSyncSignedIn';
import CloudSyncSignUpOrIn from './CloudSyncSignUpOrIn';

interface CloudSyncProps {
  enabled: boolean;
  email: string;
  token: string;
}

const CloudSync = ({ enabled, email }: CloudSyncProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Switch size="sm" isChecked={enabled} px={1} />
      <Button onClick={onOpen} size="md">
        Configure
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        {enabled ? (
          <CloudSyncSignedIn onClose={onClose} email={email} />
        ) : (
          <CloudSyncSignUpOrIn onClose={onClose} />
        )}
      </Modal>
    </>
  );
};

export default CloudSync;
