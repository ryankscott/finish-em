import { marked } from 'marked';

import shortcutsText from '../assets/shortcuts.md';
import { shortcutDialogVisibleVar } from '..';
import { gql, useQuery } from '@apollo/client';
import {
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
} from '@chakra-ui/react';

const GET_DATA = gql`
  query {
    shortcutDialogVisible @client
  }
`;

const ShortcutDialog = () => {
  const { loading, error, data } = useQuery(GET_DATA);
  if (loading) return null;
  if (error) {
    console.log(error);
    return null;
  }

  return (
    <Modal
      isOpen={shortcutDialogVisibleVar().valueOf()}
      onClose={() => {
        shortcutDialogVisibleVar(false);
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Shortcuts</ModalHeader>
        <ModalCloseButton />
        <ModalBody
          dangerouslySetInnerHTML={{
            __html: marked(shortcutsText, { breaks: true }),
          }}
        ></ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ShortcutDialog;
