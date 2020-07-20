import React, { useContext, useState } from "react";
import { ReactSVG } from "react-svg";
import $ from "jquery";
import { Button } from "react-bootstrap";
import { DispatchContext, StateContext } from "./kidModeApp";
import MemorizedPrompt from "./memorizedPrompt"

// @TODO: 1) fix code after actual imagine is used in place
export default function MemoryPalaceView(props) {
    let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext)
    let defaultHalfMemoryPower = 50.0

    return (
        <div>
            {<MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />}
            <ReactSVG 
                 src={props.src} 
                 afterInjection={(err, svg) => {
                     // fix the i < 8 later (bc rn we only have 8 rectangles)
                     let MPArray = Object.values(state.memoryPower)
                     for (let i = 0; i < 8; i++) {
                         // this is to set an asymptote at half way mark
                         let percentageFilled = MPArray[i] / (MPArray[i] + (props.halfMemoryPower || defaultHalfMemoryPower))
                         let glow = $('#glow_' + (i + 1)).children().css({'transform-origin': 'bottom', 'transform-box': 'fill-box', 'transform': 'scaleY(' + percentageFilled + ')'})
                     }
                 }} 
            />
            <Button className="btn-round" variant="primary" onClick={() => dispatch({type:'newView', view:'map', map:'home'})}>Back to Map</Button>
        </div>
    )
}

// props.src, props.halfMemoryPower