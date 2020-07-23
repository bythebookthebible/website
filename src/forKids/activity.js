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


// @TODO: 1) some contents are not implemented by the media yet
//        2) might want to add prev module and prev activity >> idea for later
// 
// note: i am filtering out some activities, passing only the implemented thru the media rn
export default function Activity(props) {
  // let dispatch = useContext(DispatchContext)
  let state = useContext(StateContext)
  let [showSidebar, setShowSidebar] = useState(true);
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

// let SidebarLayout = props => {
//   let dispatch = useContext(DispatchContext)
//   let state = useContext(StateContext)


// }

// function SidebarPopUp(props) {
//   return <div>
//     <Row>
//       <Col lg={9} xl={9}>
//         <div className="sidemenu-kids" style={(props.show)? {marginLeft: '70%'} : {marginLeft: '100%'}}>
//           {sidebarLayout()}
//         </div>
//       </Col>
//     </Row>
//     <div style={{textAlign: 'left'}}>
//       <Button className='btnn-display' onClick={() => props.setShow()}><img src={diamond} style={{height: '50px', width: '60px'}}/>   Click Me   </Button>
//     </div>
//   </div>
// }

let SidebarLayout = props => {
  let dispatch = useContext(DispatchContext)
  let state = useContext(StateContext)

  return <div className='sidebar-layout'>
    <Button className="btnn" variant="primary" onClick={() => {}}><img src={repeat} style={{height: '30px', width: '30px'}}/>   Repeat</Button>
    <Button className="btnn" variant="primary" onClick={() => dispatch({type:'nextModule'})}><img src={wider} style={{height: '30px', width: '30px'}}/>   Go Wider!</Button>
    <Button className="btnn" variant="primary" onClick={() => dispatch({type:'nextActivity'})}><img src={deeper} style={{height: '30px', width: '30px'}}/>   Go Deeper!</Button>
    <Button className="btnn" variant="primary" onClick={() => dispatch({type:'newView', view:'map', viewSelected:'tree'})}><img src={tree} style={{height: '30px', width: '30px'}}/>   Back to Tree</Button>
    <Button className="btnn" variant="primary" onClick={() => dispatch({type:'newView', view:'map', viewSelected:'home'})}><img src={map} style={{height: '30px', width: '30px'}}/>   Back to Map</Button>
    <ModulePedestal src={ReallyBadPedestal} halfMemoryPower={props.halfMemoryPower} />
    </div>
}

function SidebarPopUp(props) {
    return <div>
        <Row>
        <Col lg={9} xl={9}>
            <div className="sidemenu-kids" style={(props.show)? {marginLeft: '70%'} : {marginLeft: '100%'}}>
                <Button className="btnn" variant="primary" onClick={() => props.setShow()} ><img src={back} style={{height: '30px', width: '30px'}}/>   Close</Button>
                {props.sidebarLayout()}
            </div>
        </Col> 
        </Row>
        <div style={{textAlign: 'left'}}>
            <Button className='btnn-display' onClick={() => props.setShow()}><img src={diamond} style={{height: '50px', width: '60px'}}/>   Click Me   </Button>
        </div>
    </div>
}