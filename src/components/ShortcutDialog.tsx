import {
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
} from "@chakra-ui/react";
import { useBoundStore } from "../state";

const ShortcutDialog = () => {
  const [shortcutDialogVisible, setShortcutDialogVisible] = useBoundStore(
    (state) => [state.shortcutDialogVisible, state.setShortcutDialogVisible]
  );
  return (
    <Modal
      isOpen={shortcutDialogVisible}
      onClose={() => {
        setShortcutDialogVisible(false);
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Shortcuts</ModalHeader>
        <ModalCloseButton />
        <ModalBody />
      </ModalContent>
    </Modal>
  );
};

export default ShortcutDialog;
