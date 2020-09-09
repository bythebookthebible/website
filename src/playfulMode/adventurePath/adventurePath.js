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
    nextIndex = valueAfter(activities, lastActivity, 1, true)
  } else {
    nextIndex = 0
  }

  // scroll to be centered on next item
  useEffect(() => {
    setTimeout(() => 
      nextIndex && $('.body').animate({scrollLeft: 3+nextIndex*16*6 - window.innerWidth/2}, 1200)
    , 500)
  }, [nextIndex])

  return <div className='adventurePath' style={{backgroundImage:`url(${JamesBackground})`, width:`${activities.length*6}rem`}}>
    {activities.map((a, i) => {
      let onClick = () => dispatch(newView({view:playfulViews.activity, viewSelected:a}))

      return <div className='steppingSpot' key={`${a.module}-${a.kind}`}
      style={{left:`${6*i+3}rem`}} disabled={i > nextIndex} >
        <AbsoluteCentered style={{height:`${a.index==0?9:6}rem`}}>
          <img src={JamesMarker} onClick={i > nextIndex ?  () => null : onClick} />
        </AbsoluteCentered>
        {i == nextIndex && <AbsoluteCentered style={{height:'5rem'}}>
            <img src={JamesCurrent} onClick={onClick} />
        </AbsoluteCentered>}
      </div>
    })}
  </div>
}