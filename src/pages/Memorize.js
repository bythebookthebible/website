import React, { Component, useState, useEffect, useRef } from 'react'
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton
} from 'video-react';
import "../../node_modules/video-react/dist/video-react.css"
import {Row, Col, ToggleButton, ToggleButtonGroup, ButtonGroup, Dropdown} from 'react-bootstrap'
import $ from "jquery"
import logo from '../images/logo.svg';

import {Login} from '../forms/Login.js'

import videoSplash from "../images/videoSplash.png"
import { useAuth } from '../hooks';

var firebase = require('firebase')
var db = firebase.firestore()
var storage = firebase.storage()

const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea',
'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
'1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
'1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']

const kinds = ["Music Video", "Dance Video", "Karaoke Video", "Coloring Pages", "Teachers Guide"]

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
  return ((n % m) + m) % m;
}

// Media players for each kind of resource
function PDFMedia(props) {
    return [
        <div style={{maxWidth:'1000px', margin:'auto'}} className="embed-responsive embed-responsive-17by22" >
            <object data={props.src} type='application/pdf' style={{overflow:'scroll'}}></object>
        </div>,
        <br/>,<a href={props.src}>Download</a>
    ]
}

function VideoMedia(props) {
    return <div style={{maxWidth:'1000px', margin:'auto'}} >
        <Player playsInline src={props.src} className="player" poster={videoSplash}>
            <BigPlayButton position="center" />
            <ControlBar>
                <PlaybackRateMenuButton rates={[2.0,1.5,1.0,0.7,0.5]} order={7.1} />
                <VolumeMenuButton order={7.1} vertical/>
            </ControlBar>
        </Player>
    </div>
}

let players = {
    "mp4": VideoMedia,
    "pdf": PDFMedia,
}

export default function Memorize() {
    // Initialize and load resources and selections
    let [resources, setResources] = useState({})
    let [scriptureSelected, setScriptureSelected] = useState(new Set())
    let [kindsSelected, setKindsSelected] = useState(new Set([kinds[0]]))

    // load list of video resources
    useEffect(() => {
        let mounted = true
        async function getResources() {
            let snapshot = await db.collection('memoryResources').get()
            let scriptureSelected = new Set()
            let resources = snapshot.docs.reduce((r, doc) => {
                let d = doc.data()
                let verses = `${d.startVerse}-${d.endVerse}`
                let key = keyFromScripture(d.book,d.chapter,verses)
                r[key] = r[key] || {}
                r[key][d.kind] = d
                scriptureSelected.add(key)
                return r
            }, {})

            if(mounted) {
                setResources(resources) // Must set resources before setting scriptureSelected
                setScriptureSelected(scriptureSelected)
            }
        }
        getResources()
        return () => mounted = false;
    }, [])

    // Adjust view for access level
    let [user, claims] = useAuth(true)

    let upgradeMsg
    if (!user) {
        // Should log in
        upgradeMsg = <div><Login.LoginButton/> for free trial</div>
    } else if(claims.expirationDate - Date.now() > 0 || claims.permanentAccess || claims.admin) {
        // Full access
        upgradeMsg = null
    } else {
        // Should subscribe
        upgradeMsg = <div><a href='/subscribe'>Subscribe to see everything</a></div>
    }

    // Choose correct resource to play
    let [urlList, setUrlList] = useState([])
    let [index, setIndex] = useState(0)
    let [url, setUrl] = useState(null)

    // update list of urls matching selection
    useEffect(() => {
        let newUrlList = []
        for(let key of scriptureSelected) {
            for(let kind of kindsSelected) {
                if(kind in resources[key]) {
                    newUrlList.push(resources[key][kind].url)
                }
            }
        }
        setUrlList(newUrlList)
    }, [resources, scriptureSelected, kindsSelected])

    // update current url from index and urlList
    useEffect(() => {
        if(urlList.length > 0) {
            storage.ref(urlList[mod(index, urlList.length)]).getDownloadURL()
                .then(url => setUrl(url))
                .catch(e => console.error(e))
        }
    }, [urlList, index])

    // Choose correct player for current url
    let fileKind = url && url.split('?')[0].split('.').slice(-1)[0]
    let player = url && players[fileKind]

    // Memory format selector
    let memoryFormatSelector = <div className='text-center'>
        {kinds.map((kind) => 
            <ToggleButtonGroup className='checkbox' type='checkbox' key={kind} defaultValue={kindsSelected.has(kind) ? kind : []} onChange={values => {
                let k = new Set(kindsSelected)
                if(!!values[0]) {k.add(kind)}
                else {k.delete(kind)}
                setKindsSelected(k)
                setIndex(0)
            }}>
                <ToggleButton value={kind} variant='outline-primary'>{kind}</ToggleButton>
            </ToggleButtonGroup>
        )}
    </div>

    // Page layout
    return (<div className="container-xl py-2" >
        {/* {scriptureSelector} */}
        <ScriptureSelector defaultValue={scriptureSelected} resources={resources} onChange={v => {setScriptureSelected(v)}} />
        <Row>
            <i className="fa fa-5x fa-chevron-left player-control-prev" onClick={() => setIndex(index - 1) } />
            <Col>
                {player && player({src: url})}
            </Col>
            <i className="fa fa-5x fa-chevron-right player-control-next" onClick={() => setIndex(index + 1) }/>
        </Row>
        {memoryFormatSelector}
        {upgradeMsg}
    </div>)
}

function ScriptureSelector(props) {
    let [show, setShow] = useState(!!props.defaultOpen) // bool: true if expanded
    let [value, setValue] = useState(new Set()) // list of scripture key strings which are currently selected
    let [scriptures, setScriptures] = useState({})

    console.log('default and value', props.defaultValue, value)

    useEffect(() => {
        setValue(new Set(props.defaultValue))
    }, [props.defaultValue])

    useEffect(() => {
        // Make scripture grouped by Book, Chapter
        let scriptures = Object.keys(props.resources).reduce((acc, key) => {
            let s = scriptureFromKey(key)
            acc[s.book] = acc[s.book] || {}
            acc[s.book][s.chapter] = acc[s.book][s.chapter] || {}
            acc[s.book][s.chapter][s.verses] = props.resources[key]
            
            // let bookChapter = `${s.book} ${s.chapter}`
            // acc[bookChapter] = acc[bookChapter] ? [...acc[bookChapter], key] : [key]
            return acc
        }, {})
        setScriptures(scriptures)
        console.log('set scriptures:', scriptures)

    }, [props.resources])

    let title = "What do you want to memorize?"
    if(!show) {
        if(value.size > 0) {
            let s = scriptureFromKey(value.keys().next().value)
            title = `${s.book} ${s.chapter}`
        }

        return <div className='selection-expand-box text-center' onMouseEnter={() => setShow(true)} onClick={() => setShow(true)}>
            <img src={logo} height="30rem"/>
            <h2>{title}</h2>
        </div>
    } else {
        return <div className='selection-expand-box show' onMouseLeave={() => setShow(false)}>
            <div className='text-center' onClick={() => setShow(false)}>
                <img src={logo} height="30rem"/>
                <h2>{title}</h2>
            </div>

            {show &&
            <Row>{Object.keys(scriptures).map(book => <Col>
                <h3>{book}</h3>
                <Row>{Object.keys(scriptures[book]).map(chapter => <Col>
                    <h3>{chapter}</h3>
                    <div className='wavy-col' >
                        <div style={{height:'2.5rem', gridArea:'1 / 2 / 1 / 2'}} ></div>
                        {Object.keys(scriptures[book][chapter]).map(verses => {
                            let key = keyFromScripture(book, chapter, verses)
                            return <ToggleButtonGroup className='checkbox' type='checkbox' key={key} defaultValue={value.has(key) ? key : []} onChange={values => {
                                var v = new Set(value)
                                if(!!values[0]) v.add(key)
                                else v.delete(key)
                                console.log('changing value:', value, v)
                                setValue(v)
                                props.onChange(v)
                            }}>
                                <ToggleButton value={key} variant='outline-primary'>{verses}</ToggleButton>
                            </ToggleButtonGroup>}
                        )}
                    </div>
                </Col>)}</Row>
            </Col>)}</Row>}
        </div>
    }
}