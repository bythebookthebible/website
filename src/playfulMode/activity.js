import React, { useState, useRef } from "react";
import { media } from "../activities/media";
import MemorizedPrompt from './memorizedPrompt'
import sidebarSVG from '../images/maps/ActivitySideBar1.svg';

// @TODO: 1) some contents are not implemented by the media yet
//        2) might want to add prev module and prev activity >> idea for later

import { ReactSVG } from "react-svg";

import $ from "jquery";
import { kinds } from "../util";
import { useDispatch, useSelector } from "react-redux";
import { newView, playfulViews, nextModule, nextActivity } from "./playfulReducer";

export function SVGRendor(props) {
    let dispatch = useDispatch()
    let MP = useSelector(state => {
      let p = state.firebase.profile.power &&
        state.firebase.profile.power[state.playful.viewSelected.module]
      return p ? p.power : 0
    })
    let defaultHalfMemoryPower = 50.0

    // console.log('powers', state.memoryPower[state.activity.key].power, props.initialMP)

    return <ReactSVG src={sidebarSVG} afterInjection={(err, svg) => {
        for (let button of props.buttons) {
            $("#" + button.id).click(() => {
                button.dispatch && dispatch(button.dispatch)
                button.onClick && button.onClick()
            });
        }
        let percentageHeight = MP*MP / (MP*MP + (props.halfMemoryPower || defaultHalfMemoryPower))
        let percentageWidth;
        // match curve of cup
        percentageWidth = Math.pow(Math.max(.01, percentageHeight), .3)

        $('#power').children().css({'transform-origin': '46% 83.6%', 'transform': 'scale(' +  percentageWidth + ', '+ percentageHeight + ')'})
        
    }}/>
}

export default function Activity(props) {
  let activity = useSelector(state => state.playful.viewSelected)
  let initialMP = useSelector(state => {
    let p = state.firebase.profile.power &&
      state.firebase.profile.power[state.playful.viewSelected.module]
    return p ? p.power : 0
  })


  let [showSidebar, setShowSidebar] = useState(false);
  // let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)
  let onRepeat = useRef(()=>{})

  let halfMemoryPower = 7
  if(activity.kind==kinds.speed) halfMemoryPower = 70

  function SidebarPopUp(props) {
    let icon = <i className="fa fa-2x fa-chevron-right" aria-hidden="true" />
    if (!props.show) {
      icon = <i className="fa fa-2x fa-chevron-left" aria-hidden="true" />
    }

    let sidebarLayout = <div>
      <SVGRendor initialMP={initialMP} key={activity.module + '' + activity.kind} src={sidebarSVG} buttons={[
        {id: 'castle', dispatch: newView({view:playfulViews.map, viewSelected:'palace'})},
        {id: 'repeat', onClick: ()=>onRepeat.current()},
        {id: 'verse', dispatch: nextModule()},
        {id: 'activity', dispatch: nextActivity()}
      ]} halfMemoryPower={halfMemoryPower} />
    </div>

    return <div>
      <div className="sidemenu-kids" style={(props.show)? {marginLeft: '70%'} : {marginLeft: '100%'}}>
        {sidebarLayout}
      </div>
      <div style={{position: 'absolute', zIndex: '2', right: '10px'}} onClick={() => setShowSidebar(!showSidebar)}>
        {icon}
      </div>
    </div>
  }

  // , repeat: repeatActivity, resetRepeat: resetRepeat
  // onRepeat: onRepeat
  return <>
    {/* <MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} /> */}
    <SidebarPopUp show={showSidebar} />
    {
      media[activity.kind] ?
        React.cloneElement(media[activity.kind], {
          isActive:active=>{
            console.log('active', showSidebar, active, showSidebar == active)
            setShowSidebar(!active)
          }, 
          onRepeat, 
          activity
        })
      : <div>Coming Soon!</div>
    }
  </>
}