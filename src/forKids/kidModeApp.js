import React, { Component, useState, useEffect, useRef, useReducer} from 'react'
import Activity from './activity'

import { media } from "./media";
import { useAuth, useFirestore, useCachedStorage, useIdbState, useFirestoreState } from "../hooks"
import { getKinds } from '../util'
import { firebase } from '../firebase'
import { keyFromScripture, scriptureFromKey, valueAfter, pathFilters } from "../util"
import { Spinner } from 'react-bootstrap'
import MemoryPowerView from './memoryPalaceView'
import ReallyBadPalace from '../images/memoryPalace/ReallyBadPalace.svg'
import MemorizedPrompt from './memorizedPrompt'
import AdultModeApp from "../forAdults/adultModeApp"

import Maps from './maps'
import ModuleSelector from './ModuleSelector'
import deepEqual from 'deep-equal';
import { Login } from '../forms/Login'
import Subscribe from '../forms/Subscribe';

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
                        return getKinds(state.resources[key]).includes(state.activity.kind)
                    }
                )
                
                state.activity = {...state.activity, key: valueAfter(keys, state.activity.key)}
                continue

            case actionTypes.nextActivity:
                state.activity = {...state.activity, 
                    kind: valueAfter(getKinds(state.resources[state.activity.key]), state.activity.kind)}
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

            case actionTypes.addMemoryPower:
                let key = act.key || state.activity.key
                let newMP = {...state.memoryPower, [key]:state.memoryPower[key]+act.power}
                state.memoryPower = newMP
                showMemoryPrompt = Object.values(newMP).filter(memorizedPromptCheck).length > 0
                continue

            case actionTypes.newResources:
                let defaultMemoryPower = Object.keys(act.resources).reduce((cum, key) => { cum[key] = 0; return cum }, {})
                state = {...state, resources:act.resources,
                    memoryPower:{...defaultMemoryPower, ...state.memoryPower}}
                continue

            case actionTypes.loadState:
                state = mergeStates(state, act.state)
                continue
        }
    }
    // all transitions update timestamp
    state.timestamp = Date.now()
    state.version = '0.1.0'
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
            return [...acc, ...getKinds(res).filter(filter).map(
                r=>{
                    return {key:key, kind:r.kind}
                }
            )]
        }, [])
}

const halfMemoryPower = 50
const loadingState = {view:'loading'}

export default function LogIntoKidMode(props) {
    return <Login.AuthSwitch {...props}
        tests={[
            {
                test:user=>!(user.claims.expirationDate - Date.now() > 0 || user.claims.permanentAccess || user.claims.admin), 
                value:<Subscribe />
            },
        ]}
        default={<KidModeApp />}
    />
}

function KidModeApp(props) {
    let [state, dispatch] = useCachedFirebaseReducer(kidAppReducer, loadingState, props.user)
    
    // set state to newView after freshly loaded
    let lastState = useRef(state)
    useEffect(() => {
        if(!lastState.current.resources && state.resources) {
            dispatch({type:'newView', view:'map', viewSelected:'home'})
        }
        lastState.current = state
    }, [state])

    // let [state, dispatch] = useReducer(kidAppReducer, {view:'loading'})
    // console.log(state)

    // let firestoreModules = useFirestore(
    //     "memoryResources_02",
    //     (cum, doc) => {
    //         let d = doc.data();
    //         let chapterVerse = `${d.chapter}:${d.startVerse}-${d.endVerse}`
    //         cum[doc.id] = {...d, chapterVerse: chapterVerse, newResource: false}
    //         return cum
    //     }, {}
    // );


    // useEffect(() => {
    //     if(firestoreModules) {
    //         console.log(firestoreModules)
    //         dispatch([
    //             {type:'newResources', resources:firestoreModules}, 
    //             {type:'newView', view:'map', viewSelected:'home'}
    //         ])
    //     }
    // }, [firestoreModules])

    let content = <div className='text-center pt-3'>
        <Spinner animation="border" role="status" size="md" />
        <h1 className='d-inline-block'>Loading...</h1>
    </div>
    
    if(state.view == 'map') content = Maps[state.viewSelected]
    if(state.view == 'moduleSelector') content = ModuleSelector[state.viewSelected]
    if(state.view == 'palace') content = <MemoryPowerView src={ReallyBadPalace} halfMemoryPower={halfMemoryPower} showMemoryPrompt={showMemoryPrompt} />
    if(state.view == 'activity') content = <Activity showMemoryPrompt={showMemoryPrompt} halfMemoryPower={halfMemoryPower} />

    return <DispatchContext.Provider value={dispatch}><StateContext.Provider value={state}>
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
        if(shouldUpdateFirestoreState(firestoreState, state)) {
            let {resources, ...withoutResources} = state
            setFirestoreState(withoutResources)
        }
    }, [state])

    return [state, dispatch]
}

function shouldUpdateFirestoreState(firestoreState, newState) {
    // send every nth update to firebase
    // will change to update on important state transitions
    if(!firestoreState) return false
    if(newState.view == actionViews.loadState) return false
    
    shouldUpdateFirestoreState.counter = (shouldUpdateFirestoreState.counter + 1) % 1
    if(shouldUpdateFirestoreState.counter == 0) {
        return true
    }
}
shouldUpdateFirestoreState.counter = 0

function mergeStates(state1, state2) {
    // merge two copies of the state
    if(!state1) return state2
    if(!state2) return state1

    var {resources, memoryPower, paths, ...view1} = state1
    let resources1 = resources, memoryPower1 = memoryPower, paths1 = paths

    var {resources, memoryPower, paths, ...view2} = state2
    let resources2 = resources, memoryPower2 = memoryPower, paths2 = paths

    // merge view by main timestamp
    let view = view1 && view2 ? 
        (view1.timestamp > view2.timestamp ? view1 : view2)
        : view1 || view2

    // // merge power, paths by the max value
    // memoryPower = memoryPower1 && memoryPower2 ? 
    //     Object.keys(memoryPower1).reduce((pow, key) => {
    //         pow[key] = Math.max(pow[key], memoryPower1[key]) || memoryPower1[key]
    //     }, memoryPower2)
    //     : memoryPower1 || memoryPower2
    memoryPower = memoryPower1 || memoryPower2

    // paths = paths1 && paths2 ?
    //     Object.keys(paths1).reduce((p, key) => {
    //         p[key] = Math.max(p[key], paths1[key]) || paths1[key]
    //     }, paths2)
    //     : paths1 || paths2
    paths = paths1 || paths2

    // // merge resources by individual timestamps
    // resources = resources1 && resources2 ?
    //     Object.keys(resources1).reduce((r, key) => {
    //         r[key] = (resources1[key] && resources1[key].timestamp) > r[key].timestamp ? resources1[key] : r[key]
    //     }, resources2)
    //     : resources1 || resources2
    resources = resources1 || resources2

    let state = {resources: resources, memoryPower: memoryPower, paths: paths, ...view}
    // console.log('merging', state1, state2, state)
    return state
}