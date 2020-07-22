import React, { useContext, useState, useEffect, useRef } from "react";
import "../../node_modules/video-react/dist/video-react.css";

import { DispatchContext, StateContext } from "./kidModeApp"

import { useAuth, useFirestore, useCachedStorage } from "../hooks";
import ProcessVideoMemoryPower from "./processVideoMemoryPower";
import VideoMedia from "./VideoMedia";
import PDFMedia from "./PDFMedia"
import ColoringPageGenerator from "./coloringPageGenerator";
import PopupBookGenerator from './popupBookGenerator';
import { kinds, resoucesForKinds } from "../util";

// "Music Video" is no longer passde into media; I seperated the input, MV is now being passed in directly to the VideoMedia
function SimpleVideo(props) {
    let state = useContext(StateContext)
    let src = state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0]
    return <VideoMedia src={src} setShow={props.doneCallback}/>
}

export const media = {
  [kinds.watch]: SimpleVideo,
  [kinds.dance]: SimpleVideo,
  [kinds.karaoke]: SimpleVideo,

  [kinds.coloring]: (props) => {
    let state = useContext(StateContext)
    let src = state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0]
    return <ColoringPageGenerator onOpen={props.doneCallback} onClose={null} src={src} />
  },

  [kinds.book]: (props) => {
    let state = useContext(StateContext)
    let src = state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0]
    return <PopupBookGenerator openSidebar={props.doneCallback} closeSidebar={null} src={src} />
  },
};