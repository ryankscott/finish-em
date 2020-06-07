import { Uuid } from '@typed/uuid'
import CSS from 'csstype'

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
    | 'sortDirection'
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
    | 'stale'
    | 'label'
    | 'edit'
    | 'colour'

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

export interface LabelType {
    id: Uuid | string
    name: string
    colour: CSS.Color
}

export interface Label {
    [key: string]: LabelType
}
export interface UIType {
    theme: string
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
    labels: LabelType
}

export interface FeatureType {
    dragAndDrop: boolean
}

export interface ThemeType {
    name: string
    font: {
        sansSerif: CSS.FontFamilyProperty
    }
    fontSizes: {
        xxxsmall: CSS.Properties['fontSize']
        xxsmall: CSS.Properties['fontSize']
        xsmall: CSS.Properties['fontSize']
        small: CSS.Properties['fontSize']
        regular: CSS.Properties['fontSize']
        large: CSS.Properties['fontSize']
        xlarge: CSS.Properties['fontSize']
        xxlarge: CSS.Properties['fontSize']
        xxxlarge: CSS.Properties['fontSize']
    }
    fontWeights: {
        thin: number
        regular: number
        bold: number
        xbold: number
    }
    button: {
        default: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
        invert: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
        primary: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
        error: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
        subtle: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
        subtleInvert: {
            backgroundColour: CSS.Color
            colour: CSS.Color
            borderColour: CSS.Color
            hoverBackgroundColour: CSS.Color
        }
    }
    colours: {
        textColour: CSS.Color
        disabledTextColour: CSS.Color
        altTextColour: CSS.Color
        primaryColour: CSS.Color
        secondaryColour: CSS.Color
        tertiaryColour: CSS.Color
        quarternaryColour: CSS.Color
        penternaryColour: CSS.Color
        backgroundColour: CSS.Color
        borderColour: CSS.Color
        altBackgroundColour: CSS.Color
        dialogBackgroundColour: CSS.Color
        focusDialogBackgroundColour: CSS.Color
        altDialogBackgroundColour: CSS.Color
        focusAltDialogBackgroundColour: CSS.Color
        focusBackgroundColour: CSS.Color
        focusBorderColour: CSS.Color
        okColour: CSS.Color
        neutralColour: CSS.Color
        errorColour: CSS.Color
        errorBackgroundColour: CSS.Color
        staleBackgroundColour: CSS.Color
        warningColour: CSS.Color
        iconColour: CSS.Color
        altIconColour: CSS.Color
    }
}

export type fontSizeType =
    | 'xxxsmall'
    | 'xxsmall'
    | 'xsmall'
    | 'small'
    | 'regular'
    | 'large'
    | 'xlarge'
    | 'xxlarge'
    | 'xxxlarge'

export type fontWeightType = 'thin' | 'regular' | 'bold' | 'xbold'
