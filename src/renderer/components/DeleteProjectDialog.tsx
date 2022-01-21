import React, { ReactElement, useState } from 'react';

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react';
import { convertSVGElementToReact, Icons } from '../assets/icons';

type DeleteProjectDialogProps = {
  onDelete: () => void;
};

const DeleteProjectDialog = (props: DeleteProjectDialogProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const cancelRef = React.useRef(null);
  const onClose = () => setIsOpen(false);

  return (
    <>
      <Button
        size="md"
        variant="primary"
        rightIcon={convertSVGElementToReact(
          Icons['trash']('12px', '12px', 'white')
        )}
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
            <AlertDialogBody fontSize={'md'}>
              {"Are you sure? You can't undo this action afterwards"}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={props.onDelete} ml={3}>
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
