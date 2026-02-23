import { Box, Text } from 'ink'
import TextInput from 'ink-text-input'
import { useEffect, useState } from 'react'

import type { AssistantMessage } from '@/server/types'

export type PendingAssistantActionRef = {
  messageId: number
  actionId: string
  label: string
}

export function listPendingAssistantActions(
  messages: AssistantMessage[],
): PendingAssistantActionRef[] {
  const refs: PendingAssistantActionRef[] = []
  for (const message of messages) {
    for (const action of message.actions) {
      if (action.status === 'pending') {
        refs.push({
          messageId: message.id,
          actionId: action.id,
          label: action.label,
        })
      }
    }
  }
  return refs
}

type AssistantPanelProps = {
  focused: boolean
  messages: AssistantMessage[]
  selectedPendingIndex: number
  isChatMode: boolean
  chatInput: string
  onChatInputChange: (value: string) => void
  isThinking?: boolean
}

const ACTION_STATUS_COLOR: Record<
  AssistantMessage['actions'][number]['status'],
  string
> = {
  pending: 'yellow',
  executed: 'green',
  cancelled: 'gray',
  failed: 'red',
}

export const AssistantPanel = ({
  focused,
  messages,
  selectedPendingIndex,
  isChatMode,
  chatInput,
  onChatInputChange,
  isThinking = false,
}: AssistantPanelProps) => {
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
  const [spinnerIndex, setSpinnerIndex] = useState(0)

  useEffect(() => {
    if (!isThinking) {
      setSpinnerIndex(0)
      return
    }

    const interval = setInterval(() => {
      setSpinnerIndex((current) => (current + 1) % spinnerFrames.length)
    }, 80)

    return () => {
      clearInterval(interval)
    }
  }, [isThinking])

  const borderColor = isChatMode ? 'magentaBright' : focused ? 'magentaBright' : 'gray'
  let pendingCounter = 0

  return (
    <Box
      flexDirection="column"
      width={50}
      borderStyle="round"
      borderColor={borderColor}
      paddingX={1}
    >
      <Box marginBottom={1}>
        <Text bold color="magentaBright">
          Assistant
        </Text>
      </Box>

      <Box flexDirection="column" flexGrow={1}>
        {messages.length === 0 && !isThinking ? (
          <Text dimColor>No messages yet. Press c to chat.</Text>
        ) : (
          messages.slice(-10).map((message) => (
            <Box key={message.id} flexDirection="column" marginBottom={1}>
              <Text
                color={message.role === 'user' ? 'cyan' : 'magentaBright'}
                bold
              >
                {message.role === 'user' ? '› You' : '◆ Assistant'}
              </Text>
              <Box paddingLeft={1}>
                <Text wrap="wrap">{message.content}</Text>
              </Box>
              {message.actions.map((action) => {
                const pendingIndex =
                  action.status === 'pending' ? pendingCounter++ : -1
                const isSelected = pendingIndex === selectedPendingIndex
                return (
                  <Box key={action.id} paddingLeft={1}>
                    <Text
                      color={
                        isSelected && focused
                          ? 'cyan'
                          : ACTION_STATUS_COLOR[action.status]
                      }
                      bold={isSelected && focused}
                    >
                      {action.status === 'pending' && isSelected ? '❯ ' : '  '}
                      [{action.status}] {action.label}
                      {action.resultMessage ? ` · ${action.resultMessage}` : ''}
                    </Text>
                  </Box>
                )
              })}
            </Box>
          ))
        )}
        {isThinking && (
          <Box paddingLeft={1} marginTop={messages.length > 0 ? 1 : 0}>
            <Text color="magentaBright" dimColor>
              {spinnerFrames[spinnerIndex]} Thinking…
            </Text>
          </Box>
        )}
      </Box>

      <Box borderStyle="single" borderColor={isChatMode ? 'magentaBright' : 'gray'} paddingX={1} marginTop={1}>
        {isChatMode ? (
          <>
            <Text color="magentaBright" bold>{'> '}</Text>
            <TextInput value={chatInput} onChange={onChatInputChange} />
          </>
        ) : (
          <Text dimColor>c chat · y/n confirm/cancel · \ collapse/expand</Text>
        )}
      </Box>
    </Box>
  )
}
