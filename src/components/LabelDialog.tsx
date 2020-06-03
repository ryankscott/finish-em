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
} from './styled/LabelDialog'
import Button from './Button'
import { Label } from '../interfaces'
import { Uuid } from '@typed/uuid'
import { addLabel, deleteLabel } from '../actions/item'
import { rgb } from 'polished'

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
export const LabelDialog = (props: LabelDialogProps): ReactElement => {
    return (
        <ThemeProvider theme={themes[props.theme]}>
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
                            <LabelContainer
                                key={m.id}
                                colour={m.colour}
                                onClick={(e) => {
                                    props.addLabel(props.itemId, m.id)
                                    e.stopPropagation()
                                    props.onClose()
                                }}
                            >
                                {m.name}
                            </LabelContainer>
                        )
                    })}
                    <LabelContainer
                        key={''}
                        colour={rgb(255,255,255,0)}
                        onClick={(e) => {
                            props.deleteLabel(props.itemId)
                            e.stopPropagation()
                            props.onClose()
                        }}
                    >
                        {'No label'}
                    </LabelContainer>
                </BodyContainer>
            </Container>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    theme: state.ui.theme,
    labels: state.ui.labels,
})

const mapDispatchToProps = (dispatch): DispatchProps => ({
    addLabel: (id: Uuid, labelId: Uuid | string) => {
        dispatch(addLabel(id, labelId))
    },
    deleteLabel: (id: Uuid) => {
        dispatch(deleteLabel(id)
    }
})

export default connect(mapStateToProps, mapDispatchToProps)(LabelDialog)
