import { marked } from 'marked';
import {
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
} from '@chakra-ui/react';
import { useReactiveVar } from '@apollo/client';
import shortcutsText from '../assets/shortcuts.md';
import { shortcutDialogVisibleVar } from '../cache';

const ShortcutDialog = () => {
  const shortcutDialogVisible = useReactiveVar(shortcutDialogVisibleVar);
  return (
    <Modal
      isOpen={shortcutDialogVisible.valueOf()}
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
        />
      </ModalContent>
    </Modal>
  );
};

export default ShortcutDialog;
