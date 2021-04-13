import React, { ReactElement } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from '@emotion/styled'

const StyledTooltip = styled(ReactTooltip)`
  padding: 5px 8px !important;
  margin: 0px !important;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
  font-size: 10px !important;
  color: #eee !important;
  p {
    color: #eee !important;
  }
`

type TooltipProps = {
  id: string
  text: string
  multiline?: boolean
  html?: boolean
}

const Tooltip = (props: TooltipProps): ReactElement => {
  return (
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
  )
}
export default Tooltip
