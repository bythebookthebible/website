import React, { useState, useRef, useCallback, useEffect } from "react";
import { media } from "../activities/media";
import MemorizedPrompt from './memorizedPrompt'
import { ReactComponent as sidebar } from './images/ActivitySideBar.svg';
import { ReactComponent as Chalice } from './images/MemoryChalice.svg';

import $ from "jquery";
import { kinds } from "../util";
import { useSelector } from "react-redux";
import { newView, playfulViews, nextModule, nextActivity, pathFinished } from "./playfulReducer";
import SVGButtons from "./SVGButtons";

function Sidebar(props) {
    // if current activity has index for path, then use alternate sidebar
    let activity = useSelector(state => state.playful.viewSelected)

    let buttons = [
        {id: 'MemoryPalace', dispatch: newView({view:playfulViews.map, viewSelected:'palace'})},
        {id: 'PlayAgain', onClick: ()=>props.onRepeat.current()},
        {id: 'NextVerse', dispatch: nextModule},
        {id: 'NextActivity', dispatch: nextActivity},
    ]
    // reroute Continue button if on adventure path
    if(activity.index !== undefined) {
      buttons.push({id: 'Continue', dispatch: ()=>pathFinished(activity)})
    } else {
      buttons.push({id: 'Continue', dispatch: nextModule})
    }

    return <SVGButtons svg={sidebar} width={.3} buttons={buttons} glowSize={5} />

}

export default function Activity(props) {
  let activity = useSelector(state => state.playful.viewSelected)
  let activityKey = activity.module + ' ' + activity.kind

  let [showSidebar, setShowSidebar] = useState(false);
  // let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)
  let onRepeat = useRef(()=>{})

  let halfMemoryPower = 7
  if(activity.kind==kinds.speed) halfMemoryPower = 70

  let SidebarPopUp = [
    <div className="sidemenu-kids" onClick={() => setShowSidebar(true)}
      style={{marginLeft: showSidebar ? '70%' : '97%', transition: 'margin-left .3s'}}>
      <Sidebar key={activityKey} {...{onRepeat, halfMemoryPower}}/>
    </div>,
    <div className="fa fa-2x fa-chevron-right"
      style={{position: 'absolute', zIndex: '2', right: '5px', transform: showSidebar ? '' : 'scaleX(-1)', transition: 'transform .15s'}}
      onClick={() => setShowSidebar(!showSidebar)} />
  ]

  // , repeat: repeatActivity, resetRepeat: resetRepeat
  // onRepeat: onRepeat
  return <>
    {/* <MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} /> */}
    {SidebarPopUp}
    <MemoryChalice {...{activityKey, halfMemoryPower, style:{
      bottom:'1%', width: '20%', zIndex:'1', right: showSidebar ? '5%' : '1%', transition: 'right .3s'
    }}}/>
    {
      media[activity.kind] ?
        React.cloneElement(media[activity.kind], {
          isActive:active=>{
            setShowSidebar(!active)
          }, 
          onRepeat, 
          activity
        })
      : <div>Coming Soon!</div>
    }
  </>
}

function MemoryChalice(props) {
  let power = useSelector(state => {
    let p = state.firebase.profile.power &&
      state.firebase.profile.power[state.playful.viewSelected.module]
    return p ? p.power : 0
  })
  let initialMP = useRef(power)
  useEffect(()=>{
    initialMP.current = power
  }, [props.activityKey])
  let MP = power - initialMP.current

  console.log(MP, initialMP.current, props.halfMemoryPower)

  // fill and match curve of cup
  let fractionHeight = MP*MP / (MP*MP + (props.halfMemoryPower))
  let fractionWidth = Math.pow(Math.max(.01, fractionHeight), .2)

  return <svg style={{position:'absolute', overflow:'visible', ...props.style}} viewBox='0 0 100 100' >
        <defs>
            <style>{`
            #MemoryPower {
              transition: transform 10s linear;
              transform-origin: 59% 90%;
              transform-box: fill-box;
              transform: scale(${fractionWidth}, ${fractionHeight});
            }
            `}</style>
        </defs>
        <Chalice style={{overflow:'visible'}} />
    </svg>
}