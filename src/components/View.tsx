import React, { ReactElement, useState } from 'react'
import { ThemeProvider } from 'styled-components'

import { themes } from '../theme'
import { Container } from './styled/View'
import { connect } from 'react-redux'
import ViewHeader from './ViewHeader'
import { IconType, MainComponents } from '../interfaces'
import FilteredItemList from '../containers/FilteredItemList'
import Button from './Button'

interface OwnProps {
    id: string
    name: string
    icon: IconType
}

interface StateProps {
    theme: string
    components: MainComponents
}
type ViewProps = StateProps & OwnProps
const View = (props: ViewProps): ReactElement => {
    const [showEdit, setShowEdit] = useState(false)
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <Container>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        type={'primary'}
                        spacing={'compact'}
                        icon={'edit'}
                        width={'80px'}
                        text={'Edit lists'}
                        onClick={() => {
                            setShowEdit(!showEdit)
                        }}
                    />
                </div>
                {Object.values(props.components.order).map((c) => {
                    const comp = props.components.components[c]
                    if (comp.location == 'main' && comp.viewId == props.id) {
                        switch (comp.component.name) {
                            case 'FilteredItemList':
                                return (
                                    <FilteredItemList
                                        id={c}
                                        key={c}
                                        {...comp.component.props}
                                        readOnly={!showEdit}
                                    />
                                )
                            case 'ViewHeader':
                                return <ViewHeader key={c} {...comp.component.props} />
                        }
                    }
                })}
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    components: state.ui.components,
})
const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(View)
