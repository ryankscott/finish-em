import { gql, useMutation, useQuery } from '@apollo/client'
import React from 'react'
import CommandPalette from 'react-command-palette'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Button from './Button'
const GET_THEME = gql`
  query {
    theme @client
    activeItem @client
  }
`
const COMPLETE_ITEM = gql`
  mutation CompleteItem($key: String!) {
    completeItem(input: { key: $key }) {
      key
      completed
      completedAt
    }
  }
`

const UNCOMPLETE_ITEM = gql`
  mutation UnCompleteItem($key: String!) {
    unCompleteItem(input: { key: $key }) {
      key
      completed
      completedAt
    }
  }
`

const DELETE_ITEM = gql`
  mutation DeleteItem($key: String!) {
    deleteItem(input: { key: $key }) {
      key
      deleted
      deletedAt
      children {
        key
        deleted
        deletedAt
      }
    }
  }
`
const RESTORE_ITEM = gql`
  mutation RestoreItem($key: String!) {
    restoreItem(input: { key: $key }) {
      key
      deleted
      deletedAt
    }
  }
`

export const CommandBar = () => {
  const { loading, error, data } = useQuery(GET_THEME)

  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }

  const [completeItem] = useMutation(COMPLETE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [unCompleteItem] = useMutation(UNCOMPLETE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [deleteItem] = useMutation(DELETE_ITEM, { refetchQueries: ['itemsByFilter'] })
  const [restoreItem] = useMutation(RESTORE_ITEM, { refetchQueries: ['itemsByFilter'] })

  const allCommands: {
    id: number
    icon: string
    shortcut: string
    name: string
    command: () => void
  }[] = [
    {
      id: 1,
      icon: '',
      shortcut: 'c',
      name: 'Complete item',
      command: () => {
        data.activeItem.map((i) => {
          completeItem({ variables: { key: i } })
        })
      },
    },
    {
      id: 2,
      icon: '',
      shortcut: 'd',
      name: 'Delete item',
      command: () => {
        data.activeItem.map((i) => {
          deleteItem({ variables: { key: i } })
        })
      },
    },
    {
      id: 3,
      icon: '',
      shortcut: 'u',
      name: 'Uncomplete item',
      command: () => {
        data.activeItem.map((i) => {
          unCompleteItem({ variables: { key: i } })
        })
      },
    },
    {
      id: 4,
      icon: '',
      shortcut: 'r',
      name: 'Restore item',
      command: () => {
        data.activeItem.map((i) => {
          restoreItem({ variables: { key: i } })
        })
      },
    },
  ]
  let commands = allCommands

  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <CommandPalette
        commands={commands}
        closeOnSelect={true}
        resetInputOnClose={true}
        alwaysRenderCommands={true}
        theme={{
          container: 'command-container',
          containerOpen: 'command-containerOpen',
          content: 'command-content',
          header: 'command-header',
          input: 'command-input',
          inputFocused: 'command-inputFocused',
          inputOpen: 'command-inputOpen',
          modal: 'command-modal',
          overlay: 'command-overlay',
          spinner: 'command-spinner',
          shortcut: 'command-shortcut',
          suggestion: 'command-suggestion',
          suggestionFirst: 'command-suggestionFirst',
          suggestionHighlighted: 'command-suggestionHighlighted',
          suggestionsContainer: 'command-suggestionsContainer',
          suggestionsContainerOpen: 'command-suggestionsContainerOpen',
          suggestionsList: 'command-suggestionsList',
        }}
        trigger={
          <Button
            type="invert"
            icon="terminal"
            iconSize="20px"
            iconColour={theme.colours.altTextColour}
            tooltipText="Show command bar"
          />
        }
        renderCommand={(suggestion) => {
          return (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              {suggestion.highlight ? (
                <span dangerouslySetInnerHTML={{ __html: suggestion.highlight }} />
              ) : (
                <span>{suggestion.name}</span>
              )}
              <span className={'command-shortcut'}>{suggestion.shortcut}</span>
            </div>
          )
        }}
        onSelect={() => {}}
      />
    </ThemeProvider>
  )
}
