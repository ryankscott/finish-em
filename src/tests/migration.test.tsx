import uuidv4 from 'uuid/v4'
import Mockdate from 'mockdate'
import { ItemType } from '../interfaces'
import { migratev2tov3Items } from '../store'

describe('migration v2 test', () => {
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
})
