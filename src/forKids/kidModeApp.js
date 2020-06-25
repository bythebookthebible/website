import React, { Component, useState, useEffect, useRef } from 'react'

import treeMap from '../images/maps/TestMap.svg'
import readingTree from '../images/maps/TestTree.svg'
import ButtonMap from './buttonMap'
// import ActivityView from './ActivityView'

export default function KidModeApp(props) {
    let map, tree, activity
    activity = <h1>Activity</h1>

    tree = <div>
        <h1>Tree</h1>
        <ButtonMap src={readingTree} buttons={[
            {id:'Palace',  onClick: ()=>setView(map)},
            // {id:'Branch1', onClick: ()=>setView(<ActivityView kind='Music Video' verse='39-007-00001-6' />)},
            // {id:'Branch2', onClick: ()=>setView(<ActivityView kind='Music Video' verse='39-007-0007-11' />)},
            // {id:'Branch3', onClick: ()=>setView(<ActivityView kind='Music Video' verse='39-007-0012-14' />)},
            // {id:'Branch4', onClick: ()=>setView(<ActivityView kind='Music Video' verse='39-007-0015-20' />)},
            // {id:'Branch5', onClick: ()=>setView(<ActivityView kind='Music Video' verse='39-007-0021-23' />)},
            // {id:'Branch6', onClick: ()=>setView(<ActivityView kind='Music Video' verse='39-007-0024-29' />)},
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