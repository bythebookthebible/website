import React, { Component, useState, useEffect, useRef } from 'react'

import treeMap from '../images/maps/TestMap.svg'
import readingTree from '../images/maps/TestTree.svg'
import ButtonMap from './buttonMap'
import Activity from './activity'

import { media } from "./media";
import { useAuth, useFirestore, useCachedStorage } from "../hooks"
import { keyFromScripture } from "../util"

let Tree = props => <div>
    <h1>Tree</h1>
    <ButtonMap src={readingTree} buttons={[
        {id:'Palace',  onClick: ()=>props.setState({view:'map'})},
        {id:'Branch1', onClick: ()=>props.setState({view:'activity', actKind:'Music Video', actKey:'39-007-0001-10'})},
        {id:'Branch2', onClick: ()=>props.setState({view:'activity', actKind:'Music Video', actKey:'39-007-0007-11'})},
        {id:'Branch3', onClick: ()=>props.setState({view:'activity', actKind:'Music Video', actKey:'39-007-0012-14'})},
        {id:'Branch4', onClick: ()=>props.setState({view:'activity', actKind:'Music Video', actKey:'39-007-0015-20'})},
        {id:'Branch5', onClick: ()=>props.setState({view:'activity', actKind:'Music Video', actKey:'39-007-0021-23'})},
        {id:'Branch6', onClick: ()=>props.setState({view:'activity', actKind:'Music Video', actKey:'39-007-0024-29'})},
    ]}/>
</div>

let Map = props => <div>
    <h1>Map</h1>
    <ButtonMap src={treeMap} buttons={[
        {id:'SchmoHouse', onClick: ()=>props.setState({view:'tree'})},
        {id:'Palace', onClick: ()=>props.setState({view:'tree'})},
        {id:'Tree', onClick: ()=>props.setState({view:'tree'})},
    ]}/>
</div>

export default function KidModeApp(props) {
    let [state, setState] = useState({view:'map'})

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

    // helper method to update memoryP to an object of objects
    let modulePowerObjectList = resources && Object.keys(resources).reduce(
        (cummulative, newKey) => {
            cummulative[newKey] = {powerLevel:0, progress:'start'}
            return cummulative
        }, 
        {}
    );
    
    // memoryP stores the object containing {{key: {powerLevel, progress}},..., {...}}
    let [memoryP, setMemoryP] = useState({});
    useEffect(
        () => {
            setMemoryP(modulePowerObjectList);
        },
        [resources],
    );
    console.log(memoryP)

    // @TODO: add component when the powerLevel is over 100, prompt the user to send in a video/ zoom Rose and Catherine

    if(state.view == 'map') return <Map setState={setState} />
    if(state.view == 'tree') return <Tree setState={setState} />
    if(state.view == 'activity') return <Activity setState={setState} actKey={state.actKey} actKind={state.actKind} resources={resources} setMemoryP={setMemoryP}/>
}