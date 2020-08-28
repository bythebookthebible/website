import { createReducer, combineReducers, createAction } from '@reduxjs/toolkit'

import { firebaseReducer } from 'react-redux-firebase'
import { firestoreReducer } from 'redux-firestore'

export const adminViews = {
  adminRoot: 'ADMIN_ROOT',
  manageUsers: 'MANAGE_USERS',
  manageResources: 'MANAGE_RESOURCES',
  // manageCamps: 'MANAGE_CAMPS',
}

const setView = createAction('SET_VIEW')

export {setView}

export default combineReducers({
  view: createReducer(adminViews.adminRoot, {
    [setView]: (state, action) => action.payload
  }),
})
