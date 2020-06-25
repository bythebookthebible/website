import React, { Component, useState, useEffect, useRef } from 'react'
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton
} from 'video-react';
import "../../node_modules/video-react/dist/video-react.css"
import {Row, Col, ToggleButton, ToggleButtonGroup, ButtonGroup, Dropdown, Container} from 'react-bootstrap'
import $ from "jquery"
import logo from '../images/logo.svg';

import {Login} from '../forms/Login.js'

import videoSplash from "../images/videoSplash.png"
import { useAuth, useFirestore, useCachedStorage } from '../hooks';

import {firebase, db, storage} from '../firebase'
import {books, kinds, keyFromScripture, scriptureFromKey, mod} from '../util'

import WhatItMeans  from '../images/memoryKinds/WhatItMeans.svg'
import Watch        from '../images/memoryKinds/Watch.svg'
import SpeedMemory  from '../images/memoryKinds/SpeedMemory.svg'
import Schmoment    from '../images/memoryKinds/Schmoment.svg'
import Music        from '../images/memoryKinds/Music.svg'
import Karaoke      from '../images/memoryKinds/Karaoke.svg'
import FamilyChat   from '../images/memoryKinds/FamilyChat.svg'
import Dance        from '../images/memoryKinds/Dance.svg'
import Color        from '../images/memoryKinds/Color.svg'

const kindsImages = {
    "Music Video": Watch,
    // "What It Means": WhatItMeans,
    // "Speed Memory": SpeedMemory,
    // "Schmoment": Schmoment,
    // "Music": Music,
    "Dance Video": Dance,
    "Teachers Guide": FamilyChat,
    "Coloring Pages": Color,
    // "Karaoke Video": Karaoke,
}

// Media players for each kind of resource
function PDFMedia(props) {
    return <div className="player text-right">
        <a href={props.src}>Download</a><br/>
        <div className="embed-responsive embed-responsive-17by22" >
            <object data={props.src} type='application/pdf' style={{overflow:'scroll'}}></object>
        </div>
    </div>
}

function VideoMedia(props) {
    return <Player playsInline src={props.src} className="player" poster={videoSplash}>
        <BigPlayButton position="center" />
        <ControlBar>
            <PlaybackRateMenuButton rates={[2.0,1.5,1.0,0.7,0.5]} order={7.1} />
            <VolumeMenuButton order={7.1} vertical/>
        </ControlBar>
    </Player>
}

let players = {
    "mp4": VideoMedia,
    "pdf": PDFMedia,
}

let defaultSelected = new Set(["39-007-00001-6", "39-007-0007-11", "39-007-0012-14", "39-007-0015-20", "39-007-0021-23", "39-007-0024-29"])

export default function Memorize(props) {
    // Initialize and load resources and selections
    let [scriptureSelected, setScriptureSelected] = useState(defaultSelected)
    // let [kindsSelected, setKindsSelected] = useState(new Set([kinds[0]]))
    let [kindsSelected, setKindsSelected] = useState(new Set([Object.keys(kindsImages)[0]]))

    let resources = useFirestore('memoryResources', (cum, doc) => {
        let d = doc.data()
        let verses = `${d.startVerse}-${d.endVerse}`
        let key = keyFromScripture(d.book,d.chapter,verses)
        cum[key] = cum[key] || {}
        cum[key][d.kind] = d
        return cum
    }, {})
    
    // Adjust view for access level
    let [user, claims] = useAuth(true)
    
    let upgradeMsg
    if (!user) {// Should log in
        upgradeMsg = <div><Login.LoginButton/> for free trial</div>
    } else if(claims.expirationDate - Date.now() > 0 || claims.permanentAccess || claims.admin) {
        upgradeMsg = null // Full access
    } else { // Should subscribe
        upgradeMsg = <div><a href='/subscribe'>Subscribe to see everything</a></div>
    }
    
    // Choose correct resource to play
    let [index, setIndex] = useState(0)
    let [selectedResources, setSelectedResources] = useState([])
    let [urlList, setUrlList] = useState([])
    
    // update list of urls matching selection
    useEffect(() => {
        if(resources != undefined) {
            let newUrlList = []
            for(let key of scriptureSelected) {
                for(let kind of kindsSelected) {
                    if(kind in resources[key]) {
                        newUrlList.push(resources[key][kind].url)
                    }
                }
            }
            setUrlList(newUrlList)
            setIndex(0)
        }
    }, [resources, scriptureSelected, kindsSelected])

    // get video from cache if available
    let keyUrl = urlList[mod(index, urlList.length)]
    let url = useCachedStorage({url: keyUrl, version: '-1'})

    // Choose correct player for current url
    let fileKind = keyUrl && keyUrl.split('.').slice(-1)[0]
    let player = keyUrl && players[fileKind]

    // Memory format selector
    let memoryFormatSelector = <div className='text-center' style={{bottom:0, zIndex:1}}>
        {Object.keys(kindsImages).map((kind) => 
            <ToggleButtonGroup className='checkbox' type='checkbox' key={kind} defaultValue={kindsSelected.has(kind) ? kind : []} onChange={values => {
                let k = new Set(kindsSelected)
                if(!!values[0]) {k.add(kind)}
                else {k.delete(kind)}
                setKindsSelected(k)
                setIndex(0)
            }}>
                <ToggleButton value={kind} variant='outline-primary'><div style={{WebkitMask:`url(${kindsImages[kind]})`, mask:`url(${kindsImages[kind]})`, maskSize: "cover"}}></div></ToggleButton>
            </ToggleButtonGroup>
        )}
    </div>

    let [showControls, setShowControls] = useState(true)

    // Page layout
    return <div className={`container-xl py-2 memorize-controls ${showControls ? '' : 'hide'}`} onMouseMove={mouseMoving(setShowControls)}>
        {player && player({src: url, style: {position:'absolute', zIndex:1}})}
        <ScriptureSelector key='scripture-selector' className='scripture-selector' selected={scriptureSelected} resources={resources} onChange={v => {setScriptureSelected(v)}} />
        <i className="fa fa-4x fa-chevron-left player-control-prev" onClick={() => setIndex(index - 1) } />
        <i className="fa fa-4x fa-chevron-right player-control-next" onClick={() => setIndex(index + 1) }/>
        {memoryFormatSelector}
        {/* {upgradeMsg} */}
    </div>
}

let timeout
let mouseMoving = (cb) => () => {
    cb(true);
    
    (() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => cb(false), 5000);
    })();
}

function ScriptureSelector(props) {
    let [show, setShow] = useState(!!props.defaultOpen) // bool: true if expanded
    let [selected, setSelected] = useState(new Set(props.selected)) // list of scripture key strings which are currently selected

    if(!props.resources) return null

    // Make scripture grouped by Book, Chapter
    let scriptures = Object.keys(props.resources).reduce((cum, key) => {
        let s = scriptureFromKey(key)
        cum[s.book] = cum[s.book] || {}
        cum[s.book][s.chapter] = cum[s.book][s.chapter] || {}
        cum[s.book][s.chapter][s.verses] = s
        return cum
    }, {})

    let title = "Choose Scripture..."
    if(!show && selected.size > 0) {
        let s = scriptureFromKey(selected.keys().next().value)
        title = `${s.book} ${s.chapter}`
    }

    return <div className={`selection-expand-box ${show ? 'show' : ''} ${props.className || ''}`}
                onMouseLeave={() => setShow(false)} onMouseEnter={() => setShow(true)} onClick={() => setShow(true)}>
        <div className='text-center' onClick={() => setShow(false)}>
            <img src={logo} height="30rem"/>
            <h2>{title}</h2>
        </div>

        {show &&
        <Container><Row style={{flexWrap:'nowrap', justifyContent:'flex-start'}}>{Object.keys(scriptures).map(book => <>
            {Object.keys(scriptures[book]).map(chapter => <Col>
                <h3>{book + ' ' + chapter}</h3>
                <div className='wavy-col'>
                    <div style={{height:'2rem', gridArea:'1 / 2 / 1 / 2'}} ></div>
                    {Object.keys(scriptures[book][chapter]).map(verses => {
                        let key = keyFromScripture(book, chapter, verses)
                        return <ToggleButtonGroup className='checkbox' type='checkbox' key={key} defaultValue={selected.has(key) ? key : []} onChange={newSelected => {
                            var v = new Set(selected)
                            if(!!newSelected[0]) v.add(key)
                            else v.delete(key)
                            props.onChange(v)
                            setSelected(v)
                        }}>
                            <ToggleButton selected={key} value={key} variant='outline-primary'>{verses}</ToggleButton>
                        </ToggleButtonGroup>}
                    )}
                </div>
            </Col>)}
        </>)}</Row></Container>}
    </div>
}
