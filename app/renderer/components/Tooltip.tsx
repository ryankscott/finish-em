import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { StyledTooltip } from './styled/Tooltip'
import { gql, useQuery } from '@apollo/client'
import { ThemeType } from '../interfaces'

const GET_THEME = gql`
  query {
    theme @client
  }
`

type TooltipProps = {
  id: string
  text: string
  multiline?: boolean
  html?: boolean
}

const Tooltip = (props: TooltipProps): ReactElement => {
  const { loading, error, data } = useQuery(GET_THEME)
  if (loading) return null
  if (error) {
    console.log(error)
    return null
  }
  const theme: ThemeType = themes[data.theme]
  return (
    <ThemeProvider theme={theme}>
      <StyledTooltip
        id={props.id}
        type="dark"
        effect="float"
        place="top"
        delayShow={500}
        multiline={props.multiline}
        html={props.html}
      >
        {props.text}
      </StyledTooltip>
    </ThemeProvider>
  )
}
export default Tooltip
