import React, { useContext } from "react";
import { ReactSVG } from "react-svg";
import $ from "jquery";
import './colorPalette.css'

import { DispatchContext, StateContext } from "./kidModeApp";

export default function ModulePedestal(props) {
    let dispatch = useContext(DispatchContext);
    let state = useContext(StateContext);
    let defaultHalfMemoryPower = 50.0


    return (
        <div className='modulePedestal'>
        <ReactSVG 
            src={props.src}
            afterInjection={(err, svg) => {
                let MP = state.memoryPower[state.activity.key]
                let percentageFilled = MP / (MP + (props.halfMemoryPower || defaultHalfMemoryPower))
                let glow = $('#glow').children().css({'transform-origin': 'bottom', 'transform-box': 'fill-box', 'transform': 'scaleY(' + percentageFilled + ')'})
            }}
        />
        </div>
    )
}

// props.src, props.halfMemoryPower