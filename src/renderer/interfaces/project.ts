export type ProjectType = {
    id: string | null
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
    startAt: string
    endAt: string
    areaId: string
}

export type Project = {
    [key: string]: ProjectType
}

export type Projects = {
    projects: Project
    order: string[]
}
