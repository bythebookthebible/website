
import { Button } from "reactstrap"

import React, { Component, useState, useEffect, useRef } from "react"
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

// @TODO: fix the weird video continuation when clicked on "More Video!", might have been due to using the same link?
//
// pre: parameters passed in: setMemoryP, actKey, src, incrementPer3Seconds(this can be found in VideoMedia)
export default function ProcessVideoMemeoryPower(props) {
    let timer = useRef(0)
    let [state, setState] = useState({})
    let player = useRef()

    useEffect(() => {
        player.current.subscribeToStateChange(handleStateChange)
    }, [])

    function handleStateChange(newState) {
        console.log(timer.current)
        setState(newState)
        if (newState.paused) {
            timer.current = newState.currentTime
        } else if (newState.currentTime - timer.current > 3.0) {
            timer.current = newState.currentTime
            let key = props.actKey
            let increment = props.incrementPer3Seconds
            props.setMemoryP(prev => ({
                ...prev,
                [key]: {
                    ...prev[key],  
                    powerLevel: prev[key].powerLevel + increment
                }
            }))
        console.log("changed")
        }
    }
    console.log(timer, state.currentTime)

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
