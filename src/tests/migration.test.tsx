import uuidv4 from 'uuid/v4'
import Mockdate from 'mockdate'
import { ItemType, ProjectType, Items } from '../interfaces'
import {
    migratev2tov3Items,
    migratev5tov6Projects,
    migratev5tov6Items,
} from '../store'

describe('migration tests', () => {
    it('should handle migration of a v2 item to a v3 item', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const childId1 = uuidv4()
        const childId2 = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()

        const v2Items: ItemType[] = [
            {
                id: id,
                type: 'TODO',
                text: 'TODO Run the tests',
                scheduledDate: null,
                dueDate: null,
                completed: false,
                deleted: false,
                deletedAt: null,
                completedAt: null,
                createdAt: new Date().toISOString(),
                lastUpdatedAt: new Date().toISOString(),
                repeat: null,
                parentId: null,
                projectId: undefined,
                children: [],
            },
            {
                id: childId1,
                type: 'TODO',
                text: 'TODO Eat dinner',
                scheduledDate: null,
                dueDate: null,
                completed: false,
                deleted: false,
                deletedAt: null,
                completedAt: null,
                createdAt: createdAt,
                lastUpdatedAt: lastUpdatedAt,
                repeat: null,
                projectId: undefined,
                parentId: id,
                children: [],
            },
            {
                id: childId2,
                type: 'TODO',
                text: 'TODO Eat dessert',
                scheduledDate: null,
                dueDate: null,
                completed: false,
                deleted: false,
                deletedAt: null,
                completedAt: null,
                createdAt: createdAt,
                lastUpdatedAt: lastUpdatedAt,
                repeat: null,
                projectId: undefined,
                parentId: id,
                children: [],
            },
        ]

        expect(migratev2tov3Items(v2Items)).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    projectId: undefined,
                    children: [],
                },
                [childId1]: {
                    id: childId1,
                    type: 'TODO',
                    text: 'TODO Eat dinner',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    projectId: undefined,
                    parentId: id,
                    children: [],
                },
                [childId2]: {
                    id: childId2,
                    type: 'TODO',
                    text: 'TODO Eat dessert',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    projectId: undefined,
                    parentId: id,
                    children: [],
                },
            },
            order: [id, childId1, childId2],
        })
        Mockdate.reset()
    })
    it('should handle the migration of a project of v5 to v6', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const id1 = uuidv4()
        const id2 = uuidv4()

        const v5Projects: ProjectType[] = [
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
                id: id,
                name: 'Finish Em',
                deleted: false,
                description: 'All items relating to this project',
                lastUpdatedAt: new Date().toISOString(),
                deletedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            },
            {
                id: id1,
                name: 'Home',
                deleted: false,
                description: 'All items for home',
                lastUpdatedAt: new Date().toISOString(),
                deletedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            },
            {
                id: id2,
                name: 'Work',
                deleted: false,
                description: 'Non descript work items',
                lastUpdatedAt: new Date().toISOString(),
                deletedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
            },
        ]

        expect(migratev5tov6Projects(v5Projects)).toEqual({
            projects: {
                '0': {
                    id: '0',
                    name: 'Inbox',
                    deleted: false,
                    description: 'Default landing space for all items',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                },
                [id]: {
                    id: id,
                    name: 'Finish Em',
                    deleted: false,
                    description: 'All items relating to this project',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                },
                [id1]: {
                    id: id1,
                    name: 'Home',
                    deleted: false,
                    description: 'All items for home',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                },
                [id2]: {
                    id: id2,
                    name: 'Work',
                    deleted: false,
                    description: 'Non descript work items',
                    lastUpdatedAt: new Date().toISOString(),
                    deletedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                },
            },
            order: ['0', id, id1, id2],
        })
    })
    it('should handle migration of a v5 item to a v6 item', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const childId1 = uuidv4()
        const childId2 = uuidv4()
        const projectId = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()

        const v5Items: Items = {
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    projectId: null,
                    children: [],
                },
                [childId1]: {
                    id: childId1,
                    type: 'TODO',
                    text: 'TODO Eat dinner',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    projectId: projectId,
                    parentId: id,
                    children: [],
                },
                [childId2]: {
                    id: childId2,
                    type: 'TODO',
                    text: 'TODO Eat dessert',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    projectId: null,
                    parentId: id,
                    children: [],
                },
            },
            order: [id, childId1, childId2],
        }
        expect(migratev5tov6Items(v5Items)).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    projectId: '0',
                    children: [],
                },
                [childId1]: {
                    id: childId1,
                    type: 'TODO',
                    text: 'TODO Eat dinner',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    projectId: projectId,
                    parentId: id,
                    children: [],
                },
                [childId2]: {
                    id: childId2,
                    type: 'TODO',
                    text: 'TODO Eat dessert',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    projectId: '0',
                    parentId: id,
                    children: [],
                },
            },
            order: [id, childId1, childId2],
        })
        Mockdate.reset()
    })
})
