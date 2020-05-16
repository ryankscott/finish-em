import { itemReducer } from '../reducers/item'
import uuidv4 from 'uuid/v4'
import Mockdate from 'mockdate'
import * as item from '../actions/item'
import RRule from 'rrule'
import { Items } from '../interfaces'

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
                itemType: 'TODO',
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
                    flagged: false,
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should handle create an item with projectID', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
        const projectId = uuidv4()
        expect(
            itemReducer(blankState, {
                id: id,
                type: item.CREATE_ITEM,
                itemType: 'TODO',
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
                    flagged: false,
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should handle mark an item as deleted', () => {
        Mockdate.set('2020-02-20')
        const id = uuidv4()
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
                            deleted: true,
                            deletedAt: null,
                            completedAt: null,
                            createdAt: createdAt,
                            lastUpdatedAt: lastUpdatedAt,
                            repeat: null,
                            parentId: null,
                            children: [],
                            flagged: false,
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
                    flagged: false,
                    projectId: '0',
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should remove the parentId from all children and all children from the parent, when the parent is deleted', () => {
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
                            parentId: id,
                            children: [],
                            projectId: '0',
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
                            parentId: id,
                            children: [],
                            projectId: '0',
                            flagged: false,
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
                    children: [],
                    projectId: '0',
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
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    children: [],
                    projectId: '0',
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
                    lastUpdatedAt: new Date().toISOString(),
                    repeat: null,
                    parentId: null,
                    children: [],
                    projectId: '0',
                    flagged: false,
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
                            parentId: id,
                            children: [],
                            projectId: '0',
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
                            parentId: id,
                            children: [],
                            projectId: '0',
                            flagged: false,
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
                    flagged: false,
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
                    parentId: id,
                    children: [],
                    projectId: '0',
                    flagged: false,
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
                            flagged: false,
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
                    flagged: false,
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
        expect(
            itemReducer(
                {
                    items: {
                        [id]: {
                            id: id,
                            type: 'TODO',
                            text: 'TODO Run the tests',
                            scheduledDate: scheduledDate,
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
                            flagged: false,
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
                    scheduledDate: null,
                    dueDate: null,
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
                    flagged: false,
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    // TODO: Remove hack of adding 1 hour to expected time (probably due to being in GMT +1)
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
                            flagged: false,
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
                    scheduledDate: null,
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
                    flagged: false,
                },
            },
            order: [id],
        })
        Mockdate.reset()
    })

    it('should handle the uncompleting of an item without a repeat, and persist the scheduled date and due date', () => {
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
                            flagged: false,
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
                    flagged: false,
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
                            flagged: false,
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
                    flagged: false,
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
                            flagged: false,
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
                            flagged: false,
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
                    flagged: false,
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
                    flagged: false,
                },
            },
            order: [id, childId],
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
                            flagged: false,
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
                            flagged: false,
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
                            flagged: false,
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
                    flagged: false,
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
                    flagged: false,
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
                    flagged: false,
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
                            flagged: false,
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
                            flagged: false,
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
                            flagged: false,
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
                    flagged: false,
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
                    flagged: false,
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
                    flagged: false,
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
                            flagged: false,
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
                            flagged: false,
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
                            flagged: false,
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
                    flagged: false,
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
                    flagged: false,
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
                    flagged: false,
                },
            },
            order: [id2, id3, id],
        })
        Mockdate.reset()
    })
})
