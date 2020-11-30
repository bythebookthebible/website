import React, { useState, useRef, useCallback, useEffect } from "react";
import { media } from "../activities/media";
import { ReactComponent as sidebar } from './images/ActivitySideBar.svg';
import { ReactComponent as Chalice } from './images/MemoryChalice.svg';
import {useTransition, animated, config as reactSpringConfig} from 'react-spring'

import { kinds } from "../util";
import { useSelector } from "react-redux";
import { newView, playfulViews, nextModule, nextActivity, pathFinished } from "./playfulReducer";
import SVGButtons from "./SVGButtons";

function Sidebar(props) {
    // if current activity has index for path, then use alternate sidebar
    let activity = useSelector(state => state.playful.viewSelected)

    let buttons = [
        {id: 'MemoryPalace', dispatch: newView({view:playfulViews.map, viewSelected:'palace'})},
        // {id: 'PlayAgain', onClick: ()=>props.onRepeat.current()},
        {id: 'NextVerse', dispatch: nextModule},
        {id: 'NextActivity', dispatch: nextActivity},
    ]
    // reroute Continue button if on adventure path
    if(activity.index !== undefined) {
      buttons.push({id: 'Continue', dispatch: ()=>pathFinished(activity)})
    } else {
      buttons.push({id: 'Continue', dispatch: nextModule})
    }

    return <SVGButtons svg={sidebar} buttons={buttons} aspectRatio={.45} glowSize={5} />

}

export default function Activity(props) {
  let activity = useSelector(state => state.playful.viewSelected)
  let activityKey = activity.module + ' ' + activity.kind

  let [showSidebar, setShowSidebar] = useState(false);
  // let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)
  let onRepeat = useRef(()=>{})

  let halfMemoryPower = 7
  if(activity.kind==kinds.speed) halfMemoryPower = 70

  // animate sidebar to slide in
  const transitions = useTransition(showSidebar, null, {
    from: { position: 'absolute', transform: 'translate3d(100%,0,0)' },
    enter: { transform: 'translate3d(0,0,0)' },
    leave: { transform: 'translate3d(100%,0,0)' },
    config: reactSpringConfig.gentle,
  })

  let SidebarPopUp = <>
    {transitions.map( ({ item, key, props }) =>
      item && <animated.div key={key} style={props} className="sidemenu-kids" onClick={() => setShowSidebar(true)}>
        <Sidebar key={activityKey} {...{onRepeat, halfMemoryPower}}/>
      </animated.div>
    )}

    <div className="fa fa-2x fa-chevron-right"
      style={{position: 'absolute', zIndex: '2', right: '5px', transform: showSidebar ? '' : 'scaleX(-1)', transition: 'transform .15s'}}
      onClick={() => setShowSidebar(!showSidebar)} />
  </>

  // , repeat: repeatActivity, resetRepeat: resetRepeat
  // onRepeat: onRepeat
  return <>
    {/* <MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} /> */}
    {SidebarPopUp}
    <MemoryChalice {...{activityKey, halfMemoryPower, 
    style:{
      right: showSidebar ? '5%' : '1%'
    }}} />
    <div className='activityContent'>
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
    </div>
  </>
}

function MemoryChalice(props) {
  let {activityKey, halfMemoryPower, ..._props} = props
  let power = useSelector(state => {
    let p = state.firebase.profile.power &&
      state.firebase.profile.power[state.playful.viewSelected.module]
    return p ? p.power : 0
  })
  let initialMP = useRef(power)
  useEffect(()=>{
    initialMP.current = power
  }, [activityKey])
  let MP = power - initialMP.current

  console.log(MP, initialMP.current, halfMemoryPower)

  // fill and match curve of cup
  let fractionHeight = MP*MP / (MP*MP + (halfMemoryPower))
  let fractionWidth = Math.pow(Math.max(.01, fractionHeight), .2)

  return <svg className='memoryChalice' {..._props} viewBox='0 0 100 100' >
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