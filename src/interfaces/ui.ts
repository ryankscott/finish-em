import { OwnProps as FilteredItemListProps } from '../containers/FilteredItemList'
import { OwnProps as ViewHeaderProps } from '../components/ViewHeader'

import CSS from 'csstype'
import { Uuid } from '@typed/uuid'

export interface TaskVisibility {
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

export interface ComponentType {
    id: string
    viewId: string
    location: 'main' | 'focusBar' | 'sideBar'
    component: Component
}

export interface MainComponent {
    [key: string]: ComponentType
}

export interface MainComponents {
    components: MainComponent
    order: string[]
}

export interface ViewType {
    id: Uuid | string
    name: string
    icon: IconType
    type: 'default' | 'custom' | 'project' | 'area'
}

export interface View {
    [key: string]: ViewType
}

export interface Views {
    views: View
    order: string[]
}

export interface LabelType {
    id: Uuid | string
    name: string
    colour: CSS.Color
}

export interface Label {
    [key: string]: LabelType
}

export interface Labels {
    labels: Label
    order: string[]
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
