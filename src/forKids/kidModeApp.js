import React, { Component, useState, useEffect, useRef } from 'react'

import treeMap from '../images/maps/TestMap.svg'
import readingTree from '../images/maps/TestTree.svg'
import ButtonMap from './buttonMap'
// import ActivityView from './ActivityView'

let ActivityView = props => <h1>Activity</h1>

let Tree = props => <div>
    <h1>Tree</h1>
    <ButtonMap src={readingTree} buttons={[
        {id:'Palace',  onClick: ()=>props.setState({view:'map'})},
        {id:'Branch1', onClick: ()=>props.setState({view:'activity', kind:'Music Video', key:'39-007-0001-10'})},
        {id:'Branch2', onClick: ()=>props.setState({view:'activity', kind:'Music Video', key:'39-007-0007-11'})},
        {id:'Branch3', onClick: ()=>props.setState({view:'activity', kind:'Music Video', key:'39-007-0012-14'})},
        {id:'Branch4', onClick: ()=>props.setState({view:'activity', kind:'Music Video', key:'39-007-0015-20'})},
        {id:'Branch5', onClick: ()=>props.setState({view:'activity', kind:'Music Video', key:'39-007-0021-23'})},
        {id:'Branch6', onClick: ()=>props.setState({view:'activity', kind:'Music Video', key:'39-007-0024-29'})},
    ]}/>
</div>

let Map = props => <div>
    <h1>Map</h1>
    <ButtonMap src={treeMap} buttons={[
        {id:'SchmoHouse', onClick: () => ()=>props.setState({view:'tree'})},
        {id:'Palace', onClick: ()=>props.setState({view:'tree'})},
        {id:'Tree', onClick: ()=>props.setState({view:'tree'})},
    ]}/>
</div>

export default function KidModeApp(props) {
    let [state, setState] = useState({view:'map'})

    if(state.view == 'map') return <Map setState={setState} />
    if(state.view == 'tree') return <Tree setState={setState} />
    if(state.view == 'activity') return <ActivityView setState={setState} key={state.key} kind={state.kind} />
}