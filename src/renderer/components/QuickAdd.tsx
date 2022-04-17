import React, { ReactElement, useEffect } from 'react';
import {
  Box,
  Editable,
  EditableInput,
  EditablePreview,
  useColorMode,
} from '@chakra-ui/react';

type QuickAddProps = {
  projectKey?: string | '0';
};

function QuickAdd(props: QuickAddProps): ReactElement {
  const initialRef = React.useRef();
  const { colorMode } = useColorMode();

  useEffect(() => {
    initialRef.current.focus();
  }, []);

  const handleEscape = (): void => {
    window.electron.ipcRenderer.sendMessage('close-quickadd');
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
          window.electron.ipcRenderer.sendMessage('create-task', {
            text,
          });
          window.electron.ipcRenderer.sendMessage('close-quickadd');
        }}
      >
        <EditablePreview
          _hover={{
            bg: colorMode === 'light' ? 'gray.100' : 'gray.900',
          }}
        />
        <EditableInput ref={initialRef} />
      </Editable>
    </Box>
  );
}

export default QuickAdd;
