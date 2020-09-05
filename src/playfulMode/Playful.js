import React from 'react'
import Activity from './activity'
import { Spinner } from 'react-bootstrap'
import MemoryPalaceView from './memoryPalaceView'

import Maps from './maps'
import ModuleSelector from './ModuleSelector'
import { useDispatch, useSelector } from 'react-redux'
import { playfulViews, back, newView } from './playfulReducer'
import { useMemoryResources } from '../hooks'
import mapIcon from '../images/nav/MapIcon.png'

export default function Playful(props) {
  let dispatch = useDispatch()
  let resources = useMemoryResources()
  let view = useSelector(state => state.playful.view)
  let viewSelected = useSelector(state => state.playful.viewSelected)

  let content = <div className='text-center pt-3'>
    <Spinner animation="border" role="status" size="md" />
    <h1 className='d-inline-block'>Loading...</h1>
  </div>
  
  if(view == 'map') content = Maps[viewSelected]
  if(resources) {
    if(view == 'moduleSelector') content = ModuleSelector[viewSelected]
    if(view == 'palace') content = <MemoryPalaceView />
    if(view == 'activity') content = <Activity />
  }

  if(!content) {
    content = <h1>Oops...</h1>
    setTimeout(() => {
      dispatch(newView({view:playfulViews.default}))
    }, 1000);
  }

  let PlayfulNav = <div className='secondaryNav backButton' style={{display:'flex'}}>
    <div className='fas fa-reply fa-flip-vertical' aria-hidden="true" style={{fontSize:'2rem'}}
      onClick={() => dispatch(back())} />
    <img src={mapIcon} style={{height:'2rem'}} onClick={() => dispatch(newView({view:playfulViews.default}))} />
  </div>

  return <>
    {PlayfulNav}
    {content}
  </>
}
