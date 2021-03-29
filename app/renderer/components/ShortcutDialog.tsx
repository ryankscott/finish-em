import React, { ReactElement, useEffect } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'

import { Container, ShortcutsContainer, CloseButtonContainer } from './styled/ShortcutDialog'
import marked from 'marked'

import shortcutsText from '../assets/shortcuts.md'
import Button from './Button'
import { shortcutDialogVisibleVar } from '..'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'

const GET_THEME = gql`
  query {
    theme @client
    shortcutDialogVisible @client
  }
`

type ShortcutDialogProps = {}
function ShortcutDialog(props: ShortcutDialogProps): ReactElement {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  const node = React.useRef()

  const handleClick = (e: MouseEvent): void => {
    // Don't handle if we're clicking on the shortcut icon again
    if (e.target.id == 'shortcut-button' || e.target.id == 'help') return
    if (e.target?.parentElement?.id == 'help') return
    // Don't close if we're clicking on the dialog
    if (e && this?.node?.current?.contains(e.target)) return

    // Only close if it's currently open
    if (data.shortcutDialogVisible) {
      shortcutDialogVisibleVar(false)
    }
    return
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClick, false)
    return () => {
      document.removeEventListener('mousedown', handleClick)
    }
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key == 'Escape') {
      shortcutDialogVisibleVar(false)
    }
    return
  }

  return (
    <ThemeProvider theme={theme}>
      <Container
        ref={node}
        isOpen={data.shortcutDialogVisible}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => handleKeyDown(e)}
      >
        <CloseButtonContainer>
          <Button variant="default" onClick={() => shortcutDialogVisibleVar(false)} icon="close" />
        </CloseButtonContainer>
        <ShortcutsContainer
          dangerouslySetInnerHTML={{ __html: marked(shortcutsText, { breaks: true }) }}
        ></ShortcutsContainer>
      </Container>
    </ThemeProvider>
  )
}

export default ShortcutDialog
