import React, { Component, useState, useEffect, useRef } from 'react'
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton
} from 'video-react';
import "../../node_modules/video-react/dist/video-react.css"
import {Row, Col, ToggleButton, ToggleButtonGroup, ButtonGroup, Dropdown, Container, Button} from 'react-bootstrap'
import $ from "jquery"
import logo from '../images/logo.svg';
import missing from '../images/missingContent.png';

import {Login} from '../forms/Login.js'

import videoSplash from "../images/videoSplash.png"
import { useAuth, useFirestore, useCachedStorage, withAuth } from '../hooks';

import {firebase, db, storage} from '../firebase'
import {books, kinds, keyFromScripture, scriptureFromKey, mod, getAllKinds, resoucesForKinds} from '../util'

import WhatItMeans  from '../images/memoryKinds/WhatItMeans.svg'
import Watch        from '../images/memoryKinds/Watch.svg'
import SpeedMemory  from '../images/memoryKinds/SpeedMemory.svg'
import Schmoment    from '../images/memoryKinds/Schmoment.svg'
import Music        from '../images/memoryKinds/Music.svg'
import Karaoke      from '../images/memoryKinds/Karaoke.svg'
import FamilyChat   from '../images/memoryKinds/FamilyChat.svg'
import Dance        from '../images/memoryKinds/Dance.svg'
import Color        from '../images/memoryKinds/Color.svg'
import Subscribe from '../forms/Subscribe';

const kindsImages = {
    "watch": Watch,
    // "teacherGuide": WhatItMeans,
    // "speed": SpeedMemory,
    "joSchmo": Schmoment,
    // "music": Music,
    "dance": Dance,
    // "coloring": Color,
    "karaoke": Karaoke,
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

function MissingPlayer(props) {
    return <img src={missing} className="player" style={{maxWidth: '500px'}} />
}

let players = {
    "mp4": VideoMedia,
    "pdf": PDFMedia,
}

let defaultSelected = new Set(["39-007-001-006", "39-007-007-011", "39-007-012-014", "39-007-015-020", "39-007-021-023", "39-007-024-029"])

// export default function Memorize(props) {
//     return <Login.AuthSwitch {...props}
//         tests={[
//             {
//                 test:user=>!(user.claims.expirationDate - Date.now() > 0 || user.claims.permanentAccess || user.claims.admin), 
//                 value:<Subscribe />
//             },
//         ]}
//         default={<MemorizePage />}
//     />
// }

export default function MemorizePage(props) {
    // Initialize and load resources and selections
    let [scriptureSelected, setScriptureSelected] = useState(defaultSelected)
    // let [kindsSelected, setKindsSelected] = useState(new Set([kinds[0]]))
    let [kindsSelected, setKindsSelected] = useState(new Set([Object.keys(kindsImages)[0]]))

    let resources = useFirestore('memoryResources_02')
    
    // Adjust view for access level
    
    let upgradeMsg
    if (!props.user) {// Should log in
        upgradeMsg = <div><Login.LoginButton/> for 30 day trial access to all chapters.</div>
    } else if(props.user.claims.expirationDate - Date.now() > 0 || props.user.claims.permanentAccess || props.user.claims.admin) {
        upgradeMsg = null // Full access
    } else { // Should subscribe
        upgradeMsg = <div><a href='/subscribe'>Subscribe to access all chapters</a></div>
    }
    
    // Choose correct resource to play
    let [index, setIndex] = useState(0)
    let [urlList, setUrlList] = useState([])
    
    // update list of urls matching selection
    useEffect(() => {
        if(resources != undefined) {
            let newUrlList = []
            for(let key of scriptureSelected) {
                for(let kind of kindsSelected) {
                    if(getAllKinds(resources[key]).includes(kind)) {
                        console.log('filtering url list', kind, key, resoucesForKinds[kind][0], resources[key][resoucesForKinds[kind][0]][0], resources[key].version)
                        newUrlList.push({url:resources[key][resoucesForKinds[kind][0]][0], version:resources[key].version})
                    }
                }
            }
            setUrlList(newUrlList)
            setIndex(0)
        }
    }, [resources, scriptureSelected, kindsSelected])

    // get video from cache if available
    let versionedUrl = urlList[mod(index, urlList.length)]
    let url = useCachedStorage(versionedUrl)
    console.log('urls', urlList, versionedUrl, url)

    let keyUrl = versionedUrl && versionedUrl.url

    // Choose correct player for current url
    let fileKind = keyUrl && keyUrl.split('.').slice(-1)[0]
    let player = keyUrl ? players[fileKind] : MissingPlayer
    if(!url) player = MissingPlayer

    // Memory format selector
    let memoryFormatSelector = <div className='text-center' style={{bottom:0, zIndex:1}}>
        {Object.keys(kindsImages).map((kind) => 
            <CustomToggleButton selected={kindsSelected} value={kind} variant='outline-primary square-btn' onChange={v => {
                setKindsSelected(v)
                setIndex(0)
            }}>
                <div style={{WebkitMask:`url(${kindsImages[kind]})`, mask:`url(${kindsImages[kind]})`, maskSize: "cover"}} />
            </CustomToggleButton>
        )}
    </div>

    let [showControls, setShowControls] = useState(true)

    // Page layout
    return <div className='text-center py-2'>
        {upgradeMsg}
        <div className={`container-xl py-5 memorize-controls ${showControls ? '' : 'hide'}`} onMouseMove={mouseMoving(setShowControls)}>
            {player && player({src: url, style: {position:'absolute', zIndex:1}})}
            <ScriptureSelector key='scripture-selector' className='scripture-selector' kindsSelected={kindsSelected} selected={scriptureSelected} resources={resources} onChange={v => {setScriptureSelected(v)}} />
            {urlList.length > 1 && [
                <i className="fa fa-4x fa-chevron-left player-control-prev" onClick={() => setIndex(index - 1) } />,
                <i className="fa fa-4x fa-chevron-right player-control-next" onClick={() => setIndex(index + 1) }/>,
            ]}
            {memoryFormatSelector}
        </div>
    </div>
}

let timeout
let mouseMoving = (cb) => () => {
    cb(true);
    
    (() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => cb(false), 3000);
    })();
}

function ScriptureSelector(props) {
    let [show, setShow] = useState(!!props.defaultOpen) // bool: true if expanded
    let [selected, setSelected] = useState(new Set(props.selected)) // list of scripture key strings which are currently selected

    if(!props.resources) return null

    // Make scripture grouped by Book, Chapter
    let scriptures = Object.keys(props.resources)
        .filter(key=>Array.from(props.kindsSelected).some(kind=>getAllKinds(props.resources[key]).includes(kind)))
        .reduce((cum, key) => {
            let s = scriptureFromKey(key)
            cum[s.book] = cum[s.book] || {}
            cum[s.book][s.chapter] = cum[s.book][s.chapter] || {}
            cum[s.book][s.chapter][s.verses] = {...s, key:key}
            return cum
        }, {})

    let title = "Choose Scripture..."
    if(!show && selected.size > 0) {
        let s = scriptureFromKey(selected.keys().next().value)
        title = `${s.book} ${s.chapter}`
    }

    return <Container className={`selection-expand-box p-3 ${show ? 'show' : ''} ${props.className || ''}`}
                onMouseLeave={() => setShow(false)} onMouseEnter={() => setShow(true)} onClick={() => setShow(true)}>
        <Row className='text-center' onClick={() => setShow(false)}>
            <Col>
                <img src={logo} height="30rem"/>
                <h2>{title}</h2>
            </Col>
        </Row>

        {show &&
        <Row style={{flexWrap:'nowrap', justifyContent:'flex-start', overflowX:'auto'}}>{Object.keys(scriptures).map(book => <>
            {Object.keys(scriptures[book]).map(chapter => <Col>
                <CustomToggleButton selected={selected} variant='outline-primary my-1' style={{width: '8rem'}}
                    value={Object.keys(scriptures[book][chapter]).map(verses => keyFromScripture(book, chapter, verses))}
                    onChange={v => {
                        props.onChange(v)
                        setSelected(v)
                }} >{book + ' ' + chapter}</CustomToggleButton>
                {/* <h3>{book + ' ' + chapter}</h3> */}
                <div className='wavy-col'>
                    <div style={{height:'2rem', gridArea:'1 / 2 / 1 / 2'}} ></div>
                    {Object.keys(scriptures[book][chapter]).map(verses => {
                        let key = keyFromScripture(book, chapter, verses)
                        return <CustomToggleButton selected={selected} value={key} variant='outline-primary square-btn' onChange={v => {
                            props.onChange(v)
                            setSelected(v)
                        }} >{verses}</CustomToggleButton>
                    })}
                </div>
            </Col>)}
        </>)}
        </Row>}
    </Container>
}

// props are selected (Set) and value
function CustomToggleButton(props) {
    let {selected, value, onChange, children, ...passThrough} = props
    if(!Array.isArray(value)) value = [value]

    return <Button {...passThrough} active={value.every(v => selected.has(v)) ? value : undefined} 
        onClick={() => {
            // var v = new Set(selected)
            // if(!!newSelected[0]) v.add(value)
            // else v.delete(value)
            // onChange(v)
            onChange(new Set(value))
    }}>
        {children}
    </Button>
}