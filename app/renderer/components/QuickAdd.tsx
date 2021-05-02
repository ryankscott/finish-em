import React, { ReactElement, useEffect } from 'react'
import { Box, Editable, EditableInput, EditablePreview } from '@chakra-ui/react'

type QuickAddProps = {
  projectKey?: string | '0'
}

function QuickAdd(props: QuickAddProps): ReactElement {
  const initialRef = React.useRef()

  useEffect(() => {
    initialRef.current.focus()
  }, [])

  const handleEscape = (): void => {
    window.electron.sendMessage('close-quickadd')
  }

  return (
    <Box
      p={0}
      m={0}
      bg={'gray.100'}
      w={'100%'}
      borderRadius={5}
      outline={0}
      _active={{
        outline: 0,
      }}
      sx={{
        WebkitAppRegion: 'drag',
      }}
    >
      <Editable
        placeholder={'Add an item'}
        startWithEditView={true}
        color="gray.800"
        fontSize="lg"
        p={2}
        m={0}
        w={'100%'}
        onCancel={handleEscape}
        onSubmit={(text) => {
          if (!text) return
          window.electron.sendMessage('create-task', { text: text })
          window.electron.sendMessage('close-quickadd')
        }}
      >
        <EditablePreview />
        <EditableInput ref={initialRef} />
      </Editable>
    </Box>
  )
}

export default QuickAdd
