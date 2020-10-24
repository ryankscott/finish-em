import React, { ReactElement } from 'react'
import { connect } from 'react-redux'
import marked from 'marked'
import styled, { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import helpText from '../assets/help.md'
import shortcutsText from '../assets/shortcuts.md'

const Container = styled.div`
    width: 100%;
    max-width: 700px;
    display: flex;
    flex-direction: column;
    padding: 20px 10px;
`

interface StateProps {
    theme: string
}
interface OwnProps {}

type HelpProps = OwnProps & StateProps

export const Help = (props: HelpProps): ReactElement => {
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container>
                <div dangerouslySetInnerHTML={{ __html: marked(helpText, { breaks: true }) }}></div>
                <div
                    dangerouslySetInnerHTML={{ __html: marked(shortcutsText, { breaks: true }) }}
                ></div>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Help)
