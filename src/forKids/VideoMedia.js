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


// @TODO: for type=="mv", change the src passed in back to src={src}
export default function VideoMedia(props) {
    let src = useCachedStorage(props.src);
      return <ProcessVideoMemoryPower actKey={props.actKey} setMemoryP={props.setMemoryP} src={"https://firebasestorage.googleapis.com/v0/b/bythebookthebible.appspot.com/o/memory%2FMatthew%2F007%2F39-007-001-006-music-video.mp4?alt=media&token=ec02c263-e4ee-4868-ab18-4027a75fc3a9"} />
}
  