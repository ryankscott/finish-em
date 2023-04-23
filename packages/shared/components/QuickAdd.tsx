import { ReactElement, useEffect, useRef } from 'react';
import {
  Box,
  Editable,
  EditableInput,
  EditablePreview,
  useColorMode,
} from '@chakra-ui/react';

function QuickAdd(): ReactElement {
  const { colorMode } = useColorMode();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref?.current?.focus();
  }, []);

  const handleEscape = (): void => {
    window.electronAPI.ipcRenderer.closeQuickAdd();
  };

  return (
    <Box
      p={0}
      m={0}
      bg="gray.100"
      w="100%"
      borderRadius="md"
      outline={0}
      _active={{
        outline: 0,
      }}
      sx={{
        WebkitAppRegion: 'drag',
      }}
    >
      <Editable
        placeholder="Add an item"
        startWithEditView
        color="gray.800"
        fontSize="lg"
        p={2}
        m={0}
        w="100%"
        onCancel={handleEscape}
        onSubmit={(text) => {
          if (!text) return;
          window.electronAPI.ipcRenderer.createTask(text);
          window.electronAPI.ipcRenderer.closeQuickAdd();
        }}
      >
        <EditablePreview
          _hover={{
            bg: colorMode === 'light' ? 'gray.100' : 'gray.900',
          }}
        />
        <EditableInput ref={ref} />
      </Editable>
    </Box>
  );
}

export default QuickAdd;
