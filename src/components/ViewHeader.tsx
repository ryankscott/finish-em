import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { HeaderContainer, IconContainer } from './styled/ViewHeader'
import { themes } from '../theme'
import { IconType } from '../interfaces'
import { Title } from './Typography'
import { connect } from 'react-redux'
import { Icons } from '../assets/icons'

interface StateProps {
    theme: string
}

export interface OwnProps {
    name: string
    icon: IconType
}

type ViewHeaderProps = StateProps & OwnProps
const ViewHeader = (props: ViewHeaderProps): ReactElement => (
    <ThemeProvider theme={themes[props.theme]}>
        <HeaderContainer>
            <IconContainer>
                {Icons[props.icon](24, 24, themes[props.theme].colours.primaryColour)}
            </IconContainer>
            <Title> {props.name} </Title>
        </HeaderContainer>
    </ThemeProvider>
)
const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(ViewHeader)
