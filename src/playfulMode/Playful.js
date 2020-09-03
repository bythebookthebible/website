import React from 'react'
import Activity from './activity'
import { Spinner } from 'react-bootstrap'
// import MemoryPowerView from './memoryPalaceView'

import Maps from './maps'
import ModuleSelector from './ModuleSelector'
import { useDispatch, useSelector } from 'react-redux'
import { useFirestoreConnect } from 'react-redux-firebase'
import { playfulViews, back, newView } from './playfulReducer'
import { useMemoryResources } from '../hooks'

export default function Playful(props) {
  let dispatch = useDispatch()
  let resources = useMemoryResources()
  let view = useSelector(state => state.playful.view)
  let viewSelected = useSelector(state => state.playful.viewSelected)

  let showMemoryPrompt = false // useSelector(state => Object.values(state.power).filter(p => p.power > 100).length > 0)

  let content = <div className='text-center pt-3'>
    <Spinner animation="border" role="status" size="md" />
    <h1 className='d-inline-block'>Loading...</h1>
  </div>
  
  if(view == 'map') content = Maps[viewSelected]
  if(resources) {
    if(view == 'moduleSelector') content = ModuleSelector[viewSelected]
    // if(view == 'palace') content = <MemoryPowerView showMemoryPrompt={showMemoryPrompt} />
    if(view == 'activity') content = <Activity showMemoryPrompt={showMemoryPrompt} />
  }

  if(!content) {
    content = <h1>Oops...</h1>
    setTimeout(() => {
      dispatch(newView({view:playfulViews.default}))
    }, 1000);
  }

  return <>
    <div className='fas fa-3x fa-reply fa-flip-vertical backButton' aria-hidden="true" 
        onClick={() => dispatch(back())} />
    {content}
  </>
}
