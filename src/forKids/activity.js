import React, { useState, useContext, useRef } from "react";
import { media } from "./media";
import { DispatchContext, StateContext } from "./kidModeApp"
import MemorizedPrompt from './memorizedPrompt'
import './colorPalette.css'
import { actionTypes, actionViews } from './kidModeApp';
import sidebarSVG from '../images/maps/ActivitySideBar1.svg';

// @TODO: 1) some contents are not implemented by the media yet
//        2) might want to add prev module and prev activity >> idea for later
// 
// note: i am filtering out some activities, passing only the implemented thru the media rn

import { ReactSVG } from "react-svg";

import $ from "jquery";


export function SVGRendor(props) {
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext);
    let defaultHalfMemoryPower = 50.0

    return <ReactSVG src={sidebarSVG} afterInjection={(err, svg) => {
        for (let button of props.buttons) {
            $("#" + button.id).click(() => {
                button.dispatch && dispatch(button.dispatch)
                button.onClick && button.onClick()
            });
        }
        let MP = state.memoryPower[state.activity.key].power
        let percentageHeight = MP / (MP + (props.halfMemoryPower || defaultHalfMemoryPower))
        let square;
        let percentageWidth;
        if (MP <= 15) {
          percentageWidth= percentageHeight + 0.3
        } else if (MP <= 15) {
          percentageWidth= percentageHeight + 0.39
        } else if (MP <= 25) {
          square = -2.171550024 * Math.pow(percentageHeight, 2)
          percentageWidth = square + 2.683222598 * percentageHeight + 0.0631248262 
        } else if (MP <= 75) {
          // smaller
          square = -2.3 * Math.pow(percentageHeight, 2)
          percentageWidth = square + 2.683222598 * percentageHeight + 0.0631248262 
        } else if (MP <= 110) {
          square = -2.171550024 * Math.pow(percentageHeight, 2)
          percentageWidth = square + 2.683222598 * percentageHeight + 0.0631248262 
        } else if (MP <= 132) {
          // bigger
          square = -2.1 * Math.pow(percentageHeight, 2)
          percentageWidth = square + 2.683222598 * percentageHeight + 0.0631248262 
        } else if (MP<= 210) {
          square = -2.001550024 * Math.pow(percentageHeight, 2)
          percentageWidth = square + 2.683222598 * percentageHeight + 0.0631248262 
        } else if (MP<= 240) {
          percentageWidth= percentageHeight + 0.14
        } else {
          percentageWidth= percentageHeight + 0.1
        }

        $('#power').children().css({'transform-origin': '46% 83.6%', 'transform': 'scale(' +  percentageWidth + ', '+ percentageHeight + ')'})
        
    }}/>
}

let halfMemoryPower=50
export default function Activity(props) {
  let dispatch = useContext(DispatchContext)
  let state = useContext(StateContext)
  let [showSidebar, setShowSidebar] = useState(false);
  let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)
  // if(! state.resources) return null
  let repeatHandler = useRef(()=>{})
  // let repeatActivity = useRef(false)

  // function repeatHandler(props) {
  //   repeatActivity.current = true
  // }
  // function resetRepeat(props) {
  //   repeatActivity.current = false
  // }

  function SidebarPopUp(props) {
    let icon = <i class="fa fa-2x fa-chevron-right" aria-hidden="true"></i>
    if (!props.show) {
      icon = <i class="fa fa-2x fa-chevron-left" aria-hidden="true"></i>
    }
    
    let sidebarLayout = <div>
      <SVGRendor src={sidebarSVG} buttons={[
        {id: 'castle', dispatch: {type:actionTypes.newView, view:actionViews.map, viewSelected:'palace'}},
        {id: 'repeat', onClick: ()=>repeatHandler.current()},
        {id: 'verse', dispatch: {type:actionTypes.nextModule}},
        {id: 'activity', dispatch: {type:actionTypes.nextActivity}}
      ]} halfMemoryPower={halfMemoryPower} />
    </div>

    return <div>
      {/* <Row>
        <Col lg={9} xl={9}> */}
          <div className="sidemenu-kids" style={(props.show)? {marginLeft: '70%'} : {marginLeft: '100%'}}>
          {sidebarLayout}
          </div>
      <div style={{position: 'absolute', zIndex: '2', right: '10px'}} onClick={() => props.setShow()}>
        {/* <Button style={{position: 'absolute', zIndex: '2', right: '0'}} onClick={() => props.setShow()}><img src={diamond} style={{height: '20px', width: '20px'}}/></Button> */}
        {/* <img src={icon} style={{height: '20px', width: '20px'}}/> */}
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