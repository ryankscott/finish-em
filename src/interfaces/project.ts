export interface ProjectType {
    id: Uuid | '0'
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
    startAt: string
    endAt: string
}

export interface Project {
    [key: string]: ProjectType
}

export interface Projects {
    projects: Project
    order: (Uuid | string)[]
}
