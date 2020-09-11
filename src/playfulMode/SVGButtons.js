import React, { useContext, useEffect, useRef, useState } from "react";
import { ReactSVG } from "react-svg";

import $ from "jquery";
import { useDispatch } from "react-redux";
import {useDebounce} from '../common/hooks'

export default function SVGButtons(props) {
    let dispatch = useDispatch()
    let {glowSize, buttons, extra, svg:SVG, width, height} = props
    width = width || 1
    height = height || 1
    glowSize = glowSize || 20
    buttons = buttons || []

    // for matching inner svg shape to containing shape
    width = width > 1 ? width : window.innerWidth * width
    height = height > 1 ? height : window.innerHeight * height

    // for debounding hover glow
    let debounce = useDebounce(200)

    useEffect(() => {
        for (let button of buttons) {
            $("#" + button.id).click(() => {
                if(typeof button.dispatch === "function") dispatch(button.dispatch())
                else if(button.dispatch) dispatch(button.dispatch)
                if(button.onClick) button.onClick()
            })
            .hover(
                e=>debounce(()=>$("#" + button.id).attr({ filter: 'url(#glow)'})),
                e=>debounce(()=>$("#" + button.id).attr({ filter: ''})),
            )
        }
        extra && extra()
    }, [buttons, extra])

    return <svg style={{position:'absolute', overflow:'visible', width:'100%', height:'100%', ...props.style}} viewBox={`0 0 ${width} ${height}`}>
        <defs>
            <filter id="glow">
                <feDropShadow dx="0" dy="0" stdDeviation={glowSize} floodColor="white" result="shadow" />
                <feBlend in="SourceGraphic" in2="shadow" mode="normal" />
            </filter>
        </defs>
        <SVG x={0} y={0} width={width} height={height} style={{overflow:'visible'}} />
    </svg>
}

