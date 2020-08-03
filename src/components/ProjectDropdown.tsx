import React, { ReactElement, useState, useEffect, useRef } from 'react'
import { ThemeProvider } from '../StyledComponents'
import CreatableSelect from 'react-select/creatable'
import { v4 as uuidv4 } from 'uuid'
import { themes, selectStyles } from '../theme'

import { connect } from 'react-redux'
import { createProject } from '../actions'
import { Project, ProjectType, Area, Projects, Areas } from '../interfaces'
import { Container } from './styled/ProjectDropdown'
import Button from './Button'
import { GroupType } from 'react-select'
import { groupBy } from '../utils'

type OptionType = { value: string; label: JSX.Element | string }

const generateOptions = (
    project: ProjectType,
    areas: Area,
    projects: Project,
): GroupType<OptionType>[] => {
    const p = Object.values(projects)
    const filteredProjects = p
        .filter((p) => p.id != '0')
        .filter((p) => p.id != project.id)
        .filter((p) => p.deleted == false)

    const groupedProjects = groupBy(filteredProjects, 'areaId')
    const allGroups = Object.keys(groupedProjects).map((i) => {
        const group: GroupType<OptionType> = { label: '', options: [] }
        group['label'] = areas[i].name
        group['options'] = groupedProjects[i].map((p) => {
            return {
                value: p.id,
                label: p.name,
            }
        })
        return group
    })

    // Sort to ensure that the current project is at the front
    allGroups.sort((a, b) =>
        a.label == areas[project.areaId].name ? -1 : b.label == areas[project.areaId].name ? 1 : 0,
    )

    return allGroups
}

interface DispatchProps {
    createProject: (id: string, value: string | '0') => void
}
interface StateProps {
    projects: Projects
    theme: string
    areas: Areas
}
interface OwnProps {
    onSubmit: (value: string | '0') => void
    onEscape?: () => void
    style?: 'primary' | 'subtle' | 'subtleInvert' | 'default'
    projectId: string | '0'
    completed: boolean
    deleted: boolean
    showSelect?: boolean
}

type ProjectDropdownProps = DispatchProps & StateProps & OwnProps
function ProjectDropdown(props: ProjectDropdownProps): ReactElement {
    const [showSelect, setShowSelect] = useState(false)
    const project = props.projects.projects[props.projectId]
    const handleChange = (newValue, actionMeta): void => {
        if (actionMeta.action == 'select-option') {
            props.onSubmit(newValue.value)
        } else if (actionMeta.action == 'create-option') {
            const newProjectId = uuidv4()
            props.createProject(newProjectId, newValue.value)
            props.onSubmit(newProjectId)
        }
        setShowSelect(false)
        return
    }
    const node = useRef<HTMLDivElement>()

    const handleClick = (e): null => {
        if (node.current.contains(e.target)) {
            return
        }
        setShowSelect(false)
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClick)
        return () => {
            document.removeEventListener('mousedown', handleClick)
        }
    }, [])

    // Only render if it's not just the Inbox project that exists
    return (
        <ThemeProvider theme={themes[props.theme]}>
            <div ref={node}>
                <Button
                    spacing="compact"
                    type={props.style || 'default'}
                    onClick={(e) => {
                        if (props.completed) return
                        setShowSelect(!showSelect)
                        e.stopPropagation()
                    }}
                    text={project.name}
                    isDisabled={props.deleted}
                />
                {(showSelect || props.showSelect) && (
                    <Container visible={props.projects.order.length > 1}>
                        <CreatableSelect
                            autoFocus={true}
                            placeholder={'Project:'}
                            isSearchable
                            onChange={handleChange}
                            options={generateOptions(
                                project,
                                props.areas.areas,
                                props.projects.projects,
                            )}
                            styles={selectStyles({
                                fontSize: 'xxsmall',
                                theme: themes[props.theme],
                            })}
                            escapeClearsValue={true}
                            defaultMenuIsOpen={true}
                            onKeyDown={(e) => {
                                if (e.key == 'Escape') {
                                    setShowSelect(false)
                                    if (props.onEscape) {
                                        props.onEscape()
                                    }
                                }
                            }}
                        />
                    </Container>
                )}
            </div>
        </ThemeProvider>
    )
}

const mapStateToProps = (state): StateProps => ({
    projects: state.projects,
    theme: state.ui.theme,
    areas: state.areas,
})
const mapDispatchToProps = (dispatch): DispatchProps => ({
    createProject: (id: string, name: string) => {
        dispatch(createProject(id, name, '', '0'))
    },
})
export default connect(mapStateToProps, mapDispatchToProps)(ProjectDropdown)
