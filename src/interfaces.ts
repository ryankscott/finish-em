import { Uuid } from '@typed/uuid'

export interface ItemType {
    id: Uuid
    type: 'NOTE' | 'TODO'
    text: string
    deleted: boolean
    completed: boolean
    parentId: Uuid
    children: Uuid[]
    projectId: Uuid
    dueDate: string
    scheduledDate: string
    lastUpdatedAt: string
    completedAt: string
    createdAt: string
    deletedAt: string
    repeat: string
}

export type Items = {
    items: { [key: string]: ItemType }
    order: Uuid[]
}

export interface ProjectType {
    id: Uuid
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
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
