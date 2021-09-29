import { createReducer, createAction, createAsyncThunk } from '@reduxjs/toolkit'

import { valueAfter, getKidKinds, pathFilters, scriptureFromKey, kidModeKinds, getPathActivities, getModulesForPath } from '../util'

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
// export const nextModule = createThunkWithResources('playful/nextModule')
// export const nextActivity = createThunkWithResources('playful/nextActivity')
// export const nextInPalace = createThunkWithResources('playful/nextInPalace')

export function getNextModule(resources, kind, module) {
    let modules = Object.keys(resources).filter(
      m => getKidKinds(resources[m]).includes(kind)
    )
    return valueAfter(modules, module)
}

export function pathFinished(activity) {
  return async (dispatch, getState, getFirebase) => {
    let {path, module, kind} = activity
    console.log(`just finished ${path} ${module} ${kind}`)
    let resources = getState().firestore.data.memoryResources

    // get old path state
    let profile = getState().firebase.profile
    let p = profile.paths && profile.paths[path]
    // console.log(p, activity)

    let nextModule, nextKind, nextIndex
    if(!p) {
      // get first in this path
      nextModule = getModulesForPath(resources, path)[0]
      nextIndex = 0

    } else {
      // get expected next module/kind
      let a = getPathActivities(resources, module)
      nextIndex = (p.index + 1) % a.length
      nextModule = nextIndex === 0
        ? valueAfter(getModulesForPath(resources, path), p.module)
        : p.module
    }
    nextKind = getPathActivities(resources, nextModule)[nextIndex]

    // if uninitialized or
    // if new module/kind matches the module/kind of the next item
    // then set this as the new module/kind/index
    if(!p || (module == nextModule && kind == nextKind)) {
      console.log(`updating to firebase`, nextModule, nextKind)
      await getFirebase().updateProfile({paths:{
        [path]:{module: nextModule, index: nextIndex}
      }})
    }
  }
}

export function nextInPalace(resources, curView, n) {
    let scriptures = Object.keys(resources).reduce((cum, key) => {
      let s = scriptureFromKey(key)
      let view = `${s.book}-${s.chapter}`
      cum[view] = view
      return cum
    }, {})

    return valueAfter(Object.values(scriptures), curView, n || 1)
}

export function activateJewel(module) {
  return async (dispatch, getState, getFirebase) => {
    let status = getState().firebase.profile.power[module]?.status
    
    if(status === 'memorized-pending') {
      getFirebase().updateProfile({power:{
        [module]:{status:'memorized'}
      }})
    }

    if(status === 'applied-pending') {
      getFirebase().updateProfile({power:{
        [module]:{status:'memorized'}
      }})
    }
  }
}

// Values for state.view
// export const playfulViews = {
//   default:'default',
//   map:'map',
//   moduleSelector:'moduleSelector',
//   adventurePath:'adventurePath',
//   palace:'palace',
//   activity:'activity',
// }

// const defaultView = playfulViews.map
// const defaultViewSelected = 'home'

// const playfulReducer = createReducer(
//   {
//     path: '',
//     paths: {},
//   },
//   {
//     // [nextInPalace.fulfilled]: (state, action) => {
//     //   let {resources, arg:n} = action.payload

//     //   let scriptures = Object.keys(resources).reduce((cum, key) => {
//     //     let s = scriptureFromKey(key)
//     //     cum[s.book + s.chapter] = cum[s.book + s.chapter] || {book:s.book, chapter:String(s.chapter)}
//     //     return cum
//     //   }, {})

//     //   state.viewSelected = valueAfter(Object.values(scriptures), state.viewSelected, n || 1)
//     //   return state
//     // },
// })

// export default playfulReducer