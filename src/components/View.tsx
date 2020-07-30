import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'

import { themes } from '../theme'
import { connect } from 'react-redux'
import ReorderableComponentList from './ReorderableComponentList'
import { Container } from './styled/View'
import { ViewType } from '../interfaces'

interface OwnProps {
    view: ViewType
}
interface DispatchProps {}

interface StateProps {
    theme: string
}
type ViewProps = StateProps & OwnProps & DispatchProps
const View = (props: ViewProps): ReactElement => {
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container>
                <ReorderableComponentList id={props.view.id} />
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({})

export default connect(mapStateToProps, mapDispatchToProps)(View)
