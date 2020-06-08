import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import FilteredItemList from '../containers/FilteredItemList'
import { Title } from './Typography'
import { Container, IconContainer, Header } from './styled/Inbox'
import ItemCreator from './ItemCreator'
import { ItemIcons } from './Item'
import { connect } from 'react-redux'
import { inboxIcon } from '../assets/icons'
import { FilterEnum } from '../interfaces'

interface StateProps {
    theme: string
}

type InboxProps = StateProps

function Inbox(props: InboxProps): ReactElement {
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container>
                <Header>
                    <IconContainer>
                        {inboxIcon(
                            24,
                            24,
                            themes[props.theme].colours.primaryColour,
                        )}
                    </IconContainer>
                    <Title>Inbox</Title>
                </Header>
                <ItemCreator
                    type="item"
                    buttonText="Add Item"
                    initiallyExpanded={false}
                    projectId={'0'}
                />
                <FilteredItemList
                    listName="Items"
                    filter={{
                        type: 'default',
                        filter: FilterEnum.ShowInbox,
                    }}
                    isFilterable={true}
                    hideIcons={[ItemIcons.Project]}
                />
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state) => ({
    theme: state.ui.theme,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Inbox)
