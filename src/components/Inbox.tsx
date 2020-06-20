import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { themes } from '../theme'
import { Container } from './styled/View'
import FilteredItemList from '../containers/FilteredItemList'
import { Label } from '../interfaces'
import { connect } from 'react-redux'
import ViewHeader from './ViewHeader'
import ItemCreator from './ItemCreator'
import { ItemIcons } from './Item'

interface StateProps {
    theme: string
    labels: Label
}
type InboxProps = StateProps
const Inbox = (props: InboxProps): ReactElement => (
    <ThemeProvider theme={themes[props.theme]}>
        <Container>
            <ViewHeader name={'Inbox'} icon={'inbox'} />
            <ItemCreator
                type="item"
                buttonText="Add Item"
                initiallyExpanded={false}
                projectId={'0'}
            />
            <FilteredItemList
                id="e62c66d4-0933-4198-bce6-47d6093259d6"
                listName="Items"
                filter='projectId == "0" and not (deleted or completed)'
                isFilterable={true}
                hideIcons={[ItemIcons.Project]}
                readOnly={true}
            />
        </Container>
    </ThemeProvider>
)

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    labels: state.ui.labels,
})
const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Inbox)
