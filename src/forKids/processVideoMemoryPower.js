
import { Button } from "reactstrap"

import React, { Component, useState, useEffect, useRef, useContext } from "react"
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton,
} from "video-react"
import "../../node_modules/video-react/dist/video-react.css"
import ProcessVideoMemoryPower from "./processVideoMemoryPower"

import videoSplash from "../images/videoSplash.png"
import { useAuth, useFirestore, useCachedStorage } from "../hooks"
import { DispatchContext } from "./kidModeApp"

export default function ProcessVideoMemeoryPower(props) {
    let dispatch = useContext(DispatchContext)

    let timer = useRef(0)
    let player = useRef()
    // @TODO: make player source change with props change
    // console.log(props, player.current && player.current.getState())

    useEffect(() => {
        player.current.subscribeToStateChange(handleStateChange)
    }, [])

    // @TODO: might want to fix the amount of powerLevel rewarded per second
    function handleStateChange(newState) {
        if (newState.paused) {
            timer.current = newState.currentTime
        } else if (newState.currentTime - timer.current > 3.0) {
            timer.current = newState.currentTime
            // let key = props.actKey
            dispatch({type:'addMemoryPower', power: 0.3})
        }
    }

    return <div>
        <Player ref={player} playsInline className="player" poster={videoSplash}>
            <source src={props.src} />
            <BigPlayButton position="center" />
            <ControlBar>
                <PlaybackRateMenuButton rates={[2.0, 1.5, 1.0, 0.7, 0.5]} order={7.1} />
                <VolumeMenuButton order={7.1} vertical />
            </ControlBar>
        </Player>
    </div>
}  
