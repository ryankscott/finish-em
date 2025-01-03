import { marked } from 'marked'
import {
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader
} from '@chakra-ui/react'
import { useBoundStore } from '../state'
import shortcutsText from '../assets/shortcuts.md'

const ShortcutDialog = () => {
  const [shortcutDialogVisible, setShortcutDialogVisible] = useBoundStore((state) => [
    state.shortcutDialogVisible,
    state.setShortcutDialogVisible
  ])
  return (
    <Modal
      isOpen={shortcutDialogVisible}
      onClose={() => {
        setShortcutDialogVisible(false)
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Shortcuts</ModalHeader>
        <ModalCloseButton />
        <ModalBody
          dangerouslySetInnerHTML={{
            __html: marked(shortcutsText, { breaks: true })
          }}
        />
      </ModalContent>
    </Modal>
  )
}

export default ShortcutDialog
