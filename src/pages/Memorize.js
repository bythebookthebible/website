import React, { Component, useState, useEffect, useRef } from 'react'
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton
} from 'video-react';
import "../../node_modules/video-react/dist/video-react.css"
import {Row, Col} from 'react-bootstrap'
import $ from "jquery"

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

const kinds = ["Music Video", "Dance Video", "Karaoke Video", "Slower Video", "Coloring Pages", "Teachers Guide"]

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
    return <div>
        <object data={props.src} type='application/pdf' width='500px' height='500px' />
        <br/><a href={props.src}>Download</a>
    </div>
}

function VideoMedia(props) {
    return <div style={{maxWidth:'1000px', margin:'auto'}}>
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
    let [scriptureSelected, setScriptureSelected] = useState({})
    let [kindsSelected, setKindsSelected] = useState(kinds.reduce((prev, k) => {
        prev[k] = k == kinds[0]
        return prev
    }, {}))

    // load list of video resources
    useEffect(() => {
        let mounted = true
        async function getResources() {
            let snapshot = await db.collection('memoryResources').get()
            let scriptureSelected = {}
            let resources = snapshot.docs.reduce((r, doc) => {
                let d = doc.data()
                let verses = `${d.startVerse}-${d.endVerse}`
                let key = keyFromScripture(d.book,d.chapter,verses)
                r[key] = r[key] || {}
                r[key][d.kind] = d
                scriptureSelected[key] = true
                return r
            }, {})

            if(mounted) {
                setResources(resources) // Must set resources before setting scriptureSelected
                setScriptureSelected(scriptureSelected)
                // scriptureSelected[Object.keys(scriptureSelected)[0]] = true
            }
        }
        getResources()
        return () => mounted = false;
    }, [])
    

    // Adjust view for access level
    let [user, claims] = useAuth(true)
    // console.log(claims)

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
        for(let key in scriptureSelected) {
            if(!scriptureSelected[key]) continue
            for(let kind in kindsSelected) {
                if(kindsSelected[kind] && kind in resources[key]) {
                    newUrlList.push(resources[key][kind].url)
                }
            }
        }
        setUrlList(newUrlList)
    }, [resources, scriptureSelected, kindsSelected])

    // update current url from index and urlList
    useEffect(() => {
        // console.log('url', index, urlList)
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
    let memoryFormatSelector = <div className='selection-expand-box'>
        {/* FILTER SELECTION */}
        <h1>How are we memorizing?</h1>
        {kinds.map((kind) => <CheckBox key={kind} defaultChecked={kindsSelected[kind]} onChange={checked => {
                let k = {...kindsSelected}
                k[kind] = checked
                setKindsSelected(k)
                setIndex(0)
            }}>{kind}</CheckBox>
        )}
    </div>

    // Scripture Selector
    let scriptureSelector = <div className='selection-expand-box'>
        <h1>What are we memorizing?</h1>
        {Object.keys(scriptureSelected).sort().map(key => 
            <CheckBox key={key} defaultChecked={scriptureSelected[key]} onChange={checked => {
                let s = {...scriptureSelected}
                s[key] = checked
                setScriptureSelected(s)
                setIndex(0)
            }}>{Object.values(scriptureFromKey(key)).join(' ')}</CheckBox>
        )}
    </div>

    // Page layout
    return (<div className="container-xl" >
        <Row>
            {scriptureSelector}
            {memoryFormatSelector}
        </Row>
        <Row>
            <i className="fa fa-5x fa-chevron-left player-control-prev" onClick={() => setIndex(index - 1) } />
            <Col>
                {player && player({src: url})}
            </Col>
            <i className="fa fa-5x fa-chevron-right player-control-next" onClick={() => setIndex(index + 1) }/>
        </Row>
        {upgradeMsg}
    </div>)
}

function CheckBox(props) {
    let [checked, setChecked] = useState(!!props.defaultChecked)
    let checkbox = useRef()

    useEffect(() => checkbox.current.setAttribute('checked', checked), [checked])

    return <div className={'check-box ' + props.className} style={props.style} ref={checkbox} onClick={() => {
        let c = !checked
        setChecked(c)
        props.onChange(c)
    }}>{props.children}</div>
}
