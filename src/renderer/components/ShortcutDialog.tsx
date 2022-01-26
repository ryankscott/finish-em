import { marked } from 'marked';
import shortcutsText from '../assets/shortcuts.md';
import { shortcutDialogVisibleVar } from '..';
import {
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
} from '@chakra-ui/react';

const ShortcutDialog = () => {
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
        />
      </ModalContent>
    </Modal>
  );
};

export default ShortcutDialog;
