import {
  Menu,
  MenuButton,
  IconButton,
  Icon,
  MenuList,
  MenuItem,
  Text,
  useDisclosure,
  AlertDialogOverlay,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
} from "@chakra-ui/react";
import { Icons } from "../assets/icons";
import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import {
  DELETE_VIEW,
  DELETE_PROJECT,
  GET_SIDEBAR,
  GET_PROJECTS,
} from "../queries";
import React from "react";

type Props = { projectKey: string };

export default function ProjectOptionsMenu({ projectKey }: Props) {
  const [deleteView] = useMutation(DELETE_VIEW);
  const navigate = useNavigate();
  const [deleteProject] = useMutation(DELETE_PROJECT, {
    refetchQueries: [GET_SIDEBAR, GET_PROJECTS],
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  return (
    <>
      <Menu>
        <MenuButton
          variant="default"
          as={IconButton}
          icon={<Icon as={Icons.more} />}
        />
        <MenuList w="20px ">
          <MenuItem onClick={onOpen}>
            <Icon as={Icons.trash} />
            <Text pl={2}>Delete project</Text>
          </MenuItem>
        </MenuList>
      </Menu>
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
              <Button ref={cancelRef} onClick={onClose} variant="default">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={() => {
                  deleteProject({ variables: { key: projectKey } });
                  deleteView({ variables: { key: projectKey } });
                  navigate("/inbox");
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
