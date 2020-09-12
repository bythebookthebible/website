import React, { useState, useRef } from "react";
import { media } from "../activities/media";
import MemorizedPrompt from './memorizedPrompt'
import { ReactComponent as sidebar } from './images/ActivitySideBar.svg';

import $ from "jquery";
import { kinds } from "../util";
import { useSelector } from "react-redux";
import { newView, playfulViews, nextModule, nextActivity, pathFinished } from "./playfulReducer";
import SVGButtons from "./SVGButtons";

function Sidebar(props) {
    let MP = useSelector(state => {
      let p = state.firebase.profile.power &&
        state.firebase.profile.power[state.playful.viewSelected.module]
      return p ? p.power : 0
    })
    MP -= props.initialMP

    // fill and match curve of cup
    let percentageHeight = MP*MP / (MP*MP + (props.halfMemoryPower))
    let percentageWidth = Math.pow(Math.max(.01, percentageHeight), .3)

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

    return <SVGButtons svg={sidebar} width={.3} buttons={buttons} glowSize={5}
      extra={() => $('#power').children().css({
        'transform-origin': '46% 83.6%',
        'transform': 'scale(' +  percentageWidth + ', '+ percentageHeight + ')'
      })}
    />

}

export default function Activity(props) {
  let activity = useSelector(state => state.playful.viewSelected)
  let activityKey = activity.module + ' ' + activity.kind
  let MP = useSelector(state => {
    let p = state.firebase.profile.power &&
      state.firebase.profile.power[state.playful.viewSelected.module]
    return p ? p.power : 0
  })
  let initialMP = useRef(MP).current


  let [showSidebar, setShowSidebar] = useState(false);
  // let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)
  let onRepeat = useRef(()=>{})

  let halfMemoryPower = 7
  if(activity.kind==kinds.speed) halfMemoryPower = 70

  function SidebarPopUp(props) {
    let icon = <i className="fa fa-2x fa-chevron-right" aria-hidden="true" />
    if (!props.show) {
      icon = <i className="fa fa-2x fa-chevron-left" aria-hidden="true" />
    }

    return <div>
      <div className="sidemenu-kids" onClick={() => setShowSidebar(true)}
        style={{marginLeft: props.show ? '70%' : '97%', transition: 'marginLeft .5s'}}>
        <Sidebar initialMP={initialMP} key={activityKey} onRepeat={onRepeat} />
      </div>
      <div style={{position: 'absolute', zIndex: '2', right: '5px'}} onClick={() => setShowSidebar(!showSidebar)}>
        {icon}
      </div>
    </div>
  }

  // , repeat: repeatActivity, resetRepeat: resetRepeat
  // onRepeat: onRepeat
  return <>
    {/* <MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} /> */}
    <SidebarPopUp show={showSidebar} />
    {
      media[activity.kind] ?
        React.cloneElement(media[activity.kind], {
          isActive:active=>{
            console.log('active', showSidebar, active, showSidebar == active)
            setShowSidebar(!active)
          }, 
          onRepeat, 
          activity
        })
      : <div>Coming Soon!</div>
    }
  </>
}