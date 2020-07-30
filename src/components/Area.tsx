import React, { ReactElement } from 'react'
import { ThemeProvider } from '../StyledComponents'
import { useHistory } from 'react-router-dom'
import { connect } from 'react-redux'
import { themes } from '../theme'
import { updateAreaDescription, updateAreaName, deleteArea } from '../actions'
import { Title, Header } from './Typography'
import EditableText from './EditableText'
import { Donut } from './Donut'
import { darken } from 'polished'
import { Uuid } from '@typed/uuid'
import { AreaType, ProjectType, Projects } from '../interfaces'
import {
    AreaContainer,
    HeaderContainer,
    ProjectContainer,
    ProjectName,
    ProjectDescription,
    ProjectEndAt,
    ProjectStartAt,
} from './styled/Area'
import DeleteAreaDialog from './DeleteAreaDialog'

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
    projects: Projects
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
                    <DeleteAreaDialog onDelete={() => deleteArea()} />
                </HeaderContainer>

                <EditableText
                    placeholder="Add a description for your Area..."
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
                <Header>Projects</Header>
                {Object.values(props.projects.projects)
                    .filter((p: ProjectType) => p.areaId == props.area.id)
                    .map((a: ProjectType) => (
                        <ProjectContainer
                            key={a.id}
                            onClick={() => {
                                history.push(`/projects/${a.id}`)
                            }}
                        >
                            <Donut
                                style={{ gridArea: 'donut' }}
                                size={30}
                                progress={40}
                                activeColour={themes[props.theme].colours.primaryColour}
                                inactiveColour={darken(
                                    0.2,
                                    themes[props.theme].colours.backgroundColour,
                                )}
                            />
                            <ProjectName>{a.name}</ProjectName>
                            <ProjectDescription>{a.description}</ProjectDescription>
                            <ProjectStartAt>{a.startAt}</ProjectStartAt>
                            <ProjectEndAt>{a.endAt}</ProjectEndAt>
                        </ProjectContainer>
                    ))}
            </AreaContainer>
        </ThemeProvider>
    )
}

const mapStateToProps = (state, props): StateProps => ({
    theme: state.ui.theme,
    projects: state.projects,
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
    },
    toggleDeleteAreaDialog: () => {
        dispatch(toggleDeleteAreaDialog())
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(Area)
