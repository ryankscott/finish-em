import { projectReducer } from '../reducers/project'
import uuidv4 from 'uuid/v4'
import Mockdate from 'mockdate'
import * as project from '../actions/project'
import { Projects } from '../interfaces'

const blankState: Projects = { projects: {}, order: [] }
// Set the date to a random date

describe('project reducer', () => {
    it('should handle create a project', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        expect(
            projectReducer(blankState, {
                type: project.CREATE_PROJECT,
                id: id,
                name: 'foo',
                description: 'this is a project',
            }),
        ).toEqual({
            projects: {
                [id]: {
                    id: id,
                    name: 'foo',
                    deleted: false,
                    description: 'this is a project',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: null,
                    createdAt: new Date().toISOString(),
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })
    it('should handle update a project description', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        expect(
            projectReducer(
                {
                    projects: {
                        [id]: {
                            id: id,
                            name: 'foo',
                            deleted: false,
                            description: 'this is a project',
                            lastUpdatedAt: new Date().toISOString(),
                            deletedAt: null,
                            createdAt: new Date().toISOString(),
                        },
                    },
                    order: [id],
                },
                {
                    type: project.UPDATE_PROJECT_DESCRIPTION,
                    id: id,
                    description: 'this is not a project',
                },
            ),
        ).toEqual({
            projects: {
                [id]: {
                    id: id,
                    name: 'foo',
                    deleted: false,
                    description: 'this is not a project',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: null,
                    createdAt: new Date().toISOString(),
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })
    it('should handle update a project name', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        expect(
            projectReducer(
                {
                    projects: {
                        [id]: {
                            id: id,
                            name: 'foo',
                            deleted: false,
                            description: 'this is a project',
                            lastUpdatedAt: new Date().toISOString(),
                            deletedAt: null,
                            createdAt: new Date().toISOString(),
                        },
                    },
                    order: [id],
                },
                {
                    type: project.UPDATE_PROJECT_NAME,
                    id: id,
                    name: 'bar',
                },
            ),
        ).toEqual({
            projects: {
                [id]: {
                    id: id,
                    name: 'bar',
                    deleted: false,
                    description: 'this is a project',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: null,
                    createdAt: new Date().toISOString(),
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })
    it('should handle deleting a project', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        expect(
            projectReducer(
                {
                    projects: {
                        [id]: {
                            id: id,
                            name: 'foo',
                            deleted: false,
                            description: 'this is a project',
                            lastUpdatedAt: new Date().toISOString(),
                            deletedAt: null,
                            createdAt: new Date().toISOString(),
                        },
                    },
                    order: [id],
                },
                {
                    type: project.DELETE_PROJECT,
                    id: id,
                },
            ),
        ).toEqual({
            projects: {
                [id]: {
                    id: id,
                    name: 'foo',
                    deleted: true,
                    description: 'this is a project',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                },
            },
            order: [],
        })
        Mockdate.reset()
    })
    it('should handle reordering projects', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const id1 = uuidv4()
        const id2 = uuidv4()
        expect(
            projectReducer(
                {
                    projects: {
                        [id]: {
                            id: id,
                            name: 'foo',
                            deleted: false,
                            description: 'this is a project',
                            lastUpdatedAt: new Date().toISOString(),
                            deletedAt: null,
                            createdAt: new Date().toISOString(),
                        },
                        [id1]: {
                            id: id1,
                            name: 'bar',
                            deleted: false,
                            description: 'desc 1',
                            lastUpdatedAt: new Date().toISOString(),
                            deletedAt: null,
                            createdAt: new Date().toISOString(),
                        },
                        [id2]: {
                            id: id2,
                            name: 'baz',
                            deleted: false,
                            description: 'desc 2',
                            lastUpdatedAt: new Date().toISOString(),
                            deletedAt: null,
                            createdAt: new Date().toISOString(),
                        },
                    },
                    order: [id, id1, id2],
                },
                {
                    type: project.REORDER_PROJECT,
                    id: id,
                    destinationId: id2,
                },
            ),
        ).toEqual({
            projects: {
                [id]: {
                    id: id,
                    name: 'foo',
                    deleted: false,
                    description: 'this is a project',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: null,
                    createdAt: new Date().toISOString(),
                },
                [id1]: {
                    id: id1,
                    name: 'bar',
                    deleted: false,
                    description: 'desc 1',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: null,
                    createdAt: new Date().toISOString(),
                },
                [id2]: {
                    id: id2,
                    name: 'baz',
                    deleted: false,
                    description: 'desc 2',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: null,
                    createdAt: new Date().toISOString(),
                },
            },
            order: [id1, id2, id],
        })
        Mockdate.reset()
    })
})
it('should handle reordering projects', () => {
    Mockdate.set('2020-02-20')
    const id = uuidv4()
    const id1 = uuidv4()
    const id2 = uuidv4()
    expect(
        projectReducer(
            {
                projects: {
                    [id]: {
                        id: id,
                        name: 'foo',
                        deleted: false,
                        description: 'this is a project',
                        lastUpdatedAt: new Date().toISOString(),
                        deletedAt: null,
                        createdAt: new Date().toISOString(),
                    },
                    [id1]: {
                        id: id1,
                        name: 'bar',
                        deleted: false,
                        description: 'desc 1',
                        lastUpdatedAt: new Date().toISOString(),
                        deletedAt: null,
                        createdAt: new Date().toISOString(),
                    },
                    [id2]: {
                        id: id2,
                        name: 'baz',
                        deleted: false,
                        description: 'desc 2',
                        lastUpdatedAt: new Date().toISOString(),
                        deletedAt: null,
                        createdAt: new Date().toISOString(),
                    },
                },
                order: [id, id1, id2],
            },
            {
                type: project.REORDER_PROJECT,
                id: id2,
                destinationId: id1,
            },
        ),
    ).toEqual({
        projects: {
            [id]: {
                id: id,
                name: 'foo',
                deleted: false,
                description: 'this is a project',
                lastUpdatedAt: new Date().toISOString(),
                deletedAt: null,
                createdAt: new Date().toISOString(),
            },
            [id1]: {
                id: id1,
                name: 'bar',
                deleted: false,
                description: 'desc 1',
                lastUpdatedAt: new Date().toISOString(),
                deletedAt: null,
                createdAt: new Date().toISOString(),
            },
            [id2]: {
                id: id2,
                name: 'baz',
                deleted: false,
                description: 'desc 2',
                lastUpdatedAt: new Date().toISOString(),
                deletedAt: null,
                createdAt: new Date().toISOString(),
            },
        },
        order: [id, id2, id1],
    })
    Mockdate.reset()
})
