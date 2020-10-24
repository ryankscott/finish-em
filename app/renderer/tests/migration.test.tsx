import { v4 as uuidv4 } from 'uuid'
import Mockdate from 'mockdate'
import { ItemType, ProjectType, Items, Label } from '../interfaces'
import {
    migratev2tov3Items,
    migratev5tov6Projects,
    migratev5tov6Items,
    migratev7tov8Items,
    migratev11tov12Labels,
} from '../store/migrations'

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
                projectId: '0',
                children: [],
                flagged: false,
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
                projectId: '0',
                parentId: id,
                children: [],
                flagged: false,
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
                projectId: '0',
                parentId: id,
                children: [],
                flagged: false,
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
                    projectId: '0',
                    children: [],
                    flagged: false,
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
                    projectId: '0',
                    parentId: id,
                    children: [],
                    flagged: false,
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
                    flagged: false,
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
                    projectId: '0',
                    children: [],
                    flagged: false,
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
                    projectId: '0',
                    parentId: id,
                    children: [],
                    flagged: false,
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
                    flagged: false,
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
                    flagged: false,
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
                    projectId: '0',
                    parentId: id,
                    children: [],
                    flagged: false,
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
                    flagged: false,
                },
            },
            order: [id, childId1, childId2],
        })
        Mockdate.reset()
    })
    // Removes flagged value, introduces labelId
    it('should handle migration of a v7 item to a v8 item without flags', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const v7Items: Items = {
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
                    flagged: false,
                },
            },
            order: [id],
        }
        expect(migratev7tov8Items(v7Items)).toEqual({
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
                    labelId: null,
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })
    // If it has a flag it should be migrated to a blocked label
    it('should handle migration of a v7 item to a v8 item without flags', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()

        const v7Items: Items = {
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
                    flagged: true,
                },
            },
            order: [id],
        }
        expect(migratev7tov8Items(v7Items)).toEqual({
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
                    labelId: '4702c2d3-bcda-40a2-bd34-e0db07578076',
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })
    it('should handle migration of a v11 label to a v12 label', () => {
        const v11Labels: Label = {
            '4702c2d3-bcda-40a2-bd34-e0db07578076': {
                id: '4702c2d3-bcda-40a2-bd34-e0db07578076',
                name: 'Blocked',
                colour: '#fe5e41',
            },
            '5bd4d5ce-447f-45d5-a557-c8942bbfbae4': {
                id: '5bd4d5ce-447f-45d5-a557-c8942bbfbae4',
                name: 'High Priority',
                colour: '#f9df77',
            },
            'a342c159-9691-4684-a109-156ba46c1ea4': {
                id: 'a342c159-9691-4684-a109-156ba46c1ea4',
                name: 'Pending',
                colour: '#59cd90',
            },
        }
        expect(migratev11tov12Labels(v11Labels)).toEqual({
            labels: {
                '4702c2d3-bcda-40a2-bd34-e0db07578076': {
                    id: '4702c2d3-bcda-40a2-bd34-e0db07578076',
                    name: 'Blocked',
                    colour: '#fe5e41',
                },
                '5bd4d5ce-447f-45d5-a557-c8942bbfbae4': {
                    id: '5bd4d5ce-447f-45d5-a557-c8942bbfbae4',
                    name: 'High Priority',
                    colour: '#f9df77',
                },
                'a342c159-9691-4684-a109-156ba46c1ea4': {
                    id: 'a342c159-9691-4684-a109-156ba46c1ea4',
                    name: 'Pending',
                    colour: '#59cd90',
                },
            },
            order: [
                '4702c2d3-bcda-40a2-bd34-e0db07578076',
                '5bd4d5ce-447f-45d5-a557-c8942bbfbae4',
                'a342c159-9691-4684-a109-156ba46c1ea4',
            ],
        })
    })
})
