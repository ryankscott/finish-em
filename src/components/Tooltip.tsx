import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { themes } from '../theme'
import { StyledTooltip } from './styled/Tooltip'
import { connect } from 'react-redux'

interface StateProps {
    theme: string
}
interface OwnProps {
    id: string
    text: string
    multiline?: boolean
    html?: boolean
}

type TooltipProps = StateProps & OwnProps

const Tooltip = (props: TooltipProps): ReactElement => {
    return (
        <ThemeProvider theme={themes[props.theme]}>
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
const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Tooltip)
