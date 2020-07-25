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
import { DispatchContext, StateContext } from "./kidModeApp";


// the default is that everytime a pdf rendors, the user will get one point
//
// pre: parameters passed in: setMemoryP, actKey, src, actKind
export default function ProcessPDFMemoryPower(props) {
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext)

    useEffect(() => {
        dispatch({type:'addMemoryPower', power: 1})
    }, [state.activity.key, state.activity.kind])

    return (
        <div className="player text-right">
          <a href={props.src}>Download</a>
          <br />
          <div className="embed-responsive embed-responsive-17by22">
            <object
              data={props.src}
              type="application/pdf"
              style={{ overflow: "scroll" }}
            ></object>
          </div>
        </div>
    );


}

// props.src