import React, { Component, useState, useEffect, useRef } from 'react'

import treeMap from '../images/maps/TestMap.svg'
import ButtonMap from './buttonMap'


export default function KidModeApp(props) {
    let map, tree, activity
    activity = <h1>Activity</h1>

    tree = <div>
        <h1>Tree</h1>
        <ButtonMap src={treeMap} buttons={[
            {id:'Palace', onClick: ()=>setView(map)},
            {id:'SchmoHouse', onClick: () => ()=>setView(activity)},
            {id:'Tree', onClick: () => console.log('Tree Click')},
        ]}/>
    </div>

    map = <div>
        <h1>Map</h1>
        <ButtonMap src={treeMap} buttons={[
            {id:'SchmoHouse', onClick: () => ()=>setView(tree)},
            {id:'Palace', onClick: ()=>setView(tree)},
            {id:'Tree', onClick: () => setView(tree)},
        ]}/>
    </div>


    let [view, setView] = useState(map)
    return <>
        {/* Adult Nav here */}
        {view}
    </>
}