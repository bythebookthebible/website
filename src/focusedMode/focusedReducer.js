import { createReducer, combineReducers, createAction } from '@reduxjs/toolkit'

const updateFilter = createAction('FOCUSED/UPDATE_FILTER')
const nextIndex = createAction('FOCUSED/NEXT_INDEX')
const prevIndex = createAction('FOCUSED/PREV_INDEX')

export {updateFilter, nextIndex, prevIndex}

const defaultModules = ["39-007-001-006", "39-007-007-011", "39-007-012-014", "39-007-015-020", "39-007-021-023", "39-007-024-029"]
const defaultActivity = ["watch"]

export default combineReducers({
  filter: createReducer({module:defaultModules, activity: defaultActivity},
    {
      [updateFilter]: (state, action) => {
        state.activity = Array.from(new Set(action.payload.activity || state.activity)).sort()
        state.module = Array.from(new Set(action.payload.module || state.module)).sort()
        return state
      },
    }
  ),
  index: createReducer(0,
    {
      [updateFilter]: (state, action) => 0, // reset index to 0 on filterUpdate
      [nextIndex]: (state, action) => state + (Number(action.payload) || 1) ,
      [prevIndex]: (state, action) => state - (Number(action.payload) || 1) ,
    }
  ),
})
