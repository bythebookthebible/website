import React, { useState } from "react";
import {
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { media } from "./media";
import ProcessVideoMemoryPower from "./processVideoMemoryPower";
import { Player } from "video-react";
import VideoMedia from "./VideoMedia";

// whenever click on next activity
let nextAct = (props) => {
  let arrAct = Object.keys(props.resources[props.actKey]);
  for (let i = 0; i < arrAct.length; i++) {
    if (arrAct[i] == props.actKind) {
      if (i == arrAct.length - 1) {
        return arrAct[0];
      }
      return arrAct[i + 1];
    }
  }
  return null;
}

// whenever click on *More of same activity
let nextSameActVerse = (props) => {
  // gives arr of all key values
  let arrVerse = Object.keys(props.resources);
  // setting the index to equal to where the props.actKey belongs in the arr
  let index = -1;
  for (let i = 0; i < arrVerse.length; i++) {
    if (arrVerse[i] == props.actKey) {
      index = i;
    }
  }  
  // check the arrAct of each key, return key value iff the arrAct contains key value
  let eachArrAct = "";
  for (let j = index + 1; j < arrVerse.length; j++) {
    eachArrAct = Object.keys(props.resources[arrVerse[j]]);
    if (eachArrAct.includes(props.actKind)) {
      return arrVerse[j];
    }
  }
  for (let k = 0; k < index; k++) {
    eachArrAct = Object.keys(props.resources[arrVerse[k]]);
    if (eachArrAct.includes(props.actKind)) {
      return arrVerse[k];
    }
  }
  // this verse if the only verse that has props.actKind of activity
  return props.actKey;
}

let sidebarLayout = (props) => <div>
  <Button className="btn-round" variant="primary" onClick={() => props.setState({view:'activity', actKind:props.actKind, actKey:props.actKey})}>Repeat</Button>
  <Button className="btn-round" variant="primary" onClick={() => props.setState({view:'activity', actKind:props.actKind, actKey:nextSameActVerse(props)})}>More {props.actKind}!</Button>
  <Button className="btn-round" variant="primary" onClick={() => props.setState({view:'activity', actKind:nextAct(props), actKey:props.actKey})}>Explore other activities in this module!</Button>
  <Button className="btn-round" variant="primary" onClick={() => props.setState({view:'tree'})}>Back to Tree</Button>
  <Button className="btn-round" variant="primary" onClick={() => props.setState({view:'map'})}>Back to Map</Button>
</div>


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





// 
// FOR OLDER KIDS;
// moving on from chunk to chunk
///////////////////////////////////////START//////////////////////////////////////////////////////////////////////


/*
// whenever click on next activity
let nextAct = (props) => {
  let arrAct = Object.keys(props.resources[props.actKey]);
  console.log(arrAct);

  for (let i = 0; i < arrAct.length; i++) {
    if (arrAct[i] == props.actKind) {
      if (i == arrAct.length - 1) {
        console.log(arrAct[0]);
        return arrAct[0];
      }
      console.log(arrAct[i + 1]);
      return arrAct[i + 1];
    }
  }
  console.log('-1');
  return null;
}

// whenever click on next module
let nextVerse = (props) => {
  let arrVerse = Object.keys(props.resources);
  console.log(arrVerse);

  for (let i = 0; i < arrVerse.length; i++) {
    if (arrVerse[i] == props.actKey) {
      if (i == arrVerse.length - 1) {
        console.log(arrVerse[0]);
        return arrVerse[0];
      }
      console.log(arrVerse[i + 1]);
      return arrVerse[i + 1];
    }
  }
  console.log('-1');
  return null;
}
*/ 
/*
let checkNextAct = (props) => {
  let nextArrAct = Object.keys(props.resources[nextVerse(props)]); // finds all activities of next verse/ chapter
  console.log(nextArrAct);
  for (let i = 0; i < nextArrAct; i++) {
    if (nextArrAct[i] == props.actKind) {
      return props.actKind;
    }
  }
  return "Music Video";
}
*/


// whenever click on next module
/*
let nextVerse = (props) => {
  let arrVerse = Object.keys(props.resources);
  console.log(arrVerse);

  for (let i = 0; i < arrVerse.length; i++) {
    if (arrVerse[i] == props.actKey) {
      if (i == arrVerse.length - 1) {
        console.log(arrVerse[0]);
        return arrVerse[0];
      }
      console.log(arrVerse[i + 1]);
      return arrVerse[i + 1];
    }
  }
  console.log('-1');
  return null;
}
*/

////////////////////////////////////////////////END/////////////////////////////////////////////////////////////////////












// testing code from earlier that might be useful


/*let arrTest = (resources) => {
  return resources[Object.keys(resources)];
} */

  /* testing start
  console.log(props.resources);
  console.log(props.resources.undefined.Music);
  console.log(Object.keys(props.resources.undefined));
  
  let arrActi = Object.keys(props.resources.undefined);
  let next = (arrActi, kind) => {
    for (let i = 0; i < arrActi.length; i++) {
      if (arrActi[i] == kind) {
        return arrActi[i + 1];
      }
    }
    return -1;
  }
  
  console.log(next(arrActi, 'Music'));
  console.log(props.resources.undefined[next(arrActi, 'Music')]);


  //  testing end */

  // console.log(nextAct(props.resources, 'Schmoment'));

  // console.log(props.resources);
  // console.log(arrTest(props.resources));

  //console.log(Object.keys(props.resources))
  //console.log(Object.keys(props.resources)[17])
  //console.log(props.keya)
  // {media[props.kinda](props.resouces[props.keya][props.kinda])}

