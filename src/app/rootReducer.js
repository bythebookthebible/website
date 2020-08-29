import { createReducer, combineReducers, createAction } from '@reduxjs/toolkit'

import { firebaseReducer } from 'react-redux-firebase'
import { firestoreReducer } from 'redux-firestore'
import adminReducer from '../forAdmin/adminReducer'
import focusedReducer from '../focusedMode/focusedReducer'

export const modes = {
  playful: 'PLAYFUL_MODE',
  focused: 'FOCUSED_MODE',
  teacher: 'TEACHER_MODE',
  admin: 'ADMIN_MODE',
}

const setMode = createAction('SET_MODE')
const addPower = createAction('ADD_POWER')

export {setMode, addPower}

export default combineReducers({
  firebase: firebaseReducer,
  firestore: firestoreReducer,
  mode: createReducer(modes.teacher, {
    [setMode]: (state, action) => action.payload
  }),
  power: createReducer({}, {
    [addPower]: (state, action) => {
      // let key = action.payload.key || state.activity.key
      let key = action.payload.key
      state[key].power = state[key].power + action.payload.power || action.payload.power
    },
    // LOAD_POWER
  }),
  // playfulMode:
  // teacherMode:
  admin: adminReducer,
  focused: focusedReducer,
})
