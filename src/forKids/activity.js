import React, { useState, useContext } from "react";
import {
  Row,
  Col,
  Button,
  Modal,
} from "react-bootstrap";
import { media } from "./media";
import ProcessVideoMemoryPower from "./processVideoMemoryPower";
import { Player, MenuButton } from "video-react";
import VideoMedia from "./VideoMedia";
import PDFMedia from "./PDFMedia"
import { DispatchContext, StateContext } from "./kidModeApp"
import MemorizedPrompt from './memorizedPrompt'
import ModulePedestal from "./modulePedestal"
import ReallyBadPedestal from '../images/memoryPalace/ReallyBadPedestal.svg'
// import AdultModeApp from "../forAdults/adultModeApp"
import MenuContainer from "../forAdults/menuContainer";
import ColoringPageGenerator from "./coloringPageGenerator";
import './colorPalette.css'
import Sidebar from './sidebar'
import SidebarPopUp from "./sidebar";
import repeat from '../images/kidsPageSidebar/repeat.png';
import tree from '../images/kidsPageSidebar/tree.png';
import map from '../images/kidsPageSidebar/map.png';
import deeper from '../images/kidsPageSidebar/deeper.png';
import wider from '../images/kidsPageSidebar/wider.png';
import test_cp from '../images/coloringPages/test_cp.svg';
import PopupBookGenerator from './popupBookGenerator';

// (More {state.activity.kind})

// @TODO: 1) some contents are not implemented by the media yet
//        2) might want to add prev module and prev activity >> idea for later
// 
// note: i am filtering out some activities, passing only the implemented thru the media rn
export default function Activity(props) {
  let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)
  let dispatch = useContext(DispatchContext)
  let state = useContext(StateContext)
  let [showSidebar, setShowSidebar] = useState(false);

  let sidebarHandler = () => {
    setShowSidebar(!showSidebar);
  }

  let openSidebar = () => {
    setShowSidebar(true)
  }

  let closeSidebar = () => {
    setShowSidebar(false)
  }

  let SidebarLayout = () => {
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext)
  
    return <div className='sidebar-layout'>
      <Button className="btnn" variant="primary" onClick={() => {}}><img src={repeat} style={{height: '30px', width: '30px'}}/>   Repeat</Button>
      <Button className="btnn" variant="primary" onClick={() => dispatch({type:'nextModule'})}><img src={wider} style={{height: '30px', width: '30px'}}/>   Go Wider!</Button>
      <Button className="btnn" variant="primary" onClick={() => dispatch({type:'nextActivity'})}><img src={deeper} style={{height: '30px', width: '30px'}}/>   Go Deeper!</Button>
      <Button className="btnn" variant="primary" onClick={() => dispatch({type:'newView', view:'map', map:'tree'})}><img src={tree} style={{height: '30px', width: '30px'}}/>   Back to Tree</Button>
      <Button className="btnn" variant="primary" onClick={() => dispatch({type:'newView', view:'map', map:'home'})}><img src={map} style={{height: '30px', width: '30px'}}/>   Back to Map</Button>
      <ModulePedestal src={ReallyBadPedestal} halfMemoryPower={props.halfMemoryPower} />
      </div>
  }

  console.log('width: ', window.innerWidth)
  console.log('activity:', state.activity.kind)

  if (state.activity.kind == "Music Video" || state.activity.kind == "Dance Video" || state.activity.kind == "Repetition Video") {
    return (
      <div>
        {<MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />}
        {<SidebarPopUp sidebarLayout={SidebarLayout} setShow={sidebarHandler} show={showSidebar} />}
        <div onClick={() => closeSidebar()}>{<VideoMedia src={state.resources[state.activity.key][state.activity.kind]["url"]} setShow={openSidebar}/>}</div>
      </div>
    )  
  } 
  // else if (state.activity.kind == "Teachers Guide") {
  //   return (
  //     <div>
  //       {<MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />}
  //       {<SidebarPopUp sidebarLayout={SidebarLayout} setShow={sidebarHandler} show={showSidebar} />}
  //       <div onClick={() => closeSidebar()}>{<PDFMedia src={state.resources[state.activity.key][state.activity.kind]["url"]} />}</div>
  //     </div>
  //   );

  // } 
  else if (state.activity.kind == "Coloring Pages") {
    console.log('coloringPages=', state.resources[state.activity.key][state.activity.kind])
    return (
      <div>  
        {<MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />}
        {<SidebarPopUp sidebarLayout={SidebarLayout} setShow={sidebarHandler} show={showSidebar} />}
        {<ColoringPageGenerator onOpen={openSidebar} onClose={closeSidebar} src={state.resources[state.activity.key][state.activity.kind]['url']} />}
      </div>
    );  
    // for now (use teachers guide to lead into books)
  } else if (state.activity.kind == "Teachers Guide") {
      return (
        <div>
          {<MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />}
          {<SidebarPopUp sidebarLayout={SidebarLayout} setShow={sidebarHandler} show={showSidebar} />}
          <div onClick={() => closeSidebar()}>{<PopupBookGenerator closeSidebar={closeSidebar} src={state.resources[state.activity.key][state.activity.kind]["url"]} />}</div>
        </div>
      );
  } else {
    return (
      <div>
        {<MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />}
        {<SidebarPopUp sidebarLayout={SidebarLayout} setShow={sidebarHandler} show={showSidebar} />}
        <div onClick={() => closeSidebar()}>Coming Soon!</div>
      </div>
    ); 
  }
}


// props.showMemoryPrompt