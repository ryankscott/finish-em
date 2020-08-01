import React, { ReactElement } from 'react'
import { connect } from 'react-redux'
import { ThemeProvider } from '../StyledComponents'
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
import { addLabel, removeLabel } from '../actions/item'

interface StateProps {
    theme: string
    labels: Label
}

interface DispatchProps {
    addLabel: (id: string, labelId: string | string) => void
    removeLabel: (id: string) => void
}
interface OwnProps {
    itemId: string
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
                                props.removeLabel(props.itemId)
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
    addLabel: (id: string, labelId: string | string) => {
        dispatch(addLabel(id, labelId))
    },
    removeLabel: (id: string) => {
        dispatch(removeLabel(id))
    },
})

export default connect(mapStateToProps, mapDispatchToProps)(LabelDialog)
