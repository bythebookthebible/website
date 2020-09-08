import React, { useContext } from "react";
import { ReactSVG } from "react-svg";

import $ from "jquery";
import { useDispatch } from "react-redux";

export default function SVGButtons(props) {
    let dispatch = useDispatch()

    // return <img src={props.src} />
    return <ReactSVG src={props.src} renumerateIRIElements={false}
        afterInjection={(err, svg) => {
        for (let button of props.buttons) {
            $("#" + button.id).click(() => {
                if(typeof button.dispatch === "function") dispatch(button.dispatch())
                else if(button.dispatch) dispatch(button.dispatch)
                if(button.onClick) button.onClick()
            })
            .hover(
                e=>{$("#" + button.id).attr({ filter: 'url(#glow)'})},
                e=>{$("#" + button.id).attr({ filter: ''})},
            )
        }
        // props.extra && props.extra()
    }}/>
}

// let filter = $('\
// <filter id="glow">\
//     <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="white" result="shadow"></feDropShadow>\
//     <feBlend in="SourceGraphic" in2="shadow" mode="normal"></feBlend>\
// </filter>\
// ')
