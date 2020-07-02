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
import PDFMedia from "./PDFMedia";

// "Music Video" is no longer passde into media; I seperated the input, MV is now being passed in directly to the VideoMedia
export const media = {
  // "Music Video": (props) => <VideoMedia src={props.url} type={"mv"} setMemoryP={props.setMemoryP} actKey={props.actKey} />,
  // "What It Means": WhatItMeans,
  // "Speed Memory": SpeedMemory,
  // "Schmoment": Schmoment,
  // "Music": Music,
  "Dance Video": (props) => <VideoMedia src={props.url} type={"dv"} />,
  "Teachers Guide": (props) => <PDFMedia src={props.url} type={"tg"} />,
  "Coloring Pages": (props) => <PDFMedia src={props.url} type={"cp"} />,
  // "Karaoke Video": Karaoke,
};