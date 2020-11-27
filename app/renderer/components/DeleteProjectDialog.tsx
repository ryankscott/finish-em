import React, { ReactElement, useState, useEffect } from 'react'
import { ThemeProvider } from '../StyledComponents'

import { Paragraph, Header3 } from './Typography'
import { themes } from '../theme'
import Button from './Button'
import {
  BodyContainer,
  ActionContainer,
  Container,
  CloseButton,
  Dialog,
  HeaderContainer,
} from './styled/DeleteProjectDialog'

import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces/theme'

const GET_THEME = gql`
  query {
    theme @client
  }
`

type DeleteProjectDialogProps = {
  onDelete: () => void
}

const DeleteProjectDialog = (props: DeleteProjectDialogProps): ReactElement => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const node = React.useRef<HTMLDivElement>()
  const handleClick = (e): void => {
    if (e && node.current && node.current.contains(e.target)) {
      return
    }
    // Only close if it's currently open
    if (dialogOpen) {
      setDialogOpen(false)
    }
    return
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClick, false)
    return () => {
      document.removeEventListener('mousedown', handleClick, false)
    }
  })

  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

  return (
    <ThemeProvider theme={theme}>
      <Container ref={node} onClick={handleClick}>
        <Button
          type="primary"
          text="Delete"
          icon="trash"
          width="80px"
          onClick={() => {
            setDialogOpen(!dialogOpen)
          }}
        />
        {dialogOpen && (
          <Dialog>
            <HeaderContainer>
              <Header3>Delete Project</Header3>
              <CloseButton>
                <Button
                  iconSize="14"
                  type="default"
                  icon="close"
                  onClick={() => {
                    setDialogOpen(false)
                  }}
                />
              </CloseButton>
            </HeaderContainer>
            <BodyContainer>
              <Paragraph>Are you sure you want to delete this project?</Paragraph>
            </BodyContainer>
            <ActionContainer>
              <Button
                type="error"
                spacing="default"
                onClick={() => {
                  props.onDelete()
                }}
                text="Yes"
                width={'80px'}
              ></Button>
              <Button
                type="primary"
                spacing="default"
                onClick={() => {
                  setDialogOpen(false)
                }}
                text="No"
                width={'80px'}
              ></Button>
            </ActionContainer>
          </Dialog>
        )}
      </Container>
    </ThemeProvider>
  )
}

export default DeleteProjectDialog
