import React, { ReactElement } from 'react'
import marked from 'marked'
import styled, { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import helpText from '../assets/help.md'
import shortcutsText from '../assets/shortcuts.md'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'

const GET_THEME = gql`
  query {
    theme @client
  }
`

const Container = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  padding: 20px 10px;
`

export const Help = (): ReactElement => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <div dangerouslySetInnerHTML={{ __html: marked(helpText, { breaks: true }) }}></div>
        <div dangerouslySetInnerHTML={{ __html: marked(shortcutsText, { breaks: true }) }}></div>
      </Container>
    </ThemeProvider>
  )
}

export default Help
