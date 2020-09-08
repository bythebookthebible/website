import React from "react"

import { valueAfter, getModulesForPath, getPathActivities } from '../../util'
import { useMemoryResources } from "../../common/hooks"
import { useDispatch, useSelector } from "react-redux"
import { newView, playfulViews } from "../playfulReducer"

import JamesBackground from './images/JamesPathBackground.png'
import JamesCurrent from './images/rocketShip.svg'
import JamesMarker from './images/sparklestone.svg'
import popupBubble from './images/speechBubble.svg'

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

  return <div className='adventurePath' style={{height:'100%', backgroundSize:'cover', backgroundImage:`url(${JamesBackground})`}}>
    {activities.map((a, i) => {
      let onClick = () => dispatch(newView({view:playfulViews.activity, viewSelected:a}))

      return <div key={`${a.module}-${a.kind}`} style={{position:'absolute', top:'50%', marginTop:'-3rem', height:'6rem', left:`${6*i+2}rem`}}>
        <img src={JamesMarker} style={{height:`${a.index==0?9:6}rem`}}
          onClick={i > nextIndex ?  () => null : onClick} />
        {i == nextIndex && 
          <img src={JamesCurrent} style={{height:'4rem'}} onClick={onClick} />
        }
      </div>
    })}
  </div>
}