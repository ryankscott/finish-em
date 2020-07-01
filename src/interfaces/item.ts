import { Uuid } from '@typed/uuid'
export interface ItemType {
    id: Uuid
    type: 'NOTE' | 'TODO'
    text: string
    deleted: boolean
    completed: boolean
    parentId: Uuid
    children: Uuid[]
    projectId: Uuid | '0'
    dueDate: string
    scheduledDate: string
    lastUpdatedAt: string
    completedAt: string
    createdAt: string
    deletedAt: string
    repeat: string
    labelId: Uuid | null
}

export interface Item {
    [key: string]: ItemType
}

export type Items = {
    items: Item
    order: Uuid[]
}
export enum ItemIcons {
    Due = 'due',
    Scheduled = 'scheduled',
    Repeat = 'repeat',
    Project = 'project',
    Subtask = 'subtask',
}
