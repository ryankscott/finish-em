import React, { ReactElement } from 'react'
import Button from './Button'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import { Container, SubTextContainer } from './styled/DateRenderer'
import { IconType } from '../interfaces'
import Tooltip from './Tooltip'
import { connect } from 'react-redux'

interface StateProps {
    theme: string
}
interface OwnProps {
    completed: boolean
    deleted: boolean
    textSize?: 'xxxsmall' | 'xxsmall' | 'xsmall' | 'small' | 'regular' | 'large'
    style?: 'subtle' | 'subtleInvert' | 'default'
    position: 'center' | 'flex-end' | 'flex-start'
    icon?: IconType
    tooltipText?: string
    text: string
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}
type DateRendererProps = OwnProps & StateProps

const DateRenderer = (props: DateRendererProps): ReactElement => {
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container completed={props.completed} type={props.icon}>
                <SubTextContainer key={props.icon} position={props.position}>
                    <Button
                        dataFor={'data-renderer-' + props.icon + '-' + props.text}
                        type={props.style || 'default'}
                        spacing="compact"
                        onClick={props.onClick}
                        icon={props.icon}
                        text={props.text}
                        isDisabled={props.deleted}
                        textSize={props.textSize}
                        iconColour={!props.text ? themes[props.theme].colours.altIconColour : null}
                    ></Button>
                </SubTextContainer>
                {props.tooltipText && (
                    <Tooltip
                        id={'data-renderer-' + props.icon + '-' + props.text}
                        text={props.tooltipText}
                    />
                )}
            </Container>
        </ThemeProvider>
    )
}
const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(DateRenderer)
