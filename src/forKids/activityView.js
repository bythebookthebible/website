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
import { media } from "./media";
import { useAuth, useFirestore, useCachedStorage } from "../hooks";

// assume the props passed in: kind, key (eg."Music Video", "39-007-00001-6" )
export default function ActivityView(props) {
  let resources = useFirestore(
    "memoryResources",
    (cum, doc) => {
      let d = doc.data();
      let key = props.key;
      cum[key] = cum[key] || {};
      cum[key][d.kind] = d;
      return cum;
    },
    {}
  );

  return resources ? media[props.kind](resources[props.key][props.kind]) : null;
}
