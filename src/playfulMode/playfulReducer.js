import { createReducer, createAction, createAsyncThunk } from '@reduxjs/toolkit'

import { valueAfter, getKidKinds, pathFilters, scriptureFromKey, kidModeKinds, getPathActivities } from '../util'

// ACTION CREATORS
export const newView = createAction('playful/newView')
export const updateFilter = createAction('playful/updateFilter')
// export const addMemoryPower = createAction('playful/addMemoryPower')
export const newResources = createAction('playful/newResources')
export const back = createAction('playful/back')
// export const loadState = createAction('playful/loadState')

const createThunkWithResources = type => createAsyncThunk(type, (arg, thunk) => {
  let resources = thunk.getState().firestore.data.memoryResources
  return {resources, arg}
})
export const nextModule = createThunkWithResources('playful/nextModule')
export const nextActivity = createThunkWithResources('playful/nextActivity')
export const nextInPalace = createThunkWithResources('playful/nextInPalace')

export function pathFinished(activity) {
  return async (dispatch, getState, getFirebase) => {
    let {path, module, index} = activity
    let profile = getState().firebase.profile
    let p = profile.paths && profile.paths[path]
    console.log(p, activity)

    if(!p || module > p.module || (module == p.module && index > p.index)) {
      await getFirebase().updateProfile({paths:{
        [path]:{module, index}
      }})
    }
    dispatch(newView({view:playfulViews.adventurePath, viewSelected:path}))
  }
}

// Values for state.view
export const playfulViews = {
  default:'default',
  map:'map',
  moduleSelector:'moduleSelector',
  adventurePath:'adventurePath',
  palace:'palace',
  activity:'activity',
}

const defaultView = playfulViews.map
const defaultViewSelected = 'home'

const playfulReducer = createReducer(
  {
    view: defaultView, 
    viewSelected: defaultViewSelected,
    history: {past: [], present: {
      view: defaultView, 
      viewSelected: defaultViewSelected
    }},
    path: '',
    paths: {},
  },
  {
    [newView]: (state, action) => {
      state.view = action.payload.view
      state.viewSelected = action.payload.viewSelected

      // history tracking
      state.history.past.push(state.history.present)
      state.history.present = action.payload

      // specialized default view
      if(action.payload.view === playfulViews.default) {
        state.view = defaultView
        state.viewSelected = defaultViewSelected
      }

      // specialized palace view payload
      if(action.payload.view === playfulViews.palace 
        && typeof(action.payload.viewSelected) === 'string') {
        let ref = action.payload.viewSelected.split(' ')
        state.viewSelected = {book: ref[0], chapter: ref[1] || 1}
      }

      return state
    },
    [back]: (state, action) => {
      let prev = state.history.past.pop()
      if(!prev) prev = newView({view:playfulViews.default}).payload

      // roll back one more to let us effectively reuse newView action
      state.history.present = state.history.past.pop()
      state = playfulReducer(state, newView(prev))
      return state
    },
    [nextModule.fulfilled]: (state, action) => {
      let {resources} = action.payload
      let modules = Object.keys(resources).filter(
        module => getKidKinds(resources[module]).includes(state.viewSelected.kind)
      )
      state.viewSelected.module = valueAfter(modules, state.viewSelected.module)
      return state
    },
    [nextActivity.fulfilled]: (state, action) => {
      let {resources} = action.payload
      let activities = getKidKinds(resources[state.viewSelected.module])
      state.viewSelected.kind = valueAfter(activities, state.viewSelected.kind)      
      return state
    },
    [nextInPalace.fulfilled]: (state, action) => {
      let {resources, arg:n} = action.payload

      let scriptures = Object.keys(resources).reduce((cum, key) => {
        let s = scriptureFromKey(key)
        cum[s.book + s.chapter] = cum[s.book + s.chapter] || {book:s.book, chapter:s.chapter}
        return cum
      }, {})

      state.viewSelected = valueAfter(Object.values(scriptures), state.viewSelected, n || 1)
      return state
    },
})

export default playfulReducer