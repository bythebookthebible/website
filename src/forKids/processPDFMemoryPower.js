import React, { Component, useState, useEffect, useRef } from "react";
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
import VideoMedia from "./VideoMedia";


// the default is that everytime a pdf rendors, the user will get one point
//
// pre: parameters passed in: setMemoryP, actKey, src, actKind
export default function ProcessPDFMemoryPower(props) {
    let [count, setCount] = useState(0);

    useEffect(() => {
        let key = props.actKey;
        props.setMemoryP(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                powerLevel: prev[key].powerLevel + 1
            }
        }))
    }, [props.actKey, props.actKind])

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