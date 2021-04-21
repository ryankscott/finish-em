import React, { ReactElement } from 'react'
import ReactTooltip from 'react-tooltip'

type TooltipProps = {
  id: string
  text: string
  multiline?: boolean
  html?: boolean
}

const Tooltip = (props: TooltipProps): ReactElement => {
  return (
    <ReactTooltip
      id={props.id}
      type="dark"
      effect="float"
      place="top"
      delayShow={500}
      multiline={props.multiline}
      html={props.html}
    >
      {props.text}
    </ReactTooltip>
  )
}
export default Tooltip
