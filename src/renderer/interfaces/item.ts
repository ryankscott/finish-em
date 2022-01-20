export type ItemType = {
    id: string
    type: 'NOTE' | 'TODO'
    text: string
    deleted: boolean
    completed: boolean
    parentId: string
    children: string[]
    projectId: string | '0'
    dueDate: string
    scheduledDate: string
    lastUpdatedAt: string
    completedAt: string
    createdAt: string
    deletedAt: string
    repeat: string
    labelId: string | null
    areaId: string | null
}

export type Item = {
    [key: string]: ItemType
}

export type Items = {
    items: Item
    order: string[]
}
export enum ItemIcons {
    Due = 'due',
    Scheduled = 'scheduled',
    Repeat = 'repeat',
    Project = 'project',
    Subtask = 'subtask',
}
