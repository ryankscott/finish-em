import { OwnProps as FilteredItemListProps } from '../components/FilteredItemList'
import { OwnProps as ViewHeaderProps } from '../components/ViewHeader'

import CSS from 'csstype'

export type TaskVisibility = {
    [key: string]: boolean
}

export type Component =
    | {
          name: 'FilteredItemList'
          props: FilteredItemListProps
      }
    | {
          name: 'ViewHeader'
          props: ViewHeaderProps
      }

export type ComponentType = {
    id: string
    viewId: string
    location: 'main' | 'focusBar' | 'sideBar'
    component: Component
}

export type MainComponent = {
    [key: string]: ComponentType
}

export type MainComponents = {
    components: MainComponent
    order: string[]
}

export type ViewType = {
    id: string | string
    name: string
    icon: IconType
    type: 'default' | 'custom' | 'project' | 'area'
}

export type View = {
    [key: string]: ViewType
}

export type Views = {
    views: View
    order: string[]
}

export type LabelType = {
    id: string | string
    name: string
    colour: CSS.Color
}

export type Label = {
    [key: string]: LabelType
}

export type Labels = {
    labels: Label
    order: string[]
}

export type UIType = {
    theme: string
    activeItem: {
        past: string[]
        present: string
        future: string[]
    }
    sidebarVisible: boolean
    focusbarVisible: boolean
    shortcutDialogVisible: boolean
    createProjectDialogVisible: boolean
    deleteProjectDialogVisible: boolean
    labels: Labels
    subtasksVisible: TaskVisibility
    views: Views
    components: MainComponents
}

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
    | 'expandAll'
    | 'collapseAll'
    | 'restore'
    | 'save'
    | 'feedback'
    | 'area'
    | 'view'
