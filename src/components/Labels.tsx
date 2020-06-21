import React, { ReactElement } from 'react'
import { ThemeProvider } from 'styled-components'

import { themes } from '../theme'
import { Container } from './styled/View'
import FilteredItemList from '../containers/FilteredItemList'
import { RenderingStrategy, LabelType, Label } from '../interfaces'
import { connect } from 'react-redux'
import ViewHeader from './ViewHeader'

interface StateProps {
    theme: string
    labels: Label
}
type LabelProps = StateProps
const Labels = (props: LabelProps): ReactElement => (
    <ThemeProvider theme={themes[props.theme]}>
        <Container style={{ paddingTop: '50px' }}>
            <ViewHeader name={'Labels'} icon={'label'} />
            {Object.values(props.labels.labels).map((l: LabelType) => (
                <FilteredItemList
                    id={l.id}
                    key={l.id}
                    listName={l.name}
                    filter={`not completed and not deleted and labelId == "${l.id}"`}
                    isFilterable={true}
                    renderingStrategy={RenderingStrategy.All}
                    readOnly={true}
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
