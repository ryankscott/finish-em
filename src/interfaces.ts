import { Uuid } from '@typed/uuid'

export enum RenderingStrategy {
    Default = 'DEFAULT',
    All = 'ALL',
}

export type IconType =
    | 'close'
    | 'expand'
    | 'collapse'
    | 'help'
    | 'repeat'
    | 'due'
    | 'scheduled'
    | 'note'
    | 'add'
    | 'todoUnchecked'
    | 'todoChecked'
    | 'trash'
    | 'trashSweep'
    | 'show'
    | 'hide'
    | 'sort'
    | 'inbox'
    | 'calendar'
    | 'slideRight'
    | 'slideLeft'
    | 'upLevel'
    | 'back'
    | 'forward'
    | 'settings'
    | 'subtask'
    | 'more'
    | 'flag'
    | 'trashPermanent'

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
    flagged: boolean
}

export interface Item {
    [key: string]: ItemType
}

export type Items = {
    items: Item
    order: Uuid[]
}

export interface ProjectType {
    id: Uuid | '0'
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
}

export interface Project {
    [key: string]: ProjectType
}

export interface Projects {
    projects: Project
    order: (Uuid | string)[]
}

export interface UIType {
    activeItem: {
        past: Uuid[]
        present: Uuid
        future: Uuid[]
    }
    sidebarVisible: boolean
    focusbarVisible: boolean
    shortcutDialogVisible: boolean
    createProjectDialogVisible: boolean
    deleteProjectDialogVisible: boolean
}

export interface FeatureType {
    dragAndDrop: boolean
}
