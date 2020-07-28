import React, { useContext, useState, useEffect, useRef } from "react"
import "../../node_modules/video-react/dist/video-react.css"

import { DispatchContext, StateContext } from "./kidModeApp"

import { useAuth, useFirestore, useCachedStorage } from "../hooks"
import { RepetitionMemoryVideo, MemeoryPowerVideo } from "./processVideoMemoryPower"
import PopupBookGenerator from './popupBookGenerator'
import { kinds, resoucesForKinds } from "../util"
import ProcessPDFMemoryPower from "./processPDFMemoryPower"
import ProcessCPMemoryPower from "./processCPMemoryPower"

// "Music Video" is no longer passde into media; I seperated the input, MV is now being passed in directly to the VideoMedia
function SimpleVideo(props) {
  let state = useContext(StateContext)
  let src = useCachedStorage({
    url: state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0], 
    version: state.resources[state.activity.key].version
  });
  return src ? <MemeoryPowerVideo {...props} setShow={props.doneCallback} src={src} /> : ComingSoon
}

function RepetitionVideo(props) {
  let state = useContext(StateContext)
  let src = useCachedStorage({
    url: state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0], 
    version: state.resources[state.activity.key].version
  });
  let timestamps = state.resources[state.activity.key]['timestamps'][0]
  return src ? <RepetitionMemoryVideo {...props} setShow={props.doneCallback} src={src} timestamps={timestamps} /> : ComingSoon
}

function SimplePdf(props) {
  let state = useContext(StateContext)
  let src = useCachedStorage({
    url: state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0], 
    version: state.resources[state.activity.key].version
  });
  return <ProcessPDFMemoryPower {...props} src={src} />
}

function Coloring(props) {
  let state = useContext(StateContext)
  let src = useCachedStorage({
    url: state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0], 
    version: state.resources[state.activity.key].version
  });
  return <ProcessCPMemoryPower {...props} onOpen={props.doneCallback} onClose={()=>undefined} src={src} />
}

function Book(props) {
    let state = useContext(StateContext)
    console.log(resoucesForKinds[state.activity.kind])
    let src = state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0]
    return <PopupBookGenerator {...props}  openSidebar={props.doneCallback} closeSidebar={null} src={src} />
}

var ComingSoon = <h1 className='text-center mt-5'>Coming Soon!</h1>

export const media = {
  [kinds.watch]: <SimpleVideo />,
  [kinds.karaoke]: <SimpleVideo />,
  [kinds.dance]: <SimpleVideo />,
  [kinds.joSchmo]: <SimpleVideo />,
  
  [kinds.craft]: <SimplePdf />,
  [kinds.schmoment]: <SimplePdf />,
  [kinds.discussion]: <SimplePdf />,
  
  // should be separated into different components, rather than included with simple video
  [kinds.speed]: <RepetitionVideo />,
  [kinds.echo]: <SimpleVideo />,

  [kinds.coloring]: <Coloring />,
  [kinds.book]: <Book />,

  // Only in adult version
  // [kinds.music]: ,
  // [kinds.teacherGuide]: ,
};