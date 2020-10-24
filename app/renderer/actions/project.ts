export const CREATE_PROJECT = 'CREATE_PROJECT'
export const DELETE_PROJECT = 'DELETE_PROJECT'
export const UPDATE_PROJECT_DESCRIPTION = 'UPDATE_PROJECT_DESCRIPTION'
export const UPDATE_PROJECT_NAME = 'UPDATE_PROJECT_NAME'
export const REORDER_PROJECT = 'REORDER_PROJECT'
export const SET_PROJECT_START_DATE = 'SET_PROJECT_START_DATE'
export const SET_PROJECT_END_DATE = 'SET_PROJECT_END_DATE'
export const SET_PROJECT_AREA = 'SET_PROJECT_AREA'

export interface CreateProjectAction {
    type: typeof CREATE_PROJECT
    id: string
    name: string
    description: string
    areaId: string
}
export function createProject(
    id: string,
    name: string,
    description: string,
    areaId: string,
): CreateProjectAction {
    return {
        type: CREATE_PROJECT,
        id: id,
        name: name,
        description: description,
        areaId: areaId,
    }
}

export interface DeleteProjectAction {
    type: typeof DELETE_PROJECT
    id: string
}
export function deleteProject(id: string): DeleteProjectAction {
    return {
        type: DELETE_PROJECT,
        id: id,
    }
}
export interface UpdateProjectDescriptionAction {
    type: typeof UPDATE_PROJECT_DESCRIPTION
    id: string
    description: string
}
export function updateProjectDescription(
    id: string,
    description: string,
): UpdateProjectDescriptionAction {
    return {
        type: UPDATE_PROJECT_DESCRIPTION,
        id: id,
        description: description,
    }
}
export interface UpdateProjectNameAction {
    type: typeof UPDATE_PROJECT_NAME
    id: string
    name: string
}
export function updateProjectName(id: string, name: string): UpdateProjectNameAction {
    return {
        type: UPDATE_PROJECT_NAME,
        id: id,
        name: name,
    }
}

export interface ReorderProjectAction {
    type: typeof REORDER_PROJECT
    id: string
    destinationId: string
}
export function reorderProject(id: string, destinationId: string): ReorderProjectAction {
    return {
        type: REORDER_PROJECT,
        id: id,
        destinationId: destinationId,
    }
}

export interface SetProjectStartDateAction {
    type: typeof SET_PROJECT_START_DATE
    id: string
    date: string
}
export function setProjectStartDate(id: string, date: string): SetProjectStartDateAction {
    return {
        type: SET_PROJECT_START_DATE,
        id: id,
        date: date,
    }
}
export interface SetProjectEndDateAction {
    type: typeof SET_PROJECT_END_DATE
    id: string
    date: string
}
export function setProjectEndDate(id: string, date: string): SetProjectEndDateAction {
    return {
        type: SET_PROJECT_END_DATE,
        id: id,
        date: date,
    }
}

export interface SetProjectAreaAction {
    type: typeof SET_PROJECT_AREA
    id: string
    areaId: string
}

export function setProjectArea(id: string, areaId: string): SetProjectAreaAction {
    return {
        type: SET_PROJECT_AREA,
        id: id,
        areaId: areaId,
    }
}

export type ProjectActions =
    | CreateProjectAction
    | DeleteProjectAction
    | UpdateProjectDescriptionAction
    | UpdateProjectNameAction
    | ReorderProjectAction
    | SetProjectStartDateAction
    | SetProjectEndDateAction
    | SetProjectAreaAction
