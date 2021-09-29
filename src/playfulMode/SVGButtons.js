import React, { useContext, useEffect, useRef, useState } from "react";
import { ReactSVG } from "react-svg";

import { useHistory } from "react-router-dom";

import $ from "jquery";
import { useDispatch } from "react-redux";
import {useDebounce} from '../common/hooks'

const defaultAspectRatio = 1.78
export {defaultAspectRatio}

export default function SVGButtons(props) {
    let dispatch = useDispatch()
    let {glowSize, buttons, extra, svg:SVG, aspectRatio, ...otherProps} = props
    aspectRatio = aspectRatio || defaultAspectRatio
    glowSize = glowSize || 20
    buttons = buttons || []

    // for debounding hover glow
    let debounce = useDebounce(200)
    let history = useHistory()

    useEffect(() => {
        for (let button of buttons) {
            let b = $("#" + button.id)
            b.click(() => {
                // if(typeof button.dispatch === "function") dispatch(button.dispatch())
                if(button.dispatch) dispatch(button.dispatch)
                if(button.linkTo) history.push(button.linkTo)
                if(button.onClick) button.onClick()
            })
            b.hover(
                e=>debounce(()=>$("#" + button.id).attr({ filter: 'url(#glow)'})),
                e=>debounce(()=>$("#" + button.id).attr({ filter: ''})),
            )
            b.css("cursor", "pointer")
        }
        extra && extra()
    }, [buttons, extra])

    return <svg {...otherProps} style={{position:'absolute', width:'100%', height:'100%', ...props.style}} viewBox={`0 0 ${aspectRatio} 1`}>
        <defs>
            <filter id="glow">
                <feDropShadow dx="0" dy="0" stdDeviation={glowSize} floodColor="white" result="shadow" />
                <feBlend in="SourceGraphic" in2="shadow" mode="normal" />
            </filter>
            <style>{"#Top, #Background {pointer-events:none}"}</style>
        </defs>
        <SVG x={0} y={0} width={aspectRatio} height={1} style={{overflow:'hidden'}} />
    </svg>
}

