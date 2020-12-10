import * as area from '../actions/area'
import { Areas } from '../interfaces'
import produce from 'immer'

const initialState: Areas = {
  areas: {
    '0': {
      id: '0',
      name: 'Other',
      deleted: false,
      description: 'Default landing space for projects',
      lastUpdatedAt: new Date().toISOString(),
      deletedAt: null,
      createdAt: new Date().toISOString(),
    },
    '1': {
      id: '1',
      name: 'Work',
      deleted: false,
      description: 'Default landing space for projects',
      lastUpdatedAt: new Date().toISOString(),
      deletedAt: null,
      createdAt: new Date().toISOString(),
    },
  },
  order: ['0', '1'],
}

export const areaReducer = produce(
  (draftState: Areas = initialState, action: area.AreaActions): Areas => {
    const a = draftState.areas[action.id]

    switch (action.type) {
      case area.CREATE_AREA:
        draftState.areas[action.id.toString()] = {
          id: action.id,
          name: action.name,
          description: action.description,
          deleted: false,
          deletedAt: null,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
        }
        if (draftState.order) {
          draftState.order = [...draftState.order, action.id]
        } else {
          draftState.order = [action.id]
        }
        break

      case area.UPDATE_AREA_DESCRIPTION:
        a.description = action.description
        a.lastUpdatedAt = new Date().toISOString()
        break

      case area.UPDATE_AREA_NAME:
        a.name = action.name
        a.lastUpdatedAt = new Date().toISOString()
        break

      case area.DELETE_AREA:
        a.deleted = true
        a.lastUpdatedAt = new Date().toISOString()
        a.deletedAt = new Date().toISOString()
        // Don't forget to remove it from the ordering
        draftState.order = draftState.order.filter((a) => a != action.id)
        break

      case area.REORDER_AREA:
        // Initialise where everything is
        const sourceIndex = draftState.order.indexOf(action.id)
        const destinationIndex = draftState.order.indexOf(action.destinationId)
        const newOrder = draftState.order
        newOrder.splice(sourceIndex, 1)
        const startOfArray = newOrder.slice(0, destinationIndex)
        const endOfArray = newOrder.slice(destinationIndex, newOrder.length)
        draftState.order = [...startOfArray, action.id, ...endOfArray]
        break

      default:
        return draftState
    }
  },
)
