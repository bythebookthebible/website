import React, { Component, useState, useEffect, useRef, useContext } from "react";
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton,
} from "video-react";
import "../../node_modules/video-react/dist/video-react.css";
import ProcessVideoMemoryPower from "./processVideoMemoryPower";
// import {Row, Col, ToggleButton, ToggleButtonGroup, ButtonGroup, Dropdown, Container} from 'react-bootstrap'
// import $ from "jquery"

import videoSplash from "../images/videoSplash.png";
import { useAuth, useFirestore, useCachedStorage } from "../hooks";
import { DispatchContext, StateContext } from "./kidModeApp"



// @TODO: 1) change the src passed in back to src={src}
//        2) add other activities as the materials expand
//
// pre: parameters needed: actKind, actKey, setMemoryP
export default function VideoMedia(props) {
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext)

    let src = useCachedStorage(props.src);
    if (state.activity.kind == "Music Video") {
        return <ProcessVideoMemoryPower setShow={props.setShow} src={"https://firebasestorage.googleapis.com/v0/b/bythebookthebible.appspot.com/o/memory%2FMatthew%2F007%2F39-007-001-006-music-video.mp4?alt=media&token=ec02c263-e4ee-4868-ab18-4027a75fc3a9"} />
    } else if (state.activity.kind == "Dance Video") {
        return <ProcessVideoMemoryPower setShow={props.setShow} src={"http://media.w3.org/2010/05/bunny/movie.mp4"} />
    }
}
  

// props.src