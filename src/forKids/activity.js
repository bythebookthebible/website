import React, { useState, useContext } from "react";
import {
  Row,
  Col,
  Button,
  Modal,
} from "react-bootstrap";
import { media } from "./media";
import ButtonMap from './buttonMap';
import { Player, MenuButton } from "video-react";
import { DispatchContext, StateContext } from "./kidModeApp"
import MemorizedPrompt from './memorizedPrompt'
import ModulePedestal from "./modulePedestal"
import ReallyBadPedestal from '../images/memoryPalace/ReallyBadPedestal.svg'
// import AdultModeApp from "../forAdults/adultModeApp"
// import MenuContainer from "../forAdults/menuContainer";
import './colorPalette.css'
import repeat from '../images/kidsPageSidebar/repeat.png';
import tree from '../images/kidsPageSidebar/tree.png';
import map from '../images/kidsPageSidebar/map.png';
import deeper from '../images/kidsPageSidebar/deeper.png';
import wider from '../images/kidsPageSidebar/wider.png';
import test_cp from '../images/coloringPages/test_cp.svg';
import diamond from '../images/kidsPageSidebar/diamond.png';
import back from '../images/kidsPageSidebar/back.png';
import { actionTypes, actionViews } from './kidModeApp';
import { kinds } from '../util'
import sidebarSVG from '../images/maps/ActivitySideBar1.svg';
import testMap from '../images/maps/TestTree.svg';
import open from '../images/kidsPageSidebar/open.png';
import close from '../images/kidsPageSidebar/close.png';

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
        let MP = state.memoryPower[state.activity.key]
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


export default function Activity(props) {
  // let dispatch = useContext(DispatchContext)
  let state = useContext(StateContext)
  let [showSidebar, setShowSidebar] = useState(false);
  let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)

  // if(! state.resources) return null

  return <div>
    <MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />
    <SidebarPopUp sidebarLayout={()=>SidebarLayout({halfMemoryPower:50})} setShow={()=>setShowSidebar(!showSidebar)} show={showSidebar} />
    {media[state.activity.kind] ? 
      <div onClick={() => setShowSidebar(false)}>{media[state.activity.kind]({doneCallback:()=>setShowSidebar(true)})}</div> :
      <div>Coming Soon!</div>
    }
  </div>
}

let SidebarLayout = props => {
  let dispatch = useContext(DispatchContext)
  let state = useContext(StateContext)

return <div>
<SVGRendor src={sidebarSVG} buttons={[
  {id: 'castle', dispatch: {type:actionTypes.newView, view:actionViews.map, viewSelected:'palace'}},
  {id: 'repeat', dispatch: {type:actionTypes.nextActivity}},
  {id: 'verse', dispatch: {type:actionTypes.nextModule}},
  {id: 'activity', dispatch: {type:actionTypes.nextActivity}}
]} halfMemoryPower={props.halfMemoryPower} />
</div>
}

function SidebarPopUp(props) {
  let icon = <i class="fa fa-2x fa-chevron-right" aria-hidden="true"></i>
  if (!props.show) {
    icon = <i class="fa fa-2x fa-chevron-left" aria-hidden="true"></i>
  }
  return <div>
    {/* <Row>
      <Col lg={9} xl={9}> */}
        <div className="sidemenu-kids" style={(props.show)? {marginLeft: '70%'} : {marginLeft: '100%'}}>
        {props.sidebarLayout()}
        </div>
    <div style={{position: 'absolute', zIndex: '2', right: '10px'}} onClick={() => props.setShow()}>
      {/* <Button style={{position: 'absolute', zIndex: '2', right: '0'}} onClick={() => props.setShow()}><img src={diamond} style={{height: '20px', width: '20px'}}/></Button> */}
      {/* <img src={icon} style={{height: '20px', width: '20px'}}/> */}
      {icon}
    </div>
  </div>
}

// function SidebarPopUp(props) {
//     return <div>
//         <Row>
//         <Col lg={9} xl={9}>
//             <div className="sidemenu-kids" style={(props.show)? {marginLeft: '70%'} : {marginLeft: '100%'}}>
//                 <Button className="btnn" variant="primary" onClick={() => props.setShow()} ><img src={back} style={{height: '30px', width: '30px'}}/>   Close</Button>
//                 {props.sidebarLayout()}
//             </div>
//         </Col> 
//         </Row>
//         <div style={{textAlign: 'left'}}>
//             <Button className='btnn-display' onClick={() => props.setShow()}><img src={diamond} style={{height: '50px', width: '60px'}}/>   Click Me   </Button>
//         </div>
//     </div>
// }

// let SidebarLayout = props => {
//   let dispatch = useContext(DispatchContext)
//   let state = useContext(StateContext)

//   return <div className='sidebar-layout'>
//     <Button className="btnn" variant="primary" onClick={() => {}}><img src={repeat} style={{height: '30px', width: '30px'}}/>   Repeat</Button>
//     <Button className="btnn" variant="primary" onClick={() => dispatch({type:actionTypes.nextModule})}><img src={wider} style={{height: '30px', width: '30px'}}/>   Go Wider!</Button>
//     <Button className="btnn" variant="primary" onClick={() => dispatch({type:actionTypes.nextActivity})}><img src={deeper} style={{height: '30px', width: '30px'}}/>   Go Deeper!</Button>
//     <Button className="btnn" variant="primary" onClick={() => dispatch({type:'newView', view:'map', viewSelected:'tree'})}><img src={tree} style={{height: '30px', width: '30px'}}/>   Back to Tree</Button>
//     <Button className="btnn" variant="primary" onClick={() => dispatch({type:actionTypes.newView, view:actionViews.map, viewSelected:'palace'})}><img src={map} style={{height: '30px', width: '30px'}}/>   Back to Map</Button>
//     <ModulePedestal src={ReallyBadPedestal} halfMemoryPower={props.halfMemoryPower} />
//     </div>
// }

// function SidebarPopUp(props) {
//     return <div>
//         <Row>
//         <Col lg={9} xl={9}>
//             <div className="sidemenu-kids" style={(props.show)? {marginLeft: '70%'} : {marginLeft: '100%'}}>
//                 <Button className="btnn" variant="primary" onClick={() => props.setShow()} ><img src={back} style={{height: '30px', width: '30px'}}/>   Close</Button>
//                 {props.sidebarLayout()}
//             </div>
//         </Col> 
//         </Row>
//         <div style={{textAlign: 'left'}}>
//             <Button className='btnn-display' onClick={() => props.setShow()}><img src={diamond} style={{height: '50px', width: '60px'}}/>   Click Me   </Button>
//         </div>
//     </div>
// }