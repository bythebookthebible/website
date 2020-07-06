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
import ProcessPDFMemoryPower from "./processPDFMemoryPower";


// @TODO: change the src back to src={src}
//
// pre: parameters needed actKind, actKey, setMemoryP
export default function PDFMedia(props) {
    let src = useCachedStorage(props.src);
    if (props.actKind == "Teachers Guide") {
        return <ProcessPDFMemoryPower actKey={props.actKey} actKind={props.actKind} setMemoryP={props.setMemoryP} src={"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"} />;
    } else if (props.actKind == "Coloring Pages") {
        return <ProcessPDFMemoryPower actKey={props.actKey} actKind={props.actKind} setMemoryP={props.setMemoryP} src={"http://www.africau.edu/images/default/sample.pdf"} />;
    }
}