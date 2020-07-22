import React, { Component, useState, useEffect, useRef, useReducer} from 'react'
import Activity from './activity'

import { media } from "./media";
import { useAuth, useFirestore, useCachedStorage } from "../hooks"
import { getKinds } from '../util'
import { keyFromScripture, scriptureFromKey, valueAfter, pathFilters } from "../util"
import { Spinner } from 'react-bootstrap'
import MemoryPowerView from './memoryPalaceView'
import ReallyBadPalace from '../images/memoryPalace/ReallyBadPalace.svg'
import MemorizedPrompt from './memorizedPrompt'
import AdultModeApp from "../forAdults/adultModeApp"

import Maps from './maps'
import ModuleSelectors from './ModuleSelector'

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
                        console.log(state.resources[key], getKinds(state.resources[key]))
                        return getKinds(state.resources[key]).includes(state.activity.kind)
                    }
                )
                
                newActivity = {...state.activity, key: valueAfter(keys, state.activity.key)}
                state.activity = newActivity
                continue

            case actionTypes.nextActivity:
                newActivity = {...state.activity, kind: valueAfter(getKinds(state.resources[key]), state.activity.kind)}
                state.activity = newActivity
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
                state = {...state, ...act.state}
                continue
        }
    }
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

export default function KidModeApp(props) {
    let [state, dispatch] = useReducer(kidAppReducer, {view:'loading'})
    console.log(state)

    let halfMemoryPower = 50

    let modules = useFirestore(
        "memoryResources_02",
        (cum, doc) => {
            let d = doc.data();
            let chapterVerse = `${d.chapter}:${d.startVerse}-${d.endVerse}`
            cum[doc.id] = {...d, chapterVerse: chapterVerse, newResource: false}
            return cum
        }, {}
    );

    useEffect(() => {
        if(modules) {
            console.log(modules)
            dispatch([
                {type:'newResources', resources:modules}, 
                {type:'newView', view:'map', viewSelected:'home'}
            ])
        }
    }, [modules])

    // let resources = useFirestore(
    //     "memoryResources",
    //     (cum, doc) => {
    //       let d = doc.data();
    //       let verses = `${d.startVerse}-${d.endVerse}`
    //       let key = keyFromScripture(d.book, d.chapter, verses)
    //       cum[key] = cum[key] || {}
    //       cum[key][d.kind] = d
    //       return cum
    //     },
    //     {}
    // );
    // console.log(resources)

    // useEffect(() => {
    //     if(resources) {
    //         console.log(resources)
    //         dispatch([
    //             {type:'newResources', resources:resources}, 
    //             {type:'newView', view:'map', viewSelected:'home'}
    //         ])
    //     }
    // }, [resources])

    // {console.log("resource:", state.resources)}
    // console.log("resource spec:", state.resources && state.resources["18-001-00001-6"]["Music Video"]["book"])
    let content = <div className='text-center pt-3'><Spinner animation="border" role="status" size="md" /><h1 className='d-inline-block'>Loading...</h1></div>
    
    if(state.view == 'map') content = Maps[state.viewSelected]
    if(state.view == 'moduleSelector') content = ModuleSelectors[state.viewSelected]
    if(state.view == 'palace') content = <MemoryPowerView src={ReallyBadPalace} halfMemoryPower={halfMemoryPower} showMemoryPrompt={showMemoryPrompt} />
    if(state.view == 'activity') content = <Activity showMemoryPrompt={showMemoryPrompt} halfMemoryPower={halfMemoryPower} />

    return <DispatchContext.Provider value={dispatch}><StateContext.Provider value={state}>
            {content}
        </StateContext.Provider></DispatchContext.Provider>
}