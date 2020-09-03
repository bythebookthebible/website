import React, { useContext, useState, useEffect, useRef } from "react"
import "../../node_modules/video-react/dist/video-react.css"

import { DispatchContext, StateContext } from "../playfulMode/kidModeApp"

import { useAuth, useFirestore, useCachedStorage, useMemoryResources } from "../hooks"
import { RepetitionMemoryVideo, MemeoryPowerVideo, EchoMemoryVideo } from "./processVideoMemoryPower"
import PopupBookGenerator from './popupBookGenerator'
import { kinds, resoucesForKinds } from "../util"
import ProcessPDFMemoryPower from "./processPDFMemoryPower"
import ProcessCPMemoryPower from "./processCPMemoryPower"
import { useFirestoreConnect } from "react-redux-firebase"
import { useSelector } from "react-redux"

// "Music Video" is no longer passde into media; I seperated the input, MV is now being passed in directly to the VideoMedia

let withStateSrc = WrappedComponent => props => {
  let resources = useMemoryResources()
  let viewSelected = useSelector(state => state.playful.viewSelected)
  let url, version
  if(resources && resources[viewSelected.module]) {
    url = resources[viewSelected.module][resoucesForKinds[viewSelected.kind][0]][0]
    version = resources[viewSelected.module].version
    console.log('url', resources, viewSelected, url, version, src)
  }

  let src = useCachedStorage({url, version});
  console.log('url', resources, viewSelected, url, version, src)
  return <WrappedComponent {...props} src={src} />
}

let SimpleVideo = withStateSrc(MemeoryPowerVideo)
let SimplePdf = withStateSrc(ProcessPDFMemoryPower)
let Coloring = withStateSrc(ProcessCPMemoryPower)
let Book = withStateSrc(PopupBookGenerator)

function RepetitionVideo(props) {
  useFirestoreConnect([{collection:'memoryResources_02', storeAs:'memoryResources'}])
  
  let viewSelected = useSelector(state => state.playful.viewSelected)
  let resources = useSelector(state => state.firebase.data.memoryResources)
  let url, version, timestamps
  if(resources && resources[viewSelected.module]) {
    url = resources[viewSelected.module][resoucesForKinds[viewSelected.kind][0]][0]
    version = resources[viewSelected.module].version
    timestamps = resources[viewSelected.module]['timestamps'][0]
  }
  let src = useCachedStorage({url, version});
  
  return src ? <RepetitionMemoryVideo {...props} src={src} timestamps={timestamps} /> : null
}

function EchoVideo(props) {
  useFirestoreConnect([{collection:'memoryResources_02', storeAs:'memoryResources'}])
  
  let viewSelected = useSelector(state => state.playful.viewSelected)
  let resources = useSelector(state => state.firebase.data.memoryResources)
  let watchUrl, echoUrl, version, timestamps
  if(resources && resources[viewSelected.module]) {
    watchUrl = resources[viewSelected.module][resoucesForKinds[viewSelected.kind][0]][0]
    echoUrl = resources[viewSelected.module][resoucesForKinds[viewSelected.kind][1]][0]
    version = resources[viewSelected.module].version
    timestamps = resources[viewSelected.module]['timestamps'][0]
  }
  
  let watchSrc = useCachedStorage({url:watchUrl, version});
  let echoSrc = useCachedStorage({url:echoUrl, version});

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