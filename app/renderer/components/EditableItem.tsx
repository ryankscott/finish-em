import { gql, useQuery } from '@apollo/client'
import electron from 'electron'
import React, { ReactElement } from 'react'
import { Icons } from '../assets/icons'
import { ThemeType } from '../interfaces'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { validateItemString } from '../utils'
import EditableText from './EditableText'
import { Container, Icon } from './styled/EditableItem'

const GET_THEME = gql`
  query {
    theme @client
  }
`

type EditableItemProps = {
  hideIcon?: boolean
  text: string
  readOnly: boolean
  innerRef?: React.RefObject<HTMLInputElement>
  onSubmit: (t: string) => void
  onEscape?: () => void
}

function InternalEditableItem(props: EditableItemProps): ReactElement {
  const handleUpdate = (value): boolean => {
    props.onSubmit(value)
    window.electron.sendMessage('close-quickadd')
    return true
  }
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]

  return (
    <ThemeProvider theme={theme}>
      <Container
        onKeyUp={(e) => {
          if (e.key == 'Escape') {
            props.onEscape ? props.onEscape() : null
          }
        }}
        hideIcon={props.hideIcon}
      >
        {props.hideIcon ? null : <Icon>{Icons['add']()}</Icon>}
        <EditableText
          innerRef={props.innerRef}
          onUpdate={handleUpdate}
          singleline={true}
          input={''}
          validation={{
            validate: true,
            rule: validateItemString,
          }}
          shouldSubmitOnBlur={false}
          shouldClearOnSubmit={true}
        />
      </Container>
    </ThemeProvider>
  )
}

const EditableItem = React.forwardRef(
  (props: EditableItemProps, ref: React.RefObject<HTMLInputElement>) => (
    <InternalEditableItem innerRef={ref} {...props} />
  ),
)

EditableItem.displayName = 'EditableItem'

export default EditableItem
