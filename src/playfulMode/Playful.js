import React, { useEffect } from 'react'
import Activity from './activity'
import { LoadingPage, AbsoluteCentered} from '../common/components'
import MemoryPalaceView from './memoryPalaceView'
import './playful.scss'

import { Map } from './maps/maps'
import ModuleSelector from './moduleSelector/ModuleSelector'
import { useDispatch, useSelector } from 'react-redux'
import { useMemoryResources } from '../common/hooks'
import mapIcon from './images/MapIcon.png'
import AdventurePath from './adventurePath/adventurePath'
import { SizeMe } from 'react-sizeme'
import {defaultAspectRatio} from './SVGButtons'
import {
  Switch,
  Route,
  Link,
  useParams,
  useHistory,
} from "react-router-dom";

export default function Playful(props) {
  let resources = useMemoryResources()
  let history = useHistory()
  
  // Set nav buttons (at the top)
  useEffect(() => {
    let navButtons = [
      {
        key:'mainMap', 
        content: <Link to='/'><img className='mx-1 mt-1' src={mapIcon} style={{height:'2rem'}} /></Link>, 
      },
      {
        key:'back', 
        content: <i className='fas fa-reply fa-flip-vertical mx-2 mt-1'  aria-hidden="true" style={{fontSize:'2rem', color:'var(--primary)'}} />, 
        onClick: history.goBack,
      },
    ]

    let setNavButtons = props.setNavButtons.current
    setNavButtons({owner:'PlayfulMode', navButtons})
    return () => {
      setNavButtons({owner:'PlayfulMode', navButtons:[]})
    }
  }, [props.setNavButtons, history])

  // emulate landscape lock
  useEffect(() => {
    if("orientation" in window.screen)
      window.screen.orientation.lock('landscape')
  }, [])

  if(!resources) return <PlayfulFrame><LoadingPage /></PlayfulFrame>

  return <PlayfulFrame>
    <Switch>
      <Route exact path='/'><Map default /></Route>
      <Route path='/map/:viewSelected'><Map /></Route>
      <Route path='/moduleSelector/:viewSelected'><ModuleSelector /></Route>
      <Route path='/palace/:viewSelected'><MemoryPalaceView /></Route>
      <Route path='/activity/:activityKind/:module'><Activity /></Route>
      <Route path='/adventurePath/:path'><AdventurePath /></Route>
      {/* <Route path='/'><h1>Oops...</h1>{ setTimeout(() => {history.replace('/')}, 2000) }</Route> */}
    </Switch>
  </PlayfulFrame>
}

function PlayfulFrame(props) {
  let aspectratio = defaultAspectRatio

  return <SizeMe monitorHeight>
    {({size}) => {
      let width = Math.min(size.width, size.height * aspectratio)
      let height = Math.min(size.height, size.width / aspectratio)
      let left = (size.width - width) / 2
      let top = (size.height - height) / 2

      return <div className="playfulBackground">
        <div className={`playfulFrame`} style={{width, height, top, left}}>
          {props.children}
        </div>
      </div>  
    }}
  </SizeMe>
}
