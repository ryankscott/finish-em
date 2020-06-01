import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { themes } from '../theme'
import { Title } from './Typography'
import { HeaderContainer, Container, IconContainer } from './styled/Labels'
import FilteredItemList from '../containers/FilteredItemList'
import { RenderingStrategy, ItemType, LabelType, Label } from '../interfaces'
import { connect } from 'react-redux'
import { labelIcon } from '../assets/icons'

interface StateProps {
    theme: string
    labels: Label
}
type LabelProps = StateProps
const Labels = (props: LabelProps): ReactElement => (
    <ThemeProvider theme={themes[props.theme]}>
        <Container>
            <HeaderContainer>
                <IconContainer>
                    {labelIcon(
                        24,
                        24,
                        themes[props.theme].colours.primaryColour,
                    )}
                </IconContainer>
                <Title> Labels </Title>
            </HeaderContainer>

            {Object.values(props.labels).map((l: LabelType) => (
                <FilteredItemList
                    key={l.id}
                    listName={l.name}
                    filter={{
                        type: 'custom',
                        filter: (i: ItemType) => {
                            return (
                                i.completed == false &&
                                i.deleted == false &&
                                i.labelId == l.id
                            )
                        },
                    }}
                    isFilterable={true}
                    renderingStrategy={RenderingStrategy.All}
                />
            ))}
        </Container>
    </ThemeProvider>
)

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    labels: state.ui.labels,
})
const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Labels)
