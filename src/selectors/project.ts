import { Project } from '../interfaces'

export const getProjects = (state): Project => state.projects.projects

export const getProjectsByArea = (state, areaId: string): Project => {
    return Object.keys(state.projects.projects)
        .filter((key) => state.projects.projects[key].areaId == areaId)
        .reduce((res, key) => ((res[key] = state.projects.projects[key]), res), {})
}
