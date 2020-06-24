import React, { Component, useState, useEffect, useRef } from "react";
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton,
} from "video-react";
import {
  Row,
  Col,
  ToggleButton,
  ToggleButtonGroup,
  ButtonGroup,
  Dropdown,
  Container,
} from "react-bootstrap";

// this is a mathematically correct mod accounting for negative numbers
// mod(n, m) returns i where 0 <= i < m, where n - i is divisible by m
function mod(n, m) {
  return m >= 0 ? n % m : (n % m) + m;
}

// Media players for each kind of resource
function PDFMedia(props) {
  return [
    <div className="player embed-responsive embed-responsive-17by22">
      <object
        data={props.src}
        type="application/pdf"
        style={{ overflow: "scroll" }}
      ></object>
    </div>,
    <br />,
    <a href={props.src}>Download</a>,
  ];
}

function VideoMedia(props) {
  return (
    <Player playsInline src={props.src} className="player">
      <BigPlayButton position="center" />
      <ControlBar>
        <PlaybackRateMenuButton rates={[2.0, 1.5, 1.0, 0.7, 0.5]} order={7.1} />
        <VolumeMenuButton order={7.1} vertical />
      </ControlBar>
    </Player>
  );
}

let players = {
  mp4: VideoMedia,
  pdf: PDFMedia,
};

export default function ActivityView(props) {
  return <h1>hu</h1>;
}
