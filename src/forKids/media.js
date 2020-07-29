import React, { useContext, useState, useEffect, useRef } from "react"
import "../../node_modules/video-react/dist/video-react.css"

import { DispatchContext, StateContext } from "./kidModeApp"

import { useAuth, useFirestore, useCachedStorage } from "../hooks"
import { RepetitionMemoryVideo, MemeoryPowerVideo, EchoMemoryVideo } from "./processVideoMemoryPower"
import PopupBookGenerator from './popupBookGenerator'
import { kinds, resoucesForKinds } from "../util"
import ProcessPDFMemoryPower from "./processPDFMemoryPower"
import ProcessCPMemoryPower from "./processCPMemoryPower"

// "Music Video" is no longer passde into media; I seperated the input, MV is now being passed in directly to the VideoMedia

let withStateSrc = WrappedComponent => props => {
  let state = useContext(StateContext)
  let src = useCachedStorage({
    url: state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0], 
    version: state.resources[state.activity.key].version
  });
  return <WrappedComponent {...props} src={src} />
}

let SimpleVideo = withStateSrc(MemeoryPowerVideo)
let SimplePdf = withStateSrc(ProcessPDFMemoryPower)
let Coloring = withStateSrc(ProcessCPMemoryPower)
let Book = withStateSrc(PopupBookGenerator)

function RepetitionVideo(props) {
  let state = useContext(StateContext)
  let src = useCachedStorage({
    url: state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0], 
    version: state.resources[state.activity.key].version
  });
  let timestamps = state.resources[state.activity.key]['timestamps'][0]
  return <RepetitionMemoryVideo {...props} src={src} timestamps={timestamps} />
}

function EchoVideo(props) {
  let state = useContext(StateContext)
  let watchSrc = useCachedStorage({
    url: state.resources[state.activity.key][resoucesForKinds[state.activity.kind][0]][0], 
    version: state.resources[state.activity.key].version
  });
  let echoSrc = useCachedStorage({
    url: state.resources[state.activity.key][resoucesForKinds[state.activity.kind][1]][0], 
    version: state.resources[state.activity.key].version
  });
  let timestamps = state.resources[state.activity.key]['timestamps'][0]
  return watchSrc && echoSrc ? <EchoMemoryVideo {...props} watchSrc={watchSrc} echoSrc={echoSrc} timestamps={timestamps} /> : null
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
  [kinds.speed]: <RepetitionVideo />,
  [kinds.echo]: <SimpleVideo />,

  [kinds.coloring]: <Coloring />,
  [kinds.book]: <Book />,

  // Only in adult version
  // [kinds.music]: ,
  // [kinds.teacherGuide]: ,
};