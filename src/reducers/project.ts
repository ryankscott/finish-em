import * as project from '../actions/project'
import { Projects } from '../interfaces'
import produce from 'immer'

const initialState: Projects = {
    projects: {
        '0': {
            id: '0',
            name: 'Inbox',
            deleted: false,
            description: 'Default landing space for all items',
            lastUpdatedAt: new Date().toISOString(),
            deletedAt: null,
            createdAt: new Date().toISOString(),
        },
    },
    order: ['0'],
}

export const projectReducer = produce(
    (draftState: Projects = initialState, action: project.ProjectActions): Projects => {
        const p = draftState?.projects[action.id]

        switch (action.type) {
            case project.CREATE_PROJECT:
                draftState.projects[action.id.toString()] = {
                    id: action.id,
                    name: action.name,
                    description: action.description,
                    deleted: false,
                    deletedAt: null,
                    createdAt: new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                }
                if (draftState.order) {
                    draftState.order = [...draftState.order, action.id]
                } else {
                    draftState.order = [action.id]
                }
                break

            case project.UPDATE_PROJECT_DESCRIPTION:
                p.description = action.description
                p.lastUpdatedAt = new Date().toISOString()
                break

            case project.UPDATE_PROJECT_NAME:
                p.name = action.name
                p.lastUpdatedAt = new Date().toISOString()
                break

            case project.DELETE_PROJECT:
                p.deleted = true
                p.lastUpdatedAt = new Date().toISOString()
                p.deletedAt = new Date().toISOString()
                // Don't forget to remove it from the ordering
                draftState.order = draftState.order.filter((p) => p != action.id)
                break

            case project.REORDER_PROJECT:
                // Initialise where everything is
                const sourceIndex = draftState.order.indexOf(action.id)
                const destinationIndex = draftState.order.indexOf(action.destinationId)
                const newOrder = draftState.order
                newOrder.splice(sourceIndex, 1)
                const startOfArray = newOrder.slice(0, destinationIndex)
                const endOfArray = newOrder.slice(destinationIndex, newOrder.length)
                draftState.order = [...startOfArray, action.id, ...endOfArray]
                break

            default:
                return draftState
        }
    },
)
