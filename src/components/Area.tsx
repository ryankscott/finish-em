import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { themes } from '../theme'
import { updateAreaDescription, updateAreaName, deleteArea } from '../actions'
import { Title } from './Typography'
import EditableText from './EditableText'
import { Uuid } from '@typed/uuid'
import { AreaType } from '../interfaces'
import { AreaContainer, HeaderContainer } from './styled/Area'

interface StateProps {
    theme: string
}

interface DispatchProps {
    deleteArea: (id: Uuid | '0') => void
    updateDescription: (id: Uuid | '0', input: string) => void
    updateName: (id: Uuid | '0', input: string) => void
    toggleDeleteAreaDialog: () => void
}

interface OwnProps {
    area: AreaType
}

type AreaProps = DispatchProps & OwnProps & StateProps
const Area = (props: AreaProps): ReactElement => {
    const history = useHistory()

    const name = React.useRef<HTMLInputElement>()
    const description = React.useRef<HTMLInputElement>()

    function deleteArea(): void {
        props.deleteArea(props.area.id)
        history.push('/inbox')
        return
    }

    return (
        <ThemeProvider theme={themes[props.theme]}>
            <AreaContainer>
                <HeaderContainer>
                    <EditableText
                        shouldSubmitOnBlur={true}
                        key={props.area.id + 'name'}
                        input={props.area.name}
                        style={Title}
                        singleline={true}
                        innerRef={name}
                        onUpdate={(input) => {
                            props.updateName(props.area.id, input)
                        }}
                        shouldClearOnSubmit={false}
                    />
                    {/* <DeleteAreaDialog onDelete={() => deleteArea()} /> */}
                </HeaderContainer>

                <EditableText
                    shouldSubmitOnBlur={true}
                    key={props.area.id + 'description'}
                    onUpdate={(input) => {
                        props.updateDescription(props.area.id, input)
                    }}
                    innerRef={description}
                    input={props.area.description}
                    height="150px"
                    shouldClearOnSubmit={false}
                />
            </AreaContainer>
        </ThemeProvider>
    )
}

const mapStateToProps = (state, props): StateProps => ({
    theme: state.ui.theme,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    updateDescription: (id: Uuid, text: string) => {
        dispatch(updateAreaDescription(id, text))
    },
    updateName: (id: Uuid, text: string) => {
        dispatch(updateAreaName(id, text))
    },
    deleteArea: (id: Uuid) => {
        dispatch(deleteArea(id))
        dispatch(deleteView(id))
        dispatch(hideDeleteAreaDialog())
    },
    toggleDeleteAreaDialog: () => {
        dispatch(toggleDeleteAreaDialog())
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Area)
