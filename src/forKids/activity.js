import React, { useState, useContext, useRef } from "react";
import { media } from "./media";
import { DispatchContext, StateContext } from "./kidModeApp"
import MemorizedPrompt from './memorizedPrompt'
import './colorPalette.css'
import { actionTypes, actionViews } from './kidModeApp';
import sidebarSVG from '../images/maps/ActivitySideBar1.svg';

// @TODO: 1) some contents are not implemented by the media yet
//        2) might want to add prev module and prev activity >> idea for later

import { ReactSVG } from "react-svg";

import $ from "jquery";
import { kinds } from "../util";

export function SVGRendor(props) {
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext);
    let defaultHalfMemoryPower = 50.0

    // console.log('powers', state.memoryPower[state.activity.key].power, props.initialMP)

    return <ReactSVG src={sidebarSVG} afterInjection={(err, svg) => {
        for (let button of props.buttons) {
            $("#" + button.id).click(() => {
                button.dispatch && dispatch(button.dispatch)
                button.onClick && button.onClick()
            });
        }
        let MP = (state.memoryPower[state.activity.key].power - (props.initialMP || 0))
        let percentageHeight = MP*MP / (MP*MP + (props.halfMemoryPower || defaultHalfMemoryPower))
        let percentageWidth;
        // match curve of cup
        percentageWidth = Math.pow(Math.max(.01, percentageHeight), .3)

        $('#power').children().css({'transform-origin': '46% 83.6%', 'transform': 'scale(' +  percentageWidth + ', '+ percentageHeight + ')'})
        
    }}/>
}

export default function Activity(props) {
  let dispatch = useContext(DispatchContext)
  let state = useContext(StateContext)
  let [showSidebar, setShowSidebar] = useState(false);
  let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)
  // if(! state.resources) return null
  let repeatHandler = useRef(()=>{})
      
  let [initialMP] = useState(state.memoryPower[state.activity.key].power)

  let halfMemoryPower=0.7
  if(state.activity.kind==kinds.watch ||
    state.activity.kind==kinds.karaoke ||
    state.activity.kind==kinds.dance ||
    state.activity.kind==kinds.echo ||
    state.activity.kind==kinds.joSchmo) halfMemoryPower = 7
  else if(state.activity.kind==kinds.speed) halfMemoryPower = 70

  function SidebarPopUp(props) {
    let icon = <i class="fa fa-2x fa-chevron-right" aria-hidden="true"></i>
    if (!props.show) {
      icon = <i class="fa fa-2x fa-chevron-left" aria-hidden="true"></i>
    }
    
    let sidebarLayout = <div>
      <SVGRendor initialMP={initialMP} key={state.activity.key + '' + state.activity.kind} src={sidebarSVG} buttons={[
        {id: 'castle', dispatch: {type:actionTypes.newView, view:actionViews.map, viewSelected:'palace'}},
        {id: 'repeat', onClick: ()=>repeatHandler.current()},
        {id: 'verse', dispatch: {type:actionTypes.nextModule}},
        {id: 'activity', dispatch: {type:actionTypes.nextActivity}}
      ]} halfMemoryPower={halfMemoryPower} />
    </div>

    return <div>
      <div className="sidemenu-kids" style={(props.show)? {marginLeft: '70%'} : {marginLeft: '100%'}}>
        {sidebarLayout}
      </div>
      <div style={{position: 'absolute', zIndex: '2', right: '10px'}} onClick={() => props.setShow()}>
        {icon}
      </div>
    </div>
  }

  // , repeat: repeatActivity, resetRepeat: resetRepeat
  // repeatHandler: repeatHandler
  return <>
    <MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />
    <SidebarPopUp setShow={()=>setShowSidebar(!showSidebar)} show={showSidebar} />
    {
      media[state.activity.kind] ?
        React.cloneElement(media[state.activity.kind], {isActive:active=>{
          if(!showSidebar == !active) setShowSidebar(!active)
        }, repeatHandler: repeatHandler})
      : <div>Coming Soon!</div>
    }
  </>
}