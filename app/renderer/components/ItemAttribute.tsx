import React, { ReactElement } from 'react'
import { AttributeContainer, AttributeIcon, AttributeText } from './styled/ItemAttribute'
import { Icons } from '../assets/icons'
import marked from 'marked'
import { themes } from '../theme'
import { ThemeProvider } from '../StyledComponents'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'

const GET_THEME = gql`
  query {
    theme @client
  }
`
type ItemAttributeProps = {
  type: 'repeat' | 'due' | 'scheduled' | 'subtask'
  text: string
  completed: boolean
}

const ItemAttribute = (props: ItemAttributeProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <AttributeContainer completed={props.completed}>
        <AttributeIcon> {Icons[props.type](14, 14)}</AttributeIcon>
        <AttributeText dangerouslySetInnerHTML={{ __html: marked(props.text) }}></AttributeText>
      </AttributeContainer>
    </ThemeProvider>
  )
}
export default ItemAttribute
