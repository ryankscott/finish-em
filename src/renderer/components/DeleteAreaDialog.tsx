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
import { Icons } from '../assets/icons';

type DeleteAreaDialogProps = {
  onDelete: () => void;
};

const DeleteAreaDialog = ({
  onDelete,
}: DeleteAreaDialogProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = React.useRef(null);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <Button
        size="md"
        variant="primary"
        rightIcon={<Icon as={Icons.trash} />}
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
              Delete Area
            </AlertDialogHeader>
            <AlertDialogBody fontSize="md">
              {`Are you sure? You can't undo this action afterwards.`}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button variant="default" ref={cancelRef} onClick={onClose}>
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

export default DeleteAreaDialog;
