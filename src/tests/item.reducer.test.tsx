import Mockdate from 'mockdate'
import RRule from 'rrule'
import { v4 as uuidv4 } from 'uuid'
import * as item from '../actions/item'
import { Items } from '../interfaces'
import { itemReducer } from '../reducers/item'

const blankState: Items = { items: {}, order: [] }
// Set the date to a random date

describe('item reducer', () => {
    it('should handle create an item with no projectID', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        expect(
            itemReducer(blankState, {
                id: id,
                type: item.CREATE_ITEM,
                text: 'TODO Run the tests',
            }),
        ).toEqual({
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

    it('should handle create an item with due date text - multi-line', () => {
        const id = uuidv4()
        expect(
            itemReducer(blankState, {
                id: id,
                type: item.CREATE_ITEM,
                text: 'TODO Run the tests due:"7th January"',
            }),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: null,
                    dueDate: new Date(Date.UTC(2020, 0, 7, 0, 0, 0)).toISOString(),
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
    })

    it('should handle create an item with projectID', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const projectId = uuidv4()
        expect(
            itemReducer(blankState, {
                id: id,
                type: item.CREATE_ITEM,
                text: 'TODO Run the tests',
                projectId: projectId,
            }),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: null,
                    dueDate: null,
                    projectId: projectId,
                    parentId: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: new Date().toISOString(),
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    children: [],
                    labelId: null,
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should delete an item and persist the dueDate and scheduled date', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const dueDate = new Date(1990, 1, 1).toISOString()
        const scheduledDate = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()

        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO Run the tests',
                            scheduledDate: scheduledDate,
                            dueDate: dueDate,
                            completed: false,
                            deleted: true,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            children: [],
                            labelId: null,
                            projectId: '0',
                        },
                    },
                    order: [id],
                },
                {
                    id: id,
                    type: item.DELETE_ITEM,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: scheduledDate,
                    dueDate: dueDate,
                    completed: false,
                    deleted: true,
                    deletedAt: new Date().toISOString(),
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    children: [],
                    labelId: null,
                    projectId: '0',
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should delete all subtasks when a parent is deleted', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const childId1 = uuidv4()
        const childId2 = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
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
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            children: [childId1, childId2],
                            projectId: '0',
                            labelId: null,
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
                            parentId: id,
                            children: [],
                            projectId: '0',
                            labelId: null,
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
                            parentId: id,
                            children: [],
                            projectId: '0',
                            labelId: null,
                        },
                    },
                    order: [id, childId1, childId2],
                },
                {
                    id: id,
                    type: item.DELETE_ITEM,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: true,
                    deletedAt: new Date().toISOString(),
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    children: [childId1, childId2],
                    projectId: '0',
                    labelId: null,
                },
                [childId1]: {
                    id: childId1,
                    type: 'TODO',
                    text: 'TODO Eat dinner',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: true,
                    deletedAt: new Date().toISOString(),
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: id,
                    children: [],
                    projectId: '0',
                    labelId: null,
                },
                [childId2]: {
                    id: childId2,
                    type: 'TODO',
                    text: 'TODO Eat dessert',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: true,
                    deletedAt: new Date().toISOString(),
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: id,
                    children: [],
                    projectId: '0',
                    labelId: null,
                },
            },
            order: [id, childId1, childId2],
        }),
            Mockdate.reset()
    })

    it('should remove the parentId from the child and the childId from the parent, when the child is deleted', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const childId1 = uuidv4()
        const childId2 = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
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
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            children: [childId1, childId2],
                            projectId: '0',
                            labelId: null,
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
                            parentId: id,
                            children: [],
                            projectId: '0',
                            labelId: null,
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
                            parentId: id,
                            children: [],
                            projectId: '0',
                            labelId: null,
                        },
                    },
                    order: [id, childId1, childId2],
                },
                {
                    id: childId1,
                    type: item.DELETE_ITEM,
                },
            ),
        ).toEqual({
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
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    children: [childId2],
                    projectId: '0',
                    labelId: null,
                },
                [childId1]: {
                    id: childId1,
                    type: 'TODO',
                    text: 'TODO Eat dinner',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: true,
                    deletedAt: new Date().toISOString(),
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    children: [],
                    projectId: '0',
                    labelId: null,
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
                    parentId: id,
                    children: [],
                    projectId: '0',
                    labelId: null,
                },
            },
            order: [id, childId1, childId2],
        })
        Mockdate.reset()
    })

    it('should handle undeleting an item', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const deletedAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO Run the tests',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: true,
                            deletedAt: deletedAt,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            children: [],
                            projectId: '0',
                            labelId: null,
                        },
                    },
                    order: [id],
                },
                {
                    id: id,
                    type: item.UNDELETE_ITEM,
                },
            ),
        ).toEqual({
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
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    children: [],
                    projectId: '0',
                    labelId: null,
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should handle the completing of an item without a repeat', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        const scheduledDate = new Date(1990, 1, 3).toISOString()
        const dueDate = new Date(1990, 1, 3).toISOString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO Run the tests',
                            scheduledDate: scheduledDate,
                            dueDate: dueDate,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            children: [],
                            projectId: '0',
                            labelId: null,
                        },
                    },
                    order: [id],
                },
                {
                    id: id,
                    type: item.COMPLETE_ITEM,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: scheduledDate,
                    dueDate: dueDate,
                    completed: true,
                    deleted: false,
                    deletedAt: null,
                    completedAt: new Date().toISOString(),
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    children: [],
                    projectId: '0',
                    labelId: null,
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should set the due date of a repeating item to the next occurence of the repeat when completing', () => {
        Mockdate.set('1990-02-03')
        const id = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        const scheduledDate = new Date(1990, 1, 3).toISOString()
        const dueDate = new Date(1990, 1, 3).toISOString()
        const repeat = new RRule({
            freq: RRule.DAILY,
            interval: 1,
            dtstart: new Date(Date.UTC(1990, 1, 3, 0, 0)),
        }).toString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO Run the tests',
                            scheduledDate: scheduledDate,
                            projectId: '0',
                            dueDate: dueDate,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: repeat,
                            parentId: null,
                            children: [],
                            labelId: null,
                        },
                    },
                    order: [id],
                },
                {
                    id: id,
                    type: item.COMPLETE_ITEM,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: scheduledDate,
                    projectId: '0',
                    dueDate: new Date(Date.UTC(1990, 1, 4)).toISOString(),
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: repeat,
                    parentId: null,
                    children: [],
                    labelId: null,
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should persist the scheduled date and due when uncompleting of an item without a repeat ', () => {
        Mockdate.set('1990-02-03')
        const id = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        const scheduledDate = new Date(1990, 1, 3).toISOString()
        const dueDate = new Date(1990, 1, 3).toISOString()
        const completedAt = new Date(1990, 1, 3).toISOString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO Run the tests',
                            scheduledDate: scheduledDate,
                            dueDate: dueDate,
                            completed: true,
                            deleted: false,
                            deletedAt: null,
                            completedAt: completedAt,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            children: [],
                            projectId: '0',
                            labelId: null,
                        },
                    },
                    order: [id],
                },
                {
                    id: id,
                    type: item.UNCOMPLETE_ITEM,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: scheduledDate,
                    dueDate: dueDate,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
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

    it('should handle the uncompleting of an item with a repeat', () => {
        Mockdate.set('1990-02-03')
        const id = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        const scheduledDate = new Date(1990, 1, 3).toISOString()
        const dueDate = new Date(1990, 1, 3).toISOString()
        const completedAt = new Date(1990, 1, 3).toISOString()
        const repeat = new RRule({
            freq: RRule.DAILY,
            interval: 1,
        }).toString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO Run the tests',
                            scheduledDate: scheduledDate,
                            dueDate: dueDate,
                            completed: true,
                            deleted: false,
                            deletedAt: null,
                            completedAt: completedAt,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: repeat,
                            parentId: null,
                            children: [],
                            labelId: null,
                            projectId: '0',
                        },
                    },
                    order: [id],
                },
                {
                    id: id,
                    type: item.UNCOMPLETE_ITEM,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: scheduledDate,
                    dueDate: dueDate,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: repeat,
                    parentId: null,
                    children: [],
                    labelId: null,
                    projectId: '0',
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should handle adding a child to an item', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const childId = uuidv4()
        const projectId = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
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
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: projectId,
                            children: [],
                            labelId: null,
                        },
                        [childId]: {
                            id: childId,
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
                            parentId: null,
                            projectId: null,
                            children: [],
                            labelId: null,
                        },
                    },
                    order: [id, childId],
                },
                {
                    id: childId,
                    type: item.ADD_CHILD_ITEM,
                    parentId: id,
                },
            ),
        ).toEqual({
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
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    projectId: projectId,
                    children: [childId],
                    labelId: null,
                },
                [childId]: {
                    id: childId,
                    type: 'TODO',
                    text: 'TODO Eat dinner',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: id,
                    projectId: projectId,
                    children: [],
                    labelId: null,
                },
            },
            order: [id, childId],
        })
        Mockdate.reset()
    })

    it('should fail to add a child to a parent that has a parent (i.e. one level of children)', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const id1 = uuidv4()
        const childId = uuidv4()
        const projectId = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
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
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: projectId,
                            children: [childId],
                            labelId: null,
                        },
                        [childId]: {
                            id: childId,
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
                            parentId: id,
                            projectId: null,
                            children: [],
                            labelId: null,
                        },
                        [id1]: {
                            id: id1,
                            type: 'TODO',
                            text: 'TODO Eat eclairs',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: projectId,
                            children: [],
                            labelId: null,
                        },
                    },
                    order: [id, childId, id1],
                },
                {
                    id: id1,
                    type: item.ADD_CHILD_ITEM,
                    parentId: childId,
                },
            ),
        ).toEqual({
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
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    projectId: projectId,
                    children: [childId],
                    labelId: null,
                },
                [childId]: {
                    id: childId,
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
                    parentId: id,
                    projectId: null,
                    children: [],
                    labelId: null,
                },
                [id1]: {
                    id: id1,
                    type: 'TODO',
                    text: 'TODO Eat eclairs',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    projectId: projectId,
                    children: [],
                    labelId: null,
                },
            },
            order: [id, childId, id1],
        })
        Mockdate.reset()
    })

    it('should handle reordering items - start to end', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const id2 = uuidv4()
        const id3 = uuidv4()
        const projectId = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO First item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: projectId,
                            children: [],
                            labelId: null,
                        },
                        [id2]: {
                            id: id2,
                            type: 'TODO',
                            text: 'TODO Second Item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: '0',
                            labelId: null,
                            children: [],
                        },
                        [id3]: {
                            id: id3,
                            type: 'TODO',
                            text: 'TODO Third item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            children: [],
                            projectId: '0',
                            labelId: null,
                        },
                    },
                    order: [id, id2, id3],
                },
                {
                    id: id3,
                    type: item.REORDER_ITEM,
                    destinationId: id,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO First item',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    projectId: projectId,
                    children: [],
                    labelId: null,
                },
                [id2]: {
                    id: id2,
                    type: 'TODO',
                    text: 'TODO Second Item',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    children: [],
                    projectId: '0',
                    labelId: null,
                },
                [id3]: {
                    id: id3,
                    type: 'TODO',
                    text: 'TODO Third item',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    children: [],
                    projectId: '0',
                    labelId: null,
                },
            },
            order: [id3, id, id2],
        })
        Mockdate.reset()
    })

    it('should handle reordering items - middle', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const id2 = uuidv4()
        const id3 = uuidv4()
        const projectId = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO First item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: projectId,
                            children: [],
                            labelId: null,
                        },
                        [id2]: {
                            id: id2,
                            type: 'TODO',
                            text: 'TODO Second Item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: '0',
                            children: [],
                            labelId: null,
                        },
                        [id3]: {
                            id: id3,
                            type: 'TODO',
                            text: 'TODO Third item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: '0',
                            children: [],
                            labelId: null,
                        },
                    },
                    order: [id, id2, id3],
                },
                {
                    id: id3,
                    type: item.REORDER_ITEM,
                    destinationId: id2,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO First item',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    projectId: projectId,
                    children: [],
                    labelId: null,
                },
                [id2]: {
                    id: id2,
                    type: 'TODO',
                    text: 'TODO Second Item',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    projectId: '0',
                    children: [],
                    labelId: null,
                },
                [id3]: {
                    id: id3,
                    type: 'TODO',
                    text: 'TODO Third item',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    projectId: '0',
                    children: [],
                    labelId: null,
                },
            },
            order: [id, id3, id2],
        })
        Mockdate.reset()
    })

    it('should handle reordering items - reverse', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const id2 = uuidv4()
        const id3 = uuidv4()
        const projectId = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO First item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: projectId,
                            children: [],
                            labelId: null,
                        },
                        [id2]: {
                            id: id2,
                            type: 'TODO',
                            text: 'TODO Second Item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: '0',
                            children: [],
                            labelId: null,
                        },
                        [id3]: {
                            id: id3,
                            type: 'TODO',
                            text: 'TODO Third item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: '0',
                            children: [],
                            labelId: null,
                        },
                    },
                    order: [id, id2, id3],
                },
                {
                    id: id,
                    type: item.REORDER_ITEM,
                    destinationId: id3,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO First item',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    projectId: projectId,
                    children: [],
                    labelId: null,
                },
                [id2]: {
                    id: id2,
                    type: 'TODO',
                    text: 'TODO Second Item',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    projectId: '0',
                    children: [],
                    labelId: null,
                },
                [id3]: {
                    id: id3,
                    type: 'TODO',
                    text: 'TODO Third item',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    projectId: '0',
                    children: [],
                    labelId: null,
                },
            },
            order: [id2, id3, id],
        })
        Mockdate.reset()
    })

    it('should permanently delete an item when its already deleted', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const projectId = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        const deletedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO First item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: true,
                            deletedAt: deletedAt,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: projectId,
                            children: [],
                            labelId: null,
                        },
                    },
                    order: [id],
                },
                {
                    id: id,
                    type: item.DELETE_PERMANENT_ITEM,
                },
            ),
        ).toEqual({
            items: {},
            order: [],
        })
        Mockdate.reset()
    })

    it('should fail the permanent delete of an item when its not deleted', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const projectId = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO First item',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: false,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            projectId: projectId,
                            children: [],
                            labelId: null,
                        },
                    },
                    order: [id],
                },
                {
                    id: id,
                    type: item.DELETE_PERMANENT_ITEM,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO First item',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: false,
                    deletedAt: null,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    projectId: projectId,
                    children: [],
                    labelId: null,
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should fail the permanent delete of an item when it has undeleted subtasks', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const childId1 = uuidv4()
        const childId2 = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        const deletedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO Run the tests',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: true,
                            deletedAt: deletedAt,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            children: [childId1, childId2],
                            projectId: '0',
                            labelId: null,
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
                            parentId: id,
                            children: [],
                            projectId: '0',
                            labelId: null,
                        },
                        [childId2]: {
                            id: childId2,
                            type: 'TODO',
                            text: 'TODO Eat dessert',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: true,
                            deletedAt: deletedAt,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: id,
                            children: [],
                            projectId: '0',
                            labelId: null,
                        },
                    },
                    order: [id, childId1, childId2],
                },
                {
                    id: id,
                    type: item.DELETE_PERMANENT_ITEM,
                },
            ),
        ).toEqual({
            items: {
                [id]: {
                    id: id,
                    type: 'TODO',
                    text: 'TODO Run the tests',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: true,
                    deletedAt: deletedAt,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: null,
                    children: [childId1, childId2],
                    projectId: '0',
                    labelId: null,
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
                    parentId: id,
                    children: [],
                    projectId: '0',
                    labelId: null,
                },
                [childId2]: {
                    id: childId2,
                    type: 'TODO',
                    text: 'TODO Eat dessert',
                    scheduledDate: null,
                    dueDate: null,
                    completed: false,
                    deleted: true,
                    deletedAt: deletedAt,
                    completedAt: null,
                    createdAt: createdAt,
                    lastUpdatedAt: lastUpdatedAt,
                    repeat: null,
                    parentId: id,
                    children: [],
                    projectId: '0',
                    labelId: null,
                },
            },
            order: [id, childId1, childId2],
        }),
            Mockdate.reset()
    })

    it('should permanently delete all children of a parent when the parent is permanently deleted', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const childId1 = uuidv4()
        const childId2 = uuidv4()
        const createdAt = new Date(1990, 1, 1).toISOString()
        const lastUpdatedAt = new Date(1990, 1, 2).toISOString()
        const deletedAt = new Date(1990, 1, 2).toISOString()
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO Run the tests',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: true,
                            deletedAt: deletedAt,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            children: [childId1, childId2],
                            projectId: '0',
                            labelId: null,
                        },
                        [childId1]: {
                            id: childId1,
                            type: 'TODO',
                            text: 'TODO Eat dinner',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: true,
                            deletedAt: deletedAt,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: id,
                            children: [],
                            projectId: '0',
                            labelId: null,
                        },
                        [childId2]: {
                            id: childId2,
                            type: 'TODO',
                            text: 'TODO Eat dessert',
                            scheduledDate: null,
                            dueDate: null,
                            completed: false,
                            deleted: true,
                            deletedAt: deletedAt,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: id,
                            children: [],
                            projectId: '0',
                            labelId: null,
                        },
                    },
                    order: [id, childId1, childId2],
                },
                {
                    id: id,
                    type: item.DELETE_PERMANENT_ITEM,
                },
            ),
        ).toEqual({
            items: {},
            order: [],
        }),
            Mockdate.reset()
    })
})
