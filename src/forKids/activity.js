import React, { useState, useContext } from "react";
import {
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { media } from "./media";
import ProcessVideoMemoryPower from "./processVideoMemoryPower";
import { Player } from "video-react";
import VideoMedia from "./VideoMedia";
import { DispatchContext } from "./kidModeApp"

let sidebarLayout = (props) => {
  let dispatch = useContext(DispatchContext)

  return <div>
    <Button className="btn-round" variant="primary" onClick={() => {}}>Repeat</Button>
    <Button className="btn-round" variant="primary" onClick={() => dispatch({type:'nextModule'})}>Go Wider! (More {props.actKind})</Button>
    <Button className="btn-round" variant="primary" onClick={() => dispatch({type:'nextActivity'})}>Go Deeper! (Different activities)</Button>
    <Button className="btn-round" variant="primary" onClick={() => dispatch({type:'nextInPath', path:'Proverbs'})}>Next in Learning Path</Button>
    <Button className="btn-round" variant="primary" onClick={() => dispatch({type:'newView', view:'map', map:'tree'})}>Back to Tree</Button>
    <Button className="btn-round" variant="primary" onClick={() => dispatch({type:'newView', view:'map', map:'home'})}>Back to Map</Button>
  </div>
}


// @TODO: 1) some contents are not implemented by the media yet
//        2) might want to add prev module and prev activity >> idea for later
// 
// note: i am filtering out some activities, passing only the implemented thru the media rn
export default function Activity(props) {
  if (props.resources && (props.actKind == "Music Video" || props.actKind == "Dance Video" )) {
    return (
      <div>
        <Row>
          <Col sm={9}>{<VideoMedia src={props.resources[props.actKey][props.actKind]["url"]} setMemoryP={props.setMemoryP} actKey={props.actKey} />}</Col>
          <Col sm={3}>{sidebarLayout(props)}</Col>
        </Row>
      </div>
    )  
  } else if (props.resources && (props.actKind == "Teachers Guide"
             || props.actKind == "Coloring Pages")) {
    return (
      <div>
        <Row>
          <Col sm={9}>{media[props.actKind](props.resources[props.actKey][props.actKind])}</Col>
          <Col sm={3}>{sidebarLayout(props)}</Col>
        </Row>
      </div>
    );
  } else {
    return (
    <div>
      <Row>
        <Col sm={9}>Coming Soon</Col>
        <Col sm={3}>{sidebarLayout(props)}</Col>
      </Row>
    </div>
    ); 
  }
}
