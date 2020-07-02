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

export default function PDFMedia(props) {
    let src = useCachedStorage(props.src);
  
    return (
      <div className="player text-right">
        <a href={src}>Download</a>
        <br />
        <div className="embed-responsive embed-responsive-17by22">
          <object
            data={src}
            type="application/pdf"
            style={{ overflow: "scroll" }}
          ></object>
        </div>
      </div>
    );
  }