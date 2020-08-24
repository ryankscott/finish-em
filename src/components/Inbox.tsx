import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'

import { themes } from '../theme'
import { Container } from './styled/View'
import { Label, MainComponents, Component } from '../interfaces'
import { connect } from 'react-redux'
import ViewHeader from './ViewHeader'
import ItemCreator from './ItemCreator'
import { v4 as uuidv4 } from 'uuid'
import { addComponent } from '../actions'
import ReorderableComponentList from './ReorderableComponentList'

interface StateProps {
    theme: string
    labels: Label
    components: MainComponents
}

interface DispatchProps {
    addList: (id: string, viewId: string) => void
}

type InboxProps = StateProps & DispatchProps
const viewId = 'ab4b890e-9b90-45b1-8404-df70711a68dd'
const Inbox = (props: InboxProps): ReactElement => {
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container style={{ paddingTop: '60px' }}>
                <ViewHeader name={'Inbox'} icon={'inbox'} />
                <ItemCreator
                    type="item"
                    buttonText="Add Item"
                    initiallyExpanded={true}
                    shouldCloseOnSubmit={false}
                    projectId={'0'}
                />
                <ReorderableComponentList id={viewId} />
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    labels: state.ui.labels,
    components: state.ui.components,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    addList: (viewId, location) => {
        const id = uuidv4()
        const component: Component = {
            name: 'FilteredItemList',
            props: {
                id: id,
                filter: 'not deleted',
                hideIcons: [],
                listName: 'New list',
                isFilterable: true,
            },
        }
        dispatch(addComponent(id, viewId, location, component))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(Inbox)
