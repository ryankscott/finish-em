import React, { ReactElement } from 'react'
import { AttributeContainer, AttributeIcon, AttributeText } from './styled/ItemAttribute'
import { Icons } from '../assets/icons'
import marked from 'marked'
import { themes } from '../theme'
import { connect } from 'react-redux'
import { ThemeProvider } from '../StyledComponents'

interface StateProps {
    theme: string
}
interface OwnProps {
    type: 'repeat' | 'due' | 'scheduled' | 'subtask'
    text: string
    completed: boolean
}
type ItemAttributeProps = OwnProps & StateProps

const ItemAttribute = (props: ItemAttributeProps): ReactElement => {
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <AttributeContainer completed={props.completed}>
                <AttributeIcon> {Icons[props.type](14, 14)}</AttributeIcon>
                <AttributeText
                    dangerouslySetInnerHTML={{ __html: marked(props.text) }}
                ></AttributeText>
            </AttributeContainer>
        </ThemeProvider>
    )
}
const mapStateToProps = (state, props): StateProps => ({
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch) => ({})
export default connect(mapStateToProps, mapDispatchToProps)(ItemAttribute)
