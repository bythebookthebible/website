import React, { useContext } from "react";
import { ReactSVG } from "react-svg";

import $ from "jquery";
import { DispatchContext } from "./kidModeApp"

export default function ButtonMap(props) {
    let dispatch = useContext(DispatchContext)

    // return <img src={props.src} />
    return <ReactSVG src={props.src} renumerateIRIElements={false}
        afterInjection={(err, svg) => {
        for (let button of props.buttons) {
            $("#" + button.id).click(() => {
                button.dispatch && dispatch(button.dispatch)
                button.onClick && button.onClick()
            })
            .hover(
                e=>{$("#" + button.id).attr({ filter: 'url(#glow)'})},
                e=>{$("#" + button.id).attr({ filter: ''})},
            )
        }
    }}/>
}

// let filter = $('\
// <filter id="glow">\
//     <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="white" result="shadow"></feDropShadow>\
//     <feBlend in="SourceGraphic" in2="shadow" mode="normal"></feBlend>\
// </filter>\
// ')
