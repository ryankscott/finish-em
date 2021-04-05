import React, { ReactElement, useEffect, useState } from 'react'

import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from '@chakra-ui/react'
import { Icons } from '../assets/icons'

type DeleteProjectDialogProps = {
  onDelete: () => void
}

const DeleteProjectDialog = (props: DeleteProjectDialogProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false)
  const cancelRef = React.useRef()
  const onClose = () => setIsOpen(false)

  return (
    <>
      <Button
        size="md"
        variant="primary"
        rightIcon={Icons['trash'](12, 12, 'white')}
        onClick={() => setIsOpen(true)}
      >
        Delete
      </Button>

      <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Project
            </AlertDialogHeader>
            <AlertDialogBody>Are you sure? You can't undo this action afterwards.</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onClose} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default DeleteProjectDialog
