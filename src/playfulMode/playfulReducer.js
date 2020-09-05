import { createReducer, createAction, createAsyncThunk } from '@reduxjs/toolkit'

import { valueAfter, getKidKinds, pathFilters, scriptureFromKey } from '../util'

const newView = createAction('playful/newView')
const updateFilter = createAction('playful/updateFilter')
// const addMemoryPower = createAction('playful/addMemoryPower')
const newResources = createAction('playful/newResources')
const back = createAction('playful/back')
// const loadState = createAction('playful/loadState')

const createThunkWithResources = type => createAsyncThunk(type, (arg, thunk) => {
  let resources = thunk.getState().firestore.data.memoryResources
  return {resources, arg}
})
const nextModule = createThunkWithResources('playful/nextModule')
const nextActivity = createThunkWithResources('playful/nextActivity')
const nextInPalace = createThunkWithResources('playful/nextInPalace')
const nextInPath = createThunkWithResources('playful/nextInPath')

export {
  updateFilter, 
  newView, 
  newResources, 
  back,
  nextModule,
  nextActivity,
  nextInPalace,
  nextInPath,
}

export const playfulViews = {
  default:'default',
  map:'map',
  moduleSelector:'moduleSelector',
  palace:'palace',
  activity:'activity',
}


function getPathActivities(resources, path) {
  let filter
  if(Object.keys(pathFilters).includes(path)) {
    filter = pathFilters[path]
  } else {
    let p = path.split('')
    let chapter = parseInt(p[p.length-1])
    if(chapter) {
      let book = p.slice(0,p.length-1).join(' ');
      filter = r=>(r.book==book && r.chapter == chapter)
    } else {
      filter = r=>(r.book==path)
    }
  }

  return Object.entries(resources).reduce(
    (acc,[key, res])=>{
      return [...acc, ...getKidKinds(res).filter(filter).map(
        r=>{
          return {key:key, kind:r.kind}
        }
      )]
    }, [])
}

    // case actionTypes.loadState:
    //     state = mergeStates(state, act.state)
    //     continue

    // state.timestamp = Date.now()
    // state.version = '0.1.0'
    // state.history = {view: oldState.view || '', viewSelected: oldState.viewSelected || ''}

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
      // view state
      state.view = action.payload.view
      state.viewSelected = action.payload.viewSelected

      // view history tracking
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
    [nextInPath.fulfilled]: (state, action) => {
        // SHOULD REDO PATH STATE
        let path = action.payload.path || state.path
        state.path = path
        state.paths[path] = state.paths[path] || -1
        // create path object if missing

        let activities = getPathActivities(state.resources, path)
        let pathIndex = action.payload.index || state.paths[path]+1
        pathIndex = Math.min(pathIndex, activities.length-1)

        state.viewSelected = activities[pathIndex]
        state.paths[path] = pathIndex

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