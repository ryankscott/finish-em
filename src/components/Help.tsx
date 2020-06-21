import React, { ReactElement, useEffect } from 'react'
import { connect } from 'react-redux'
import marked from 'marked'
import styled, { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import helpText from '../assets/help.md'
import { useHistory } from 'react-router-dom'

const Container = styled.div`
    width: 100%;
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
    const history = useHistory()
    useEffect(() => {
        console.log(history)
    }, [])
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container
                dangerouslySetInnerHTML={{ __html: marked(helpText, { breaks: true }) }}
            ></Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(Help)
