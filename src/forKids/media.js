import React, { Component, useState, useEffect, useRef } from 'react'
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton
} from 'video-react';
import "../../node_modules/video-react/dist/video-react.css"
// import {Row, Col, ToggleButton, ToggleButtonGroup, ButtonGroup, Dropdown, Container} from 'react-bootstrap'
// import $ from "jquery"

import videoSplash from "../images/videoSplash.png"
import { useAuth, useFirestore, useCachedStorage } from '../hooks';


export default media = {
    "Music Video": (props) => <VideoMedia src={props.url} />,
    // "What It Means": WhatItMeans,
    // "Speed Memory": SpeedMemory,
    // "Schmoment": Schmoment,
    // "Music": Music,
    "Dance Video": (props) => <VideoMedia src={props.url} />,
    "Teachers Guide": (props) => <PDFMedia src={props.url} />,
    "Coloring Pages": (props) => <PDFMedia src={props.url} />,
    // "Karaoke Video": Karaoke,
}

function PDFMedia(props) {
    src = useCachedStorage(props.src)
    return <div className="player text-right">
        <a href={src}>Download</a><br/>
        <div className="embed-responsive embed-responsive-17by22" >
            <object data={src} type='application/pdf' style={{overflow:'scroll'}}></object>
        </div>
    </div>
}

function VideoMedia(props) {
    src = useCachedStorage(props.src)
    return <Player playsInline src={src} className="player" poster={videoSplash}>
        <BigPlayButton position="center" />
        <ControlBar>
            <PlaybackRateMenuButton rates={[2.0,1.5,1.0,0.7,0.5]} order={7.1} />
            <VolumeMenuButton order={7.1} vertical/>
        </ControlBar>
    </Player>
}
