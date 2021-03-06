import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import $ from 'jquery'
import './adventurePath.scss'

import { valueAfter, getModulesForPath, getPathActivities } from '../../util'
import { useMemoryResources } from "../../common/hooks"
import { newView, playfulViews } from "../playfulReducer"

import JamesBackground from './images/JamesPathBackground.png'
import JamesCurrent from './images/rocketShip.svg'
import JamesMarker from './images/sparklestone.svg'
import popupBubble from './images/speechBubble.svg'
import lock from '../images/Lock.svg'
import { AbsoluteCentered } from "../../common/components"

export default function AdventurePath(props) {
  let dispatch = useDispatch()
  let resources = useMemoryResources()
  let path = useSelector(state => state.playful.viewSelected)
  let modules = getModulesForPath(resources, path)
  let progress = useSelector(state => {
    let p = state.firebase.profile
    return (p && p.paths && p.paths[path])
  })

  // activity identities for each star
  let activities = modules.reduce(
    (a, module) => [...a, ...getPathActivities(resources, module).map(
        (kind, index) => {return {path, module, kind, index}}
      )]
  , [])
  
  // mark index of current progress
  let nextIndex
  if(progress) {
    let lastActivity = {path, module:progress.module, index:progress.index, kind:getPathActivities(resources, progress.module)[progress.index]}
    let validActivities = activities.filter(a => a.module < progress.module || (a.module == progress.module && a.index <= progress.index + 1))
    nextIndex = validActivities.length
  } else {
    nextIndex = 0
  }

  // scroll to be centered on next item
  useEffect(() => {
    setTimeout(() => 
      nextIndex && $('.playfulFrame').animate({scrollLeft: 3+nextIndex*16*6 - window.innerWidth/2}, 1200)
    , 500)
  }, [nextIndex])

  return <div className='adventurePath' style={{backgroundImage:`url(${JamesBackground})`, width:`${activities.length*6}rem`}}>
    {activities.map((a, i) => {
      // click dispatches activity conditioned on 
      
      let locked = !!resources[a.module].lock
      let clickable = i <= nextIndex && !locked
      let onClick = !clickable ? () => null : () => dispatch(newView({view:playfulViews.activity, viewSelected:a}))
      
      return <div className='steppingSpot' key={`${a.module}-${a.kind}`}
      style={{left:`${6*i+3}rem`}} disabled={!clickable} >
        {/* Star */}
          <img src={JamesMarker} className={a.index==0?'major':'minor'} onClick={onClick} />
        {/* Rocket */}
        {i == nextIndex && 
          <img src={JamesCurrent} className='current' onClick={onClick} />
        }
        {/* Lock */}
        {locked && <img src={lock} className='lock' />}        
      </div>
    })}
  </div>
}