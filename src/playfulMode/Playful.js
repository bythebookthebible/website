import React, { useEffect } from 'react'
import Activity from './activity'
import { Spinner } from '../common/components'
import MemoryPalaceView from './memoryPalaceView'

import Maps from './maps/maps'
import ModuleSelector from './moduleSelector/ModuleSelector'
import { useDispatch, useSelector } from 'react-redux'
import { playfulViews, back, newView } from './playfulReducer'
import { useMemoryResources } from '../common/hooks'
import mapIcon from './images/MapIcon.png'
import AdventurePath from './adventurePath/adventurePath'

export default function Playful(props) {
  let dispatch = useDispatch()
  let resources = useMemoryResources()
  let view = useSelector(state => state.playful.view)
  let viewSelected = useSelector(state => state.playful.viewSelected)

  let content = <Spinner />
  
  if(view == playfulViews.map) content = Maps[viewSelected]
  if(resources) {
    if(view == playfulViews.moduleSelector) content = ModuleSelector[viewSelected]
    if(view == playfulViews.palace) content = <MemoryPalaceView />
    if(view == playfulViews.adventurePath) content = <AdventurePath />
    if(view == playfulViews.activity) content = <Activity />
  }

  if(!content) {
    content = <h1>Oops...</h1>
    setTimeout(() => {
      dispatch(newView({view:playfulViews.default}))
    }, 1000);
  }

  let navButtons = [
    {
      key:'mainMap', 
      content: <img className='mx-1 mt-1' src={mapIcon} style={{height:'2rem'}} />, 
      onClick: () => dispatch(newView({view:playfulViews.default})),
    },
    {
      key:'back', 
      content: <i className='fas fa-reply fa-flip-vertical mx-2 mt-1'  aria-hidden="true" style={{fontSize:'2rem', color:'var(--primary)'}} />, 
      onClick: () => dispatch(back()),
    },
  ]
  
  useEffect(() => {
    let setNavButtons = props.setNavButtons.current
    setNavButtons({owner:'PlayfulMode', navButtons})
    return () => {
      setNavButtons({owner:'PlayfulMode', navButtons:[]})
    }
  }, [])


  // let PlayfulNav = <div className='secondaryNav' style={{display:'flex'}}>
  //   <div className='fas fa-reply fa-flip-vertical' aria-hidden="true" style={{fontSize:'2rem'}}
  //     onClick={() => dispatch(back())} />
  //   <img src={mapIcon} style={{height:'2rem'}} onClick={() => dispatch(newView({view:playfulViews.default}))} />
  // </div>

  return content
}