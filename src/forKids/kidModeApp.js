import React, { Component, useState, useEffect, useRef, useReducer} from 'react'

import mainMap from '../images/maps/MainMap.svg'
import readingTree from '../images/maps/TestTree.svg'
import ButtonMap from './buttonMap'
import Activity from './activity'

import { media } from "./media";
import { useAuth, useFirestore, useCachedStorage } from "../hooks"
import { keyFromScripture, scriptureFromKey, valueAfter, pathFilters } from "../util"
import { Spinner } from 'react-bootstrap'

export var DispatchContext = React.createContext(undefined)
export var StateContext = React.createContext(undefined)

// state is of the form {view:"", activity:{key:"", kind:""}, resources:{}, map:"", paths:{<book>:{progress: 0}, ...}, path:"", memoryPower:{}}
// where view is one of "loading", "map", "activity"
// action.type is a string coresponding to the next action
// action has other properties for each action.type
function kidAppReducer(oldState, action) {
    let state = {...oldState}
    let newActivity = ""

    for(const act of (Array.isArray(action) ? action : [action])) {
        switch(act.type) {
            case 'newView':
                state.view = act.view
                if(act.view === 'map') {
                    state.map = act.map
                }
                if(act.view === 'activity') {
                    state.activity = act.activity
                }
                state.path = act.path || state.path
                continue

            case 'nextModule':
                let keys = Object.keys(state.resources).filter(
                    key => Object.keys(state.resources[key]).includes(state.activity.kind)
                )
                newActivity = {...state.activity, key: valueAfter(keys, state.activity.key)}
                state.activity = newActivity
                continue

            case 'nextActivity':
                let kinds = Object.keys(state.resources[state.activity.key])
                newActivity = {...state.activity, kind: valueAfter(kinds, state.activity.kind)}
                state.activity = newActivity
                continue

            case 'nextInPath':
                let path = action.path || state.path
                state = {...state, path:path, paths:{[path]:-1, ...state.paths}} // create any missing state objects

                let activities = getPathActivities(state.resources, path)
                let pathIndex = action.index || state.paths[path]+1
                pathIndex = Math.min(pathIndex, activities.length-1)

                state.activity = activities[pathIndex]
                state.paths = {...state.paths, [path]:pathIndex}

                continue

            case 'addMemoryPower':
                let key = act.key || state.activity.key
                let newMP = {...state.memoryPower, [key]:state.memoryPower[key]+act.power}
                state.memoryPower = newMP
                continue

            case 'newResources':
                let defaultMemoryPower = Object.keys(act.resources).reduce((cum, key) => { cum[key] = 0; return cum }, {})
                state = {...state, resources:act.resources,
                    memoryPower:{...defaultMemoryPower, ...state.memoryPower}}
                continue

            case 'loadState':
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
        (acc,[key, kinds])=>{
            return [...acc, ...Object.values(kinds).filter(filter).map(
                r=>{
                    return {key:key, kind:r.kind}
                }
            )]
        }, [])
}

let Tree = props => <div>
    <h1>Tree</h1>
    <ButtonMap src={readingTree} buttons={[
        {id:'Palace', dispatch: {type:'newView', view:'map', map:'home'}},
        {id:'Branch1', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0001-10', kind:'Music Video'}}},
        {id:'Branch2', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0007-11', kind:'Music Video'}}},
        {id:'Branch3', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0012-14', kind:'Music Video'}}},
        {id:'Branch4', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0015-20', kind:'Music Video'}}},
        {id:'Branch5', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0021-23', kind:'Music Video'}}},
        {id:'Branch6', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-0024-29', kind:'Music Video'}}},
    ]}/>
</div>

let Map = props => <div>
    <ButtonMap src={mainMap} buttons={[
        {id:'City_Center', dispatch: {type:'newView', view:'map', map:'tree'}},
        {id:'Water_Well', dispatch: {type:'newView', view:'map', map:'tree'}},
        {id:'Jo_Schmo_House', dispatch: {type:'newView', view:'map', map:'tree'}},
        {id:'Art_Gazebo', dispatch: {type:'newView', view:'map', map:'tree'}},
        {id:'Dragon', dispatch: {type:'newView', view:'map', map:'tree'}},
        {id:'Memory_Palace', dispatch: {type:'newView', view:'map', map:'tree'}},
        {id:'Game_Factory', dispatch: {type:'newView', view:'map', map:'tree'}},
        {id:'Book_Tree', dispatch: {type:'newView', view:'map', map:'tree'}},
    ]}/>
</div>

let Maps = {
    home:Map,
    tree:Tree,
}

export default function KidModeApp(props) {
    let [state, dispatch] = useReducer(kidAppReducer, {view:'loading'})

    let resources = useFirestore(
        "memoryResources",
        (cum, doc) => {
          let d = doc.data();
          let verses = `${d.startVerse}-${d.endVerse}`
          let key = keyFromScripture(d.book, d.chapter, verses)
          cum[key] = cum[key] || {}
          cum[key][d.kind] = d
          return cum
        },
        {}
    );

    useEffect(() => {
        if(resources) {
            console.log(resources)
            dispatch([
                {type:'newResources', resources:resources}, 
                {type:'newView', view:'map', map:'home'}
            ])
        }
    }, [resources])

    // // helper method to update memoryP to an object of objects
    // let modulePowerObjectList = resources && Object.keys(resources).reduce(
    //     (cummulative, newKey) => {
    //         cummulative[newKey] = {powerLevel:0, progress:'start'}
    //         return cummulative
    //     }, 
    //     {}
    // );
    
    // // memoryP stores the object containing {{key: {powerLevel, progress}},..., {...}}
    // let [memoryP, setMemoryP] = useState({});
    // useEffect(
    //     () => {
    //         setMemoryP(modulePowerObjectList);
    //     },
    //     [resources],
    // );

    // @TODO: add component when the powerLevel is over 100, prompt the user to send in a video/ zoom Rose and Catherine
    let content = <div className='text-center pt-3'><Spinner animation="border" role="status" size="md" /><h1 className='d-inline-block'>Loading...</h1></div>
    if(state.view == 'map') content = Maps[state.map]()
    if(state.view == 'tree') content = <Tree />
    if(state.view == 'activity') content = <Activity actKey={state.activity.key} actKind={state.activity.kind} resources={resources} />

    return <DispatchContext.Provider value={dispatch}><StateContext.Provider value={state}>
            {content}
        </StateContext.Provider></DispatchContext.Provider>
}