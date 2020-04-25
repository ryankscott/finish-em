import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from '../theme'
import { getItemById } from '../utils'
import { connect } from 'react-redux'
import { ItemType } from '../interfaces'
import Item from './Item'

interface OwnProps {}
interface DispatchProps {}
interface StateProps {
    items: ItemType[]
    activeItem: Uuid
}
type FocusbarProps = OwnProps & DispatchProps & StateProps
const Focusbar = (props: FocusbarProps): ReactElement => {
    const item = getItemById(props.activeItem, props.items)
    return (
        <ThemeProvider theme={theme}>
            <Item {...item}></Item>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    items: state.items,
    activeItem: state.ui.activeItem,
})
const mapDispatchToProps = (dispatch) => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Focusbar)
