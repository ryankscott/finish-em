import * as project from '../actions/project'
import uuidv4 from 'uuid'

describe('ProjectActions', () => {
    it('should create an action to create a project', () => {
        const id = uuidv4()
        const name = 'Project'
        const description = 'Desc'
        const expectedAction: project.CreateProjectAction = {
            type: project.CREATE_PROJECT,
            id: id,
            name: name,
            description: description,
        }
        expect(project.createProject(id, name, description)).toEqual(
            expectedAction,
        )
    })

    it('should create an action to delete a project', () => {
        const id = uuidv4()
        const expectedAction: project.DeleteProjectAction = {
            type: project.DELETE_PROJECT,
            id: id,
        }
        expect(project.deleteProject(id)).toEqual(expectedAction)
    })

    it('should create an action to update a project description', () => {
        const id = uuidv4()
        const description = 'foo'
        const expectedAction: project.UpdateProjectDescriptionAction = {
            type: project.UPDATE_PROJECT_DESCRIPTION,
            id: id,
            description: description,
        }
        expect(project.updateProjectDescription(id, description)).toEqual(
            expectedAction,
        )
    })
    it('should create an action to update a project name', () => {
        const id = uuidv4()
        const name = 'foo'
        const expectedAction: project.UpdateProjectNameAction = {
            type: project.UPDATE_PROJECT_NAME,
            id: id,
            name: name,
        }
        expect(project.updateProjectName(id, name)).toEqual(expectedAction)
    })
    it('should create an action to reorder a project', () => {
        const id = uuidv4()
        const destinationId = uuidv4()
        const expectedAction: project.ReorderProjectAction = {
            type: project.REORDER_PROJECT,
            id: id,
            destinationId: destinationId,
        }
        expect(project.reorderProject(id, destinationId)).toEqual(
            expectedAction,
        )
    })
})
