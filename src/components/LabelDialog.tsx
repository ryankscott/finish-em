import React, { ReactElement } from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from 'styled-components'
import { themes } from '../theme'
import {
    Container,
    HeaderContainer,
    LabelHeader,
    LabelContainer,
    BodyContainer,
    LabelName,
} from './styled/LabelDialog'
import Button from './Button'
import { Label, LabelType } from '../interfaces'
import { Uuid } from '@typed/uuid'
import { addLabel, deleteLabel } from '../actions/item'

interface StateProps {
    theme: string
    labels: Label
}

interface DispatchProps {
    addLabel: (id: Uuid, labelId: Uuid | string) => void
    deleteLabel: (id: Uuid) => void
}
interface OwnProps {
    itemId: Uuid
    onClose: () => void
}

type LabelDialogProps = OwnProps & StateProps & DispatchProps
function LabelDialog(props: LabelDialogProps): ReactElement {
    const theme = themes[props.theme]

    return (
        <ThemeProvider theme={theme}>
            <Container>
                <HeaderContainer>
                    <LabelHeader>Labels</LabelHeader>
                    <Button
                        type="default"
                        spacing="compact"
                        iconSize="12px"
                        onClick={() => {
                            props.onClose()
                        }}
                        icon={'close'}
                    />
                </HeaderContainer>
                <BodyContainer>
                    {Object.values(props.labels).map((m: LabelType) => {
                        return (
                            <div id={m.id} key={'f-' + m.id}>
                                <LabelContainer
                                    key={'lc-' + m.id}
                                    colour={m.colour}
                                    onClick={() => {
                                        props.addLabel(props.itemId, m.id)
                                        props.onClose()
                                    }}
                                >
                                    <LabelName colour={m.colour}>{m.name}</LabelName>
                                </LabelContainer>
                            </div>
                        )
                    })}
                    <LabelContainer key={''} colour={''}>
                        <LabelName
                            colour={''}
                            onClick={(e) => {
                                props.deleteLabel(props.itemId)
                                e.stopPropagation()
                                props.onClose()
                            }}
                        >
                            {'No label'}
                        </LabelName>
                    </LabelContainer>
                </BodyContainer>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    labels: state.ui.labels.labels,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    addLabel: (id: Uuid, labelId: Uuid | string) => {
        dispatch(addLabel(id, labelId))
    },
    deleteLabel: (id: Uuid) => {
        dispatch(deleteLabel(id))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(LabelDialog)
