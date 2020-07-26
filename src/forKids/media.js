import React, { useContext, useState, useEffect, useRef } from "react"
import "../../node_modules/video-react/dist/video-react.css"

import { DispatchContext, StateContext } from "./kidModeApp"

import { useAuth, useFirestore, useCachedStorage } from "../hooks"
import ProcessVideoMemoryPower from "./processVideoMemoryPower"
import PDFMedia from "./PDFMedia"
import ColoringPageGenerator from "./coloringPageGenerator"
import PopupBookGenerator from './popupBookGenerator'
import { kinds, resoucesForKinds } from "../util"

// "Music Video" is no longer passde into media; I seperated the input, MV is now being passed in directly to the VideoMedia
function SimpleVideo(props) {
  let state = useContext(StateContext)
  let src = useCachedStorage({
    url: state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0], 
    version: state.resources[state.activity.key].version
  });
  return src ? <ProcessVideoMemoryPower {...props} setShow={props.doneCallback} src={src} /> : null
}

function SimplePdf(props) {
    let state = useContext(StateContext)
    let src = state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0]
    return <PDFMedia {...props}  src={src} />
}

function Coloring(props) {
  let state = useContext(StateContext)
  let src = state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0]
  return <ColoringPageGenerator {...props}  onOpen={props.doneCallback} onClose={null} src={src} />
}

function Book(props) {
    let state = useContext(StateContext)
    console.log(resoucesForKinds[state.activity.kind])
    let src = state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0]
    return <PopupBookGenerator {...props}  openSidebar={props.doneCallback} closeSidebar={null} src={src} />
}

export const media = {
  [kinds.watch]: <SimpleVideo />,
  [kinds.karaoke]: <SimpleVideo />,
  [kinds.dance]: <SimpleVideo />,
  [kinds.joSchmo]: <SimpleVideo />,
  
  [kinds.craft]: <SimplePdf />,
  [kinds.schmoment]: <SimplePdf />,
  [kinds.discussion]: <SimplePdf />,
  
  // should be separated into different components, rather than included with simple video
  [kinds.speed]: <SimpleVideo />,
  [kinds.echo]: <SimpleVideo />,

  [kinds.coloring]: <Coloring />,
  [kinds.book]: <Book />,

  // Only in adult version
  // [kinds.music]: ,
  // [kinds.teacherGuide]: ,
};