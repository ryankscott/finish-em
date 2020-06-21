import * as feature from '../actions/feature'
import { FeatureType } from '../interfaces'

const initialState: FeatureType = {
    dragAndDrop: false,
    projectDates: false,
}

export const featureReducer = (
    state = initialState,
    action: feature.FeatureActions,
): FeatureType => {
    switch (action.type) {
        case feature.ENABLE_DRAG_AND_DROP:
            return {
                ...state,
                dragAndDrop: true,
            }
        case feature.DISABLE_DRAG_AND_DROP:
            return {
                ...state,
                dragAndDrop: false,
            }
        case feature.TOGGLE_DRAG_AND_DROP:
            return {
                ...state,
                dragAndDrop: !state.dragAndDrop,
            }
        case feature.ENABLE_PROJECT_DATES:
            return {
                ...state,
                projectDates: true,
            }
        case feature.DISABLE_PROJECT_DATES:
            return {
                ...state,
                projectDates: false,
            }
        case feature.TOGGLE_PROJECT_DATES:
            return {
                ...state,
                projectDates: !state.projectDates,
            }

        default:
            return state
    }
}
