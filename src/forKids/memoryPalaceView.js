import React from "react";
import { ReactSVG } from "react-svg";
import $ from "jquery";

// @TODO: fix code after dispatch is in place
export default function MemoryPalaceView(props) {

    // remove this after dispatch is in place
    let memoryPowers = [10, 20, 30, 40, 50, 60, 70, 80]

    return (
        <ReactSVG 
            src={props.src} 
            afterInjection={(err, svg) => {
                for (let i = 0; i < memoryPowers.length; i++) {
                    let percentageFilled = memoryPowers[i] / 100
                    let glow = $('#glow_' + (i + 1)).children().css({'transform-origin': 'bottom', 'transform-box': 'fill-box', 'transform': 'scaleY(' + percentageFilled + ')'})
                }
            }} 
        
        />
    )
}