import { gql, useQuery } from '@apollo/client'
import React, { ReactElement, useEffect, useState } from 'react'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import Button from './Button'
import {
  ActionContainer,
  BodyContainer,
  CloseButton,
  Container,
  Dialog,
  HeaderContainer,
} from './styled/DeleteAreaDialog'
import { Header3, Paragraph } from './Typography'

const GET_THEME = gql`
  query {
    theme @client
  }
`
type DeleteAreaDialogProps = {
  onDelete: () => void
}

const DeleteAreaDialog = (props: DeleteAreaDialogProps): ReactElement => {
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
          variant="primary"
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
              <Header3>Delete Area</Header3>
              <CloseButton>
                <Button
                  variant="subtle"
                  icon="close"
                  onClick={() => {
                    setDialogOpen(false)
                  }}
                />
              </CloseButton>
            </HeaderContainer>
            <BodyContainer>
              <Paragraph>Are you sure you want to delete this area?</Paragraph>
            </BodyContainer>
            <ActionContainer>
              <Button
                variant="error"
                spacing="default"
                onClick={() => {
                  props.onDelete()
                }}
                text="Yes"
                width={'80px'}
              ></Button>
              <Button
                variant="primary"
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

export default DeleteAreaDialog
