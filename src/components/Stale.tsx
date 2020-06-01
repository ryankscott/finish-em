import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { themes } from '../theme'
import { Title } from './Typography'
import FilteredItemList from '../containers/FilteredItemList'
import { parseISO, differenceInDays } from 'date-fns'
import { ItemType } from '../interfaces'
import { connect } from 'react-redux'
import { Container, HeaderContainer, IconContainer } from './styled/Stale'
import { staleIcon } from '../assets/icons'

interface StateProps {
    theme: string
}
type StaleProps = StateProps
const Stale = (props: StaleProps): ReactElement => (
    <ThemeProvider theme={themes[props.theme]}>
        <Container>
            <HeaderContainer>
                <IconContainer>
                    {staleIcon(
                        24,
                        24,
                        themes[props.theme].colours.primaryColour,
                    )}
                </IconContainer>
                <Title>Stale</Title>
            </HeaderContainer>
            <FilteredItemList
                listName="Last update more than a week ago"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == false &&
                            i.completed == false &&
                            differenceInDays(
                                parseISO(i.createdAt),
                                new Date(),
                            ) > 7 &&
                            differenceInDays(
                                parseISO(i.createdAt),
                                new Date(),
                            ) < 31
                        )
                    },
                }}
                isFilterable={true}
            />
            <FilteredItemList
                listName="Last update more than a month ago"
                filter={{
                    type: 'custom',
                    filter: (i: ItemType) => {
                        return (
                            i.deleted == false &&
                            i.completed == false &&
                            differenceInDays(
                                parseISO(i.createdAt),
                                new Date(),
                            ) > 31
                        )
                    },
                }}
                isFilterable={true}
            />
        </Container>
    </ThemeProvider>
)

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Stale)
