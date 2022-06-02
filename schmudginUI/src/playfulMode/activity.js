import React, { useState, useRef, useCallback, useEffect } from "react";
import { media } from "../activities/media";
import { ReactComponent as sidebarButtons } from './images/ActivitySideBarButtons.svg';
import sidebar from './images/ActivitySideBar.svg';
import { ReactComponent as Chalice } from './images/MemoryChalice.svg';
import {useTransition, animated, config as reactSpringConfig} from 'react-spring'
import { useMemoryResources } from "../common/hooks"

import { getKidKinds, kinds, valueAfter } from "../util";
import { useDispatch, useSelector } from "react-redux";
import { newView, playfulViews, getNextModule, pathFinished } from "./playfulReducer";
import SVGButtons from "./SVGButtons";
import { useParams, useHistory } from "react-router-dom";

function Sidebar(props) {
  let history = useHistory()
  let resources = useMemoryResources()
  // if current activity has index for path, then use alternate sidebar
  let { activityKind, module } = useParams()
  let activity = activityKind
  let path = history.location.state && history.location.state.adventurePath

  let nextModuleUrl = !resources ? history.location.pathname : `/activity/${activity}/${getNextModule(resources, activity, module)}`
  let nextActivityUrl = !resources ? history.location.pathname : `/activity/${valueAfter(getKidKinds(resources[module]), activity)}/${module}`
  let adventurePathUrl = `/adventurePath/${path}`

  // reroute Continue button if on adventure path
  let buttons = []
  if(path) {
    let curPath = {kind: activity, module, path}
    buttons = [
      {id: 'MemoryPalace', linkTo: '/map/palace', dispatch: pathFinished(curPath)},
      {id: 'NextVerse', linkTo: nextModuleUrl, dispatch: pathFinished(curPath)},
      {id: 'NextActivity', linkTo: nextActivityUrl, dispatch: pathFinished(curPath)},
      {id: 'Continue', linkTo: adventurePathUrl, dispatch: pathFinished(curPath)}
    ]

  } else {
    buttons = [
        {id: 'MemoryPalace', linkTo: '/map/palace'},
        {id: 'NextVerse', linkTo: nextModuleUrl},
        {id: 'NextActivity', linkTo: nextActivityUrl},
        {id: 'Continue', linkTo: nextModuleUrl}
    ]
  }

  return <SVGButtons svg={sidebarButtons} image={sidebar} buttons={buttons} aspectRatio={.45} glowSize={5} />
}

export default function Activity(props) {
  // let activity = useSelector(state => state.playful.viewSelected)
  let { activityKind, module } = useParams()
  let activityKey = module + ' ' + activityKind

  let [showSidebar, setShowSidebar] = useState(false);
  // let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)
  let onRepeat = useRef(()=>{})

  let halfMemoryPower = 7
  if(activityKind==kinds.speed) halfMemoryPower = 70

  // animate sidebar to slide in
  const transitions = useTransition(showSidebar, null, {
    from: { position: 'absolute', transform: 'translate3d(100%,0,0)' },
    enter: { transform: 'translate3d(0,0,0)' },
    leave: { transform: 'translate3d(100%,0,0)' },
  })

  let SidebarPopUp = <>
    {transitions.map( ({ item, key, props }) =>
      item && <animated.div key={key} style={props} className="sidemenu-kids" onClick={() => setShowSidebar(true)}>
        <Sidebar key={activityKey} adventurePath={props.adventurePath} {...{onRepeat, halfMemoryPower}}/>
      </animated.div>
    )}

    <div className="fa fa-2x fa-chevron-right"
      style={{position: 'absolute', zIndex: '2', right: '5px', transform: showSidebar ? '' : 'scaleX(-1)', transition: 'transform .15s'}}
      onClick={() => setShowSidebar(!showSidebar)} />
  </>

  return <>
    {SidebarPopUp}
    <MemoryChalice {...{activityKey, halfMemoryPower, 
    style:{
      right: showSidebar ? '5%' : '1%'
    }}} />
    <div className='activityContent'>
      {
        media[activityKind] ?
          React.cloneElement(media[activityKind], {
            isActive:active=>{
              setShowSidebar(!active)
            }, 
            onRepeat, 
            activity:{kind:activityKind, module:module}
          })
        : <div>Coming Soon!</div>
      }
    </div>
  </>
}

function MemoryChalice(props) {
  let { module } = useParams()
  let {activityKey, halfMemoryPower, ..._props} = props
  let power = useSelector(state => {
    let p = state.firebase.profile.power &&
      state.firebase.profile.power[module]
    return p ? p.power : 0
  })
  let initialMP = useRef(power)
  useEffect(()=>{
    initialMP.current = power
  }, [activityKey])
  let MP = power - initialMP.current

  // console.log(MP, initialMP.current, halfMemoryPower)

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