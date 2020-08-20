export type AreaType = {
    id: string | null
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
}

export type Area = {
    [key: string]: AreaType
}

export type Areas = {
    areas: Area
    order: string[]
}
