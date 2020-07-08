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

import {Login} from '../forms/Login.js'

import videoSplash from "../images/videoSplash.png"
import { useAuth, useFirestore, useCachedStorage, withAuth } from '../hooks';

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

var firebase = require('firebase')
var db = firebase.firestore()
var storage = firebase.storage()

const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea',
'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
'1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
'1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']

// const kinds = ["Music Video", "Dance Video", "Karaoke Video", "Coloring Pages", "Teachers Guide"]
// const kinds = {
//     "Watch": Watch,
//     "What It Means": WhatItMeans,
//     "Speed Memory": SpeedMemory,
//     "Schmoment": Schmoment,
//     "Music": Music,
//     "Karaoke": Karaoke,
//     "Family Chat": FamilyChat,
//     "Dance": Dance,
//     "Color": Color,
// }
const kinds = {
    "Music Video": Watch,
    "Teachers Guide": WhatItMeans,
    // "Speed Memory": SpeedMemory,
    "Schmoment": Schmoment,
    // "Music": Music,
    "Dance Video": Dance,
    "Coloring Pages": Color,
    "Karaoke Video": Karaoke,
}

// convert between scripture references and a string key
// used for tracking scripture selected
const keyFromScripture = (book, chapter, verses) => `${String(books.indexOf(book)).padStart(2,'0')}-${String(chapter).padStart(3,'0')}-${String(verses).padStart(7,'0')}`
const scriptureFromKey = key => {
    let r = key.split('-')
    return {book: books[Number(r[0])], chapter: Number(r[1]), verses: `${Number(r[2])}-${Number(r[3])}`}
}

// this is a mathematically correct mod accounting for negative numbers
// mod(n, m) returns i where 0 <= i < m, where n - i is divisible by m
function mod(n, m) {
  return m >= 0 ? n % m : (n % m) + m
}

// Media players for each kind of resource
function PDFMedia(props) {
    return [
        <div className="player embed-responsive embed-responsive-17by22" >
            <object data={props.src} type='application/pdf' style={{overflow:'scroll'}}></object>
        </div>,
        <br/>,<a href={props.src}>Download</a>
    ]
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
    return <Login.AuthSwitch {...props}
        tests={[
            {
                test:user=>!(user.claims.expirationDate - Date.now() > 0 || user.claims.permanentAccess || user.claims.admin), 
                value:<Subscribe />
            },
        ]}
        default={<MemorizePage />}
    />
}

function MemorizePage(props) {
    // Initialize and load resources and selections
    let [scriptureSelected, setScriptureSelected] = useState(defaultSelected)
    // let [kindsSelected, setKindsSelected] = useState(new Set([kinds[0]]))
    let [kindsSelected, setKindsSelected] = useState(new Set([Object.keys(kinds)[0]]))

    let resources = useFirestore('memoryResources', (cum, doc) => {
        let d = doc.data()
        let verses = `${d.startVerse}-${d.endVerse}`
        let key = keyFromScripture(d.book,d.chapter,verses)
        cum[key] = cum[key] || {}
        cum[key][d.kind] = d
        return cum
    }, {})
    
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
        {Object.keys(kinds).map((kind) => 
            <CustomToggleButton className='m-2' selected={kindsSelected} value={kind} onChange={v => {
                setKindsSelected(v)
                setIndex(0)
            }} ><div style={{WebkitMask:`url(${kinds[kind]})`, mask:`url(${kinds[kind]})`, maskSize: "cover"}}></div></CustomToggleButton>
        )}
    </div>

    let [showControls, setShowControls] = useState(true)

    // Page layout
    return <div className='text-center py-2'>
        {upgradeMsg}
        <div className={`container-xl py-5 memorize-controls ${showControls ? '' : 'hide'}`} onMouseMove={mouseMoving(setShowControls)}>
            {player && player({src: url, style: {position:'absolute', zIndex:1}})}
            <ScriptureSelector key='scripture-selector' className='scripture-selector' selected={scriptureSelected} resources={resources} onChange={v => {setScriptureSelected(v)}} />
            <i className="fa fa-4x fa-chevron-left player-control-prev" onClick={() => setIndex(index - 1) } />
            <i className="fa fa-4x fa-chevron-right player-control-next" onClick={() => setIndex(index + 1) }/>
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
    // show = true

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

    return <Container className={`selection-expand-box ${show ? 'show' : ''} ${props.className || ''}`}
                onMouseLeave={() => setShow(false)} onMouseEnter={() => setShow(true)} onClick={() => setShow(true)}>
        <Row className='text-center' onClick={() => setShow(false)}>
            <Col>
                <img src={logo} height="30rem"/>
                <h2>{title}</h2>
            </Col>
        </Row>

        {show &&
        <Row style={{flexWrap:'nowrap', justifyContent:'flex-start'}}>{Object.keys(scriptures).map(book => <>
            {Object.keys(scriptures[book]).map(chapter => <Col>
                <h3>{book + ' ' + chapter}</h3>
                <div className='wavy-col'>
                    <div style={{height:'2rem', gridArea:'1 / 2 / 1 / 2'}} ></div>
                    {Object.keys(scriptures[book][chapter]).map(verses => {
                        let key = keyFromScripture(book, chapter, verses)
                        return <CustomToggleButton selected={selected} value={key} name='module' onChange={v => {
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

    return <Button {...passThrough} active={selected.has(value) ? value : undefined} variant='outline-primary' 
        onClick={() => {
            // var v = new Set(selected)
            // if(!!newSelected[0]) v.add(value)
            // else v.delete(value)
            // onChange(v)
            onChange(new Set([value]))
    }}>
        {children}
    </Button>
}