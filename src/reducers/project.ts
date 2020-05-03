import uuidv4 from 'uuid/v4'
import * as project from '../actions/project'
import { ProjectType } from '../interfaces'

const initialState: ProjectType[] = [
    {
        id: null,
        name: 'Inbox',
        deleted: false,
        description: 'Default landing space for all items',
        lastUpdatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: 'Finish Em',
        deleted: false,
        description: 'All items relating to this project',
        lastUpdatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: 'Home',
        deleted: false,
        description: 'All items for home',
        lastUpdatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        name: 'Work',
        deleted: false,
        description: 'Non descript work items',
        lastUpdatedAt: new Date().toISOString(),
        deletedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
    },
]

export const projectReducer = (
    state = initialState,
    action: project.ProjectActions,
): ProjectType[] => {
    switch (action.type) {
        case project.CREATE_PROJECT:
            return [
                ...state,
                {
                    id: action.id,
                    name: action.name,
                    description: action.description,
                    deleted: false,
                    deletedAt: null,
                    createdAt: new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                },
            ]

        case project.UPDATE_PROJECT_DESCRIPTION:
            return state.map((p) => {
                if (p.id == action.id) {
                    p.description = action.description
                    p.lastUpdatedAt = new Date().toISOString()
                }
                return p
            })

        case project.UPDATE_PROJECT_NAME:
            return state.map((p) => {
                if (p.id == action.id) {
                    p.name = action.name
                    p.lastUpdatedAt = new Date().toISOString()
                }
                return p
            })

        case project.DELETE_PROJECT:
            return state.map((p) => {
                if (p.id == action.id) {
                    p.deleted = true
                    p.lastUpdatedAt = new Date().toISOString()
                    p.deletedAt = new Date().toISOString()
                }
                return p
            })

        default:
            return state
    }
}
