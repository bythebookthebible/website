import React, { Component, useState, useEffect, useRef, useReducer} from 'react'
import Activity from './activity'
import { useFirestore, useFirestoreState } from "../hooks"
import { getKidKinds } from '../util'
import { valueAfter, pathFilters } from "../util"
import { Spinner } from 'react-bootstrap'
import MemoryPowerView from './memoryPalaceView'

import Maps from './maps'
import ModuleSelector from './ModuleSelector'

let showMemoryPrompt;

function memorizedPromptCheck(value, index, array) {
    return value >= 100.0
}

export var DispatchContext = React.createContext(undefined)
export var StateContext = React.createContext(undefined)

export const actionTypes = {
    newView:'newView',
    nextModule:'nextModule',
    nextActivity:'nextActivity',
    nextInPath:'nextInPath',
    addMemoryPower:'addMemoryPower',
    newResources:'newResources',
    loadState:'loadState',
    back:'back',
}

export const actionViews = {
    map:'map',
    moduleSelector:'moduleSelector',
    palace:'palace',
    activity:'activity',
}

// state is of the form {view:"", activity:{key:"", kind:""}, resources:{}, viewSelected:"", paths:{<book>:{progress: 0}, ...}, path:"", memoryPower:{}}
// where view is one of "loading", "map", "activity"
// action.type is a string coresponding to the next action
// action has other properties for each action.type
function kidAppReducer(oldState, action) {
    let state = {...oldState}
    let newActivity = ""

    for(const act of (Array.isArray(action) ? action : [action])) {
        switch(act.type) {
            case actionTypes.newView:
                state.view = act.view
                state.viewSelected = act.viewSelected
                
                if(act.view === actionViews.activity) {
                    state.activity = act.activity
                }
                state.path = act.path || state.path
                continue

            case actionTypes.nextModule:
                let keys = Object.keys(state.resources).filter(
                    key => {
                        return getKidKinds(state.resources[key]).includes(state.activity.kind)
                    }
                )
                
                state.activity = {...state.activity, key: valueAfter(keys, state.activity.key)}
                continue

            case actionTypes.nextActivity:
                state.activity = {...state.activity, 
                    kind: valueAfter(getKidKinds(state.resources[state.activity.key]), state.activity.kind)}
                continue

            case actionTypes.nextInPath:
                let path = action.path || state.path
                state = {...state, path:path, paths:{[path]:-1, ...state.paths}} // create any missing state objects

                let activities = getPathActivities(state.resources, path)
                let pathIndex = action.index || state.paths[path]+1
                pathIndex = Math.min(pathIndex, activities.length-1)

                state.activity = activities[pathIndex]
                state.paths = {...state.paths, [path]:pathIndex}

                continue

            case actionTypes.back:
                // activities go directly home (not worth a stack history)
                // everything else will wind up going to the previous,
                // stopping at the home map, since the tree is 
                // home > upToOneMap > moduleSelector > activity
                if(state.view == actionViews.moduleSelector) {
                    state.view = state.prevView.view
                    state.viewSelected = state.prevView.viewSelected
                } else {
                    state.view = actionViews.map
                    state.viewSelected = 'home'
                }
                continue

            case actionTypes.addMemoryPower:
                let key = act.key || state.activity.key
                let newMP = {...state.memoryPower, [key]:{power: state.memoryPower[key].power+act.power}}
                state.memoryPower = newMP
                showMemoryPrompt = Object.values(newMP).filter(memorizedPromptCheck).length > 0
                continue

            case actionTypes.newResources:
                let defaultMemoryPower = Object.keys(act.resources).reduce((cum, key) => { cum[key] = {power: 0}; return cum }, {})
                state = {...state, resources:act.resources,
                    memoryPower:{...defaultMemoryPower, ...state.memoryPower}}
                continue

            case actionTypes.loadState:
                state = mergeStates(state, act.state)
                continue
        }
    }
    // all transitions update these things
    state.timestamp = Date.now()
    state.version = '0.1.0'
    state.prevView = {view: oldState.view || '', viewSelected: oldState.viewSelected || ''}
    console.log(oldState, action, state)
    return state
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

const halfMemoryPower = 50
const loadingState = {view:'loading'}

export default function KidModeApp(props) {
    let [state, dispatch] = useCachedFirebaseReducer(kidAppReducer, loadingState, props.user)
    
    // set state to newView after freshly loaded
    let lastState = useRef(state)
    useEffect(() => {
        if(!lastState.current.resources && state.resources) {
            dispatch({type:'newView', view:'map', viewSelected:'home'})
        }
        lastState.current = state
    }, [state])

    let content = <div className='text-center pt-3'>
        <Spinner animation="border" role="status" size="md" />
        <h1 className='d-inline-block'>Loading...</h1>
    </div>
    
    if(state.view == 'map') content = Maps[state.viewSelected]
    if(state.view == 'moduleSelector') content = ModuleSelector[state.viewSelected]
    if(state.view == 'palace') content = <MemoryPowerView halfMemoryPower={halfMemoryPower} showMemoryPrompt={showMemoryPrompt} />
    if(state.view == 'activity') content = <Activity showMemoryPrompt={showMemoryPrompt} halfMemoryPower={halfMemoryPower} />

    if(!content) {
        content = <h1>Oops...</h1>
        dispatch({type:'newView', view:'map', viewSelected:'home'})
    }

    return <DispatchContext.Provider value={dispatch}><StateContext.Provider value={state}>
            {!(state.view == 'map' && state.viewSelected == 'home') && 
            <div className='fa fa-3x fa-undo backButton' aria-hidden="true" 
                onClick={() => dispatch({type:actionTypes.back})} />
            }
            {content}
        </StateContext.Provider></DispatchContext.Provider>
}


function useCachedFirebaseReducer(reducer, initialState, user) {
    let [state, dispatch] = useReducer(reducer, initialState)

    let firestoreModules = useFirestore("memoryResources_02")

    // let [idbState, setIdbState] = useIdbState(`btbtbUserState_${uid}`, data => {
    //     dispatch({type:actionTypes.loadState, state:data})
    // })
    let [firestoreState, setFirestoreState] = useFirestoreState(`userData/${user.uid}/`, data => {
        dispatch({type:actionTypes.loadState, state:data})
    })

    // when fresh modules are loaded
    useEffect(() => {
        if(firestoreModules) {
            // these resources are the master resources
            dispatch({type:actionTypes.newResources, resources:firestoreModules})
        }
    }, [firestoreModules])

    // whenever state updates (after dispatch has propogated)
    useEffect(() => {
        // // pass whole state to idb
        // setIdbState(state)
        // pass state without resources to firestore
        let {resources, ...withoutResources} = state
        if(shouldUpdateFirestoreState(firestoreState, withoutResources)) {
            setFirestoreState(withoutResources)
        }
    }, [state])

    return [state, dispatch]
}

const minFirestoreInterval = 30000
shouldUpdateFirestoreState.lastTime = 0
function shouldUpdateFirestoreState(firestoreState, newState) {
    // send every nth update to firebase
    // will change to update on important state transitions
    if(!firestoreState) return false
    if(newState.view == actionViews.loadState) return false
    
    // throttle updates
    if(Date.now() - shouldUpdateFirestoreState.lastTime > minFirestoreInterval) {
        shouldUpdateFirestoreState.lastTime = Date.now()
        return true
    }
}

function mergeStates(internalState, externalState) {
    // merge two copies of the state
    if(!externalState) return internalState
    if(!internalState) return externalState

    var {resources, memoryPower, paths, ...viewExternal} = externalState
    let resourcesExternal = resources, memoryPowerExternal = memoryPower, pathsExternal = paths

    var {resources, memoryPower, paths, ...viewInternal} = internalState

    // merge view
    let view = {...viewExternal, ...viewInternal}

    // // merge power, paths by the max value
    memoryPower = memoryPower && memoryPowerExternal ? 
        Object.keys(memoryPowerExternal).reduce((pow, key) => {
            pow[key].power = Math.max(pow[key].power || 0, memoryPowerExternal[key].power || 0)
            return pow
        }, memoryPower)
        : memoryPower || memoryPowerExternal
    // memoryPower = memoryPower || memoryPowerExternal

    paths = paths && pathsExternal ?
        Object.keys(pathsExternal).reduce((p, key) => {
            p[key] = Math.max(p[key], pathsExternal[key]) || pathsExternal[key]
            return p
        }, paths)
        : paths || pathsExternal
    // paths = paths || pathsExternal

    // prefer resources from the internal state
    resources = resources || resourcesExternal

    let state = {resources: resources, memoryPower: memoryPower, paths: paths, ...view}
    // console.log('merging', internalState, externalState, state)
    return state
}