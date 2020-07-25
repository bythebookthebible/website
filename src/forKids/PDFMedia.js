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
import ProcessPDFMemoryPower from "./processPDFMemoryPower";
import { DispatchContext, StateContext } from "./kidModeApp";


// @TODO: change the src back to src={src}
//
// pre: parameters needed actKind, actKey, setMemoryP
export default function PDFMedia(props) {
    let state = useContext(StateContext);
    let src = useCachedStorage(props.src);
    if (state.activity.kind == "Teachers Guide") {
        return <ProcessPDFMemoryPower src={"https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"} />;
    } else if (state.activity.kind == "Coloring Pages") {
        return <ProcessPDFMemoryPower src={"http://www.africau.edu/images/default/sample.pdf"} />;
    }
}