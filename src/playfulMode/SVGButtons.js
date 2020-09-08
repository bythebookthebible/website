import React, { useContext, useEffect, useRef, useState } from "react";
import { ReactSVG } from "react-svg";

import $ from "jquery";
import { useDispatch } from "react-redux";
import { SizeMe } from "react-sizeme";
import { isNumber } from "lodash";

export default function SVGButtons(props) {
    let dispatch = useDispatch()
    let width = props.width || 1
    width = width > 1 ? width : window.innerWidth * width
    let height = props.height || 1
    height = height > 1 ? height : window.innerHeight * height

    useEffect(() => {
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
        props.extra && props.extra()
    }, [props.svg])

    return <svg {...props} style={{position:'absolute', overflow:'visible', width:'100%', height:'100%', ...props.style}}
    viewBox={`0 0 ${width} ${height}`}>
        <defs>
            <filter id="glow">
                <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="white" result="shadow" />
                <feBlend in="SourceGraphic" in2="shadow" mode="normal"></feBlend>
            </filter>
        </defs>
        <props.svg x={0} y={0} width={width} height={height} style={{overflow:'visible'}} />
    </svg>
}

