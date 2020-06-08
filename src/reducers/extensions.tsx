import * as ext from '../actions/extensions'
import { Extensions, FilterEnum } from '../interfaces'
import produce from 'immer'

const initialState: Extensions = {
    '0dd1d2ee-2a95-47e4-9c27-6d429d284c18': {
        id: '0dd1d2ee-2a95-47e4-9c27-6d429d284c18',
        path: '/dailyAgenda',
        location: 'main',
        component: {
            name: 'FilteredItemList',
            props: {
                hideIcons: [],
                isFilterable: true,
                listName: 'Pending Items',
                filter: {
                    type: 'default',
                    filter: FilterEnum.ShowByLabelOnDay,
                    params: {
                        labelId: 'a342c159-9691-4684-a109-156ba46c1ea4',
                        scheduledDate: new Date(),
                        dueDate: new Date(),
                    },
                },
            },
        },
    },
}

export const extensionReducer = produce(
    (state = initialState, action: ext.ExtenstionActions): ExtensionType => {
        return state
    },
)
