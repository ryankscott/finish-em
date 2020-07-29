import { Uuid } from '@typed/uuid'

export interface AreaType {
    id: Uuid | '0'
    name: string
    deleted: boolean
    description: string
    lastUpdatedAt: string
    deletedAt: string
    createdAt: string
}

export interface Area {
    [key: string]: AreaType
}

export interface Areas {
    areas: Area
    order: (Uuid | string)[]
}
