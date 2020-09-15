import React, { useState, useMemo } from 'react'
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton
} from 'video-react';
import "../../node_modules/video-react/dist/video-react.css"
import {Row, Col, Container, Button} from 'react-bootstrap'
import logo from '../images/innerBlueLogo.png';
import missing from './images/missingContent.png';
import "./focused.scss";

import videoSplash from "../activities/videoSplash.png"
import { useCachedStorage } from '../common/hooks';

import {keyFromScripture, scriptureFromKey, mod, getAllKinds, resoucesForKinds} from '../util'

// import WhatItMeans  from './images/memoryKinds/WhatItMeans.svg'
import Watch        from './images/memoryKinds/Watch.svg'
// import SpeedMemory  from './images/memoryKinds/SpeedMemory.svg'
import Schmoment    from './images/memoryKinds/Schmoment.svg'
// import Music        from './images/memoryKinds/Music.svg'
import Karaoke      from './images/memoryKinds/Karaoke.svg'
// import FamilyChat   from './images/memoryKinds/FamilyChat.svg'
import Dance        from './images/memoryKinds/Dance.svg'
// import Color        from './images/memoryKinds/Color.svg'
import { useSelector, useDispatch } from 'react-redux';
import { useFirestoreConnect } from 'react-redux-firebase';
import { updateFilter, nextIndex, prevIndex } from './focusedReducer';

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

export default function MemorizePage(props) {
    let dispatch = useDispatch()
    let scriptureSelected = useSelector(state => state.focused.filter.module)
    let kindsSelected = useSelector(state => state.focused.filter.activity)

    useFirestoreConnect([{collection:'memoryResources_02', storeAs:'memoryResources'}])
    let resources = useSelector(state => state.firestore.data.memoryResources)
    let index = useSelector(state => state.focused.index)
    
    // update list of urls matching selection
    let urlList = useMemo(() => {
        let urlList = []
        if(resources) {
            for(let module of scriptureSelected) {
                for(let kind of kindsSelected) {
                    if(getAllKinds(resources[module]).includes(kind)) {
                        urlList.push({url:resources[module][resoucesForKinds[kind][0]][0], version:resources[module].version})
                    }
                }
            }
        }
        return urlList
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
    let activitySelector = <div className='text-center' style={{bottom:0, zIndex:1}}>
        {Object.keys(kindsImages).map((kind) => 
            <CustomToggleButton selected={kindsSelected} value={kind} variant='outline-primary square-btn' onChange={v => dispatch(updateFilter({activity: v}))}>
                <div style={{WebkitMask:`url(${kindsImages[kind]})`, mask:`url(${kindsImages[kind]})`, maskSize: "cover"}} />
            </CustomToggleButton>
        )}
    </div>

    let [showControls, setShowControls] = useState(true)
    showControls = true // TEMPORARY

    // Page layout
    return <div className='text-center py-2'>
        <div className={`container-xl py-5 memorize-controls ${showControls ? '' : 'hide'}`} onMouseMove={mouseMoving(setShowControls)}>
            {player && player({src: url, style: {position:'absolute', zIndex:1}})}
            <ScriptureSelector key='scripture-selector' className='scripture-selector' kindsSelected={kindsSelected} resources={resources} />
            {urlList.length > 1 && [
                <i className="fa fa-4x fa-chevron-left player-control-prev" onClick={() => dispatch(prevIndex())} />,
                <i className="fa fa-4x fa-chevron-right player-control-next" onClick={() => dispatch(nextIndex())}/>,
            ]}
            {activitySelector}
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
    let dispatch = useDispatch()
    let [show, setShow] = useState(!!props.defaultOpen) // bool: true if expanded
    let selected = useSelector(state => state.focused.filter.module)

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

    let subtitle = ""
    if(!show && selected.size > 0) {
        let s = scriptureFromKey(selected.keys().next().value)
        subtitle = `${s.book} ${s.chapter}`
    }

    return <Container className={`selection-expand-box p-3 ${show ? 'show' : ''} ${props.className || ''}`}
                onMouseLeave={() => setShow(false)} onMouseEnter={() => setShow(true)} onClick={() => setShow(true)}>
        <Row className='text-center' onClick={() => setShow(false)}>
            <Col>
                <img src={logo} height="30rem"/>
                <h2>Choose Scripture...</h2>
                {subtitle && <h2>{subtitle}</h2>}
            </Col>
        </Row>

        {show &&
        <Row style={{flexWrap:'nowrap', justifyContent:'flex-start', overflowX:'auto'}}>{Object.keys(scriptures).map(book => <>
            {Object.keys(scriptures[book]).map(chapter => <Col>
                <CustomToggleButton selected={selected} variant='outline-primary my-1' style={{width: '8rem'}}
                    value={Object.keys(scriptures[book][chapter]).map(verses => keyFromScripture(book, chapter, verses))}
                    onChange={v => dispatch(updateFilter({module: v}))} >{book + ' ' + chapter}</CustomToggleButton>

                <div className='wavy-col'>
                    <div style={{height:'2rem', gridArea:'1 / 2 / 1 / 2'}} ></div>
                    {Object.keys(scriptures[book][chapter]).map(verses => {
                        let key = keyFromScripture(book, chapter, verses)
                        return <CustomToggleButton selected={selected} value={key} variant='outline-primary square-btn' onChange={v => dispatch(updateFilter({module: v}))} >{verses}</CustomToggleButton>
                    })}
                </div>
            </Col>)}
        </>)}
        </Row>}
    </Container>
}

function CustomToggleButton(props) {
    let {selected, value, onChange, children, ...passThrough} = props
    if(!Array.isArray(value)) value = [value]

    return <Button {...passThrough} active={value.every(v => selected.includes(v)) ? value : undefined} 
        onClick={() => {onChange(value)}}>
        {children}
    </Button>
}