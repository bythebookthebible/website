// import React, { useState, useContext } from 'react';
// import TestingColorPage from './testColoringPage';
// import ColorPalette from "./colorPalette";
// import { Row, Col, Button } from 'react-bootstrap';

// import { DispatchContext, StateContext } from "./kidModeApp";
// import done from '../images/kidsPageSidebar/done.png'
// import TestCP from './testCP';
// import test_cp from '../images/coloringPages/test_cp.svg';

// export default function ColoringPageGenerator(props) {
//     let dispatch = useContext(DispatchContext)
//     // let state = useContext(StateContext)
//     // let [fillColors, setFillColors] = useState([])
//     // let [indexArr, setIndexArr]= useState([])
//     // // let [reset, setReset] = useState(false)
//     // // let [drawn, setDrawn] = useState(false)
//     // let [currentColor, setCurrentColor] = useState('white')


//     // let onFillColors = (arr) => {
//     //     let newArr = fillColor.slice(0)
//     //     newFillColors[i] = currentColor
//     //     setFillColors(newFillColors)
//     // }

//     // let drawnHandler = () => {
//     //     setDrawn(true)
//     // }

//     // let onSubmit = () => {
//     //     // check if at least 1 item is filled/ colored
//     //     if (drawn) {
//     //         dispatch({type: 'addMemoryPower', power: 1})
//     //         setReset(true)
//     //         props.onOpen()
//     //     }
//     // }

//     return (
//         <div>
//             <div onClick={() => props.onClose()}>
//             <TestCP src={test_cp}  />
//                 {/* <Row>
//                     {console.log("generator")}
//                 <Col sm={9} md={9}><TestCP src={test_cp}  /></Col>
//                 {/* <Col sm={3} md={3}>
//                     <ColorPalette changeColor={setCurrentColor} currentColor={currentColor} />
//                     {/* <div className='btnn-submit-container'><Button className="btnn-submit" variant="primary" onClick={() => onSubmit()}><img src={done} style={{height: '30px', width: '30px'}} />   Done</Button></div> */}
//                 {/* </Col> */}
//                 {/* <Col><div className='btnn-submit-container'><Button className="btnn-submit" variant="primary" onClick={() => onSubmit()}><img src={done} style={{height: '30px', width: '30px'}} />   Done</Button></div></Col> */}
//                 {/* </Row> */} 
//                 <div className='btnn-submit-container'><Button className="btnn-submit" variant="primary" ><img src={done} style={{height: '30px', width: '30px'}} />   Done</Button></div>
                
                
//             </div>
//             {/* <div className='btnn-submit-container'><Button className="btnn-submit" variant="primary" onClick={() => onSubmit()}><img src={done} style={{height: '30px', width: '30px'}} />   Done</Button></div> */}
//         </div>
//     )
// }

import React, { useContext, useCachedStorage } from 'react';
import test_cp from '../images/coloringPages/test_cp.svg';
import { DispatchContext, StateContext } from "./kidModeApp";
import ProcessCPMemoryPower from './processCPMemoryPower';

export default function VideoMedia(props) {
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext)

    // let src = useCachedStorage(props.src);
    if (state.activity.kind == "Coloring Pages") {
        return <ProcessCPMemoryPower onOpen={props.onOpen} onClose={props.onClose} src={props.src} />
    }
}