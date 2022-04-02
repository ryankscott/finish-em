import React, { ReactElement, useState } from 'react';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  Icon,
} from '@chakra-ui/react';
import { Icons2 } from '../assets/icons';

type DeleteProjectDialogProps = {
  onDelete: () => void;
};

const DeleteProjectDialog = ({
  onDelete,
}: DeleteProjectDialogProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = React.useRef(null);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <Button
        variant="primary"
        rightIcon={<Icon as={Icons2.trash} />}
        onClick={() => setIsOpen(true)}
      >
        Delete
      </Button>

      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="xl" fontWeight="bold">
              Delete Project
            </AlertDialogHeader>
            <AlertDialogBody fontSize="md">
              {`Are you sure? You can't undo this action afterwards`}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default DeleteProjectDialog;
