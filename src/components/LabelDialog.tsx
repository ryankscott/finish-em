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
import { addLabel } from '../actions/item'

interface StateProps {
    theme: string
    labels: Label
}

interface DispatchProps {
    addLabel: (id: Uuid, labelId: Uuid | string) => void
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
})

export default connect(mapStateToProps, mapDispatchToProps)(LabelDialog)
