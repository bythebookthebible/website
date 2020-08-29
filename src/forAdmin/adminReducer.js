import { createReducer, combineReducers, createAction } from '@reduxjs/toolkit'

export const adminViews = {
  adminRoot: 'ADMIN_ROOT',
  manageUsers: 'MANAGE_USERS',
  manageResources: 'MANAGE_RESOURCES',
  // manageCamps: 'MANAGE_CAMPS',
}

const setView = createAction('ADMIN/SET_VIEW')

export {setView}

export default combineReducers({
  view: createReducer(adminViews.adminRoot, {
    [setView]: (state, action) => action.payload
  }),
})
