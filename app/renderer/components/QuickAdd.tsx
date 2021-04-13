import React, { ReactElement, useEffect } from 'react'
import EditableText from './EditableText'
import {
  setEndOfContenteditable,
  dueTextRegex,
  scheduledTextRegex,
  projectTextRegex,
  repeatTextRegex,
  itemRegex,
} from '../utils'
import { isValid } from 'date-fns'
import * as sugarDate from 'sugar-date'
import { Box } from '@chakra-ui/react'

type QuickAddProps = {
  projectKey?: string | '0'
}

function QuickAdd(props: QuickAddProps): ReactElement {
  const ref = React.useRef<HTMLInputElement>()
  useEffect(() => {
    ref.current.focus()
  })

  const handleEscape = (): void => {
    window.electron.sendMessage('close-quickadd')
  }

  // TODO: #357 Replace with new editable text
  return (
    <Box
      p={4}
      m={0}
      w={'100%'}
      border={'none'}
      outline={0}
      _active={{
        outline: 0,
      }}
    >
      <EditableText
        padding={'10px 10px'}
        fontSize="large"
        width="550px"
        innerRef={ref}
        onUpdate={(text) => {
          window.electron.sendMessage('create-task', { text: text })
          window.electron.sendMessage('close-quickadd')
        }}
        readOnly={false}
        keywords={[
          {
            matcher: itemRegex,
            validation: (input) => {
              return true
            },
          },
          {
            matcher: dueTextRegex,
            validation: (input) => {
              const dueDateText = input.split(':')[1]
              if (dueDateText == undefined) return false
              return isValid(sugarDate.create(dueDateText))
            },
          },
          {
            matcher: scheduledTextRegex,
            validation: (input) => {
              const scheduledDateText = input.split(':')[1]
              return isValid(sugarDate.create(scheduledDateText))
            },
          },
        ]}
        validation={(input) => {
          let currentVal = input
          // Check for prefix with TODO or NOTE
          const itemMatches = currentVal.match(itemRegex)
          if (!itemMatches) {
            setEndOfContenteditable(ref.current)
            return false
          }

          // Check for due date references
          const dueTextMatches = currentVal.match(dueTextRegex)
          if (dueTextMatches) {
            let dueDateText = dueTextMatches[0].split(':')[1]
            dueDateText = dueDateText.replace(/^"(.+(?="$))"$/, '$1')
            const dueDate = sugarDate.create(dueDateText)
            if (!isValid(dueDate)) {
              setEndOfContenteditable(ref.current)
              return false
            }
          }
          // Check for scheduled date references
          const scheduledTextMatches = currentVal.match(scheduledTextRegex)
          if (scheduledTextMatches) {
            let scheduledDateText = scheduledTextMatches[0].split(':')[1]
            scheduledDateText = scheduledDateText.replace(/^"(.+(?="$))"$/, '$1')
            const scheduledDate = sugarDate.create(scheduledDateText)
            if (!isValid(scheduledDate)) {
              setEndOfContenteditable(ref.current)
              return false
            }
          }
          // TODO: Decide how I want to handle project stuff
          currentVal = currentVal.replace(projectTextRegex, '<span class="valid">$&</span >')
          currentVal = currentVal.replace(repeatTextRegex, '<span class="valid">$&</span >')

          ref.current.innerHTML = currentVal
          setEndOfContenteditable(ref.current)
          return true
        }}
        input=""
        singleline={true}
        shouldClearOnSubmit={true}
        shouldSubmitOnBlur={false}
        onEscape={handleEscape}
      />
    </Box>
  )
}

export default QuickAdd
