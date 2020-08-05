import React, { useEffect, useRef, useContext, useState, useMemo } from "react"
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton,
} from "video-react"
import "../../node_modules/video-react/dist/video-react.css"

import videoSplash from "../images/videoSplash.png"
import { DispatchContext, StateContext } from "./kidModeApp"

export var MemeoryPowerVideo = React.forwardRef((props, extRef) => {
    let dispatch = useContext(DispatchContext)

    let intRef = useRef()
    let player = extRef || intRef

    useEffect(()=>{
        player.current.subscribeToStateChange(onStateChange)
        
        props.repeatHandler.current = ()=>{
            player.current.seek(0)
            player.current.play()
        }

        // load current src
        player.current.load(props.src)
        player.current.seek(0)

    }, [Boolean(player.current), props.src])

    let timer = useRef(0)
    function onStateChange(playerState) {
        // update active status
        if (playerState.currentTime + 1 >= playerState.duration && !playerState.paused)
            props.isActive(false)
        else if (playerState.paused)
            props.isActive(false)
        else
            props.isActive(true)

        // update memory power
        if (playerState.paused) {
            timer.current = playerState.currentTime
        } else if (Math.abs(playerState.currentTime - timer.current) >= 1.0) {
            timer.current = playerState.currentTime
            dispatch({type:'addMemoryPower', power: 0.1})
        }
    }

    return <Player ref={player} playsInline className="player" poster={videoSplash} key={props.src}>
        <source src={props.src} />
        <BigPlayButton position="center" />
        <ControlBar>
            <PlaybackRateMenuButton rates={[2.0, 1.5, 1.0, 0.7, 0.5]} order={7.1} />
            <VolumeMenuButton order={7.1} vertical />
        </ControlBar>
    </Player>
})

const loopCount = 3;
export var RepetitionMemoryVideo = (props) => {
    let player = useRef()
    
    let counter = 1;
    let arrTimestamps = useMemo(()=>traverse(props.timestamps), [props.timestamps])

    function traverseHelper(left, right, arr) {
        let rightTimePair = "" + right[0] + " " + right[right.length - 1]
        arr.push(rightTimePair)
        if (right.length > 2) {
            let rightHalf = Math.floor(right.length / 2)
            let rightFirstHalf = right.slice(0, rightHalf + 1)
            let rightSecondHalf = right.slice(rightHalf, right.length)
            traverseHelper(rightFirstHalf, rightSecondHalf, arr)
        }
        let leftTimePair = "" + left[0] + " " + left[left.length - 1]
        arr.push(leftTimePair)
        if (left.length > 2) {
            let leftHalf = Math.floor(left.length / 2)
            let leftFirstHalf = left.slice(0, leftHalf + 1)
            let leftSecondHalf = left.slice(leftHalf, left.length)
            traverseHelper(leftFirstHalf, leftSecondHalf, arr)
        }
        return arr
    }

    function traverse(timestamps) {
        let timeArr = timestamps.split(' ').map(t=>{
            let s = t.split(':')
            return s.length == 1 ? Number(t) : Number(s[0])*60 + Number(s[1])
        }) // arr of timestamps
        timeArr = [0, ...timeArr]
        let half = Math.floor(timeArr.length / 2)
        let firstHalf = timeArr.slice(0, half + 1)
        let secondHalf = timeArr.slice(half, timeArr.length)
        let startEndTimePair = "" + timeArr[0] + " " + timeArr[timeArr.length - 1]
        let arr = [startEndTimePair]
        return traverseHelper(firstHalf, secondHalf, arr)
    }

    let arrTimestampsIndex = arrTimestamps.length - 1;
    function processRepetitionVideo(playerState) {
        let arr = arrTimestamps[arrTimestampsIndex].split(' ')
        let start = arr[0]
        let stop = arr[1]
        if (counter < loopCount && playerState.currentTime >= stop) {
            player.current.actions.seek(start)
            counter = counter + 1
            if (counter == loopCount) {
                counter = 1
                arrTimestampsIndex = arrTimestampsIndex - 1
                arr = arrTimestamps[arrTimestampsIndex].split(' ')
                start = arr[0]
                stop = arr[1]
            }
        }
    }

    useEffect(()=>{
        player.current.subscribeToStateChange(processRepetitionVideo)
    }, [props.src])
    
    return <MemeoryPowerVideo ref={player} {...props} />
}

export var EchoMemoryVideo = (props) => {
    let player = useRef()
    let timestamps = props.timestamps.split(' ').map(t=>{
        let s = t.split(':')
        return s.length == 1 ? Number(t) : Number(s[0])*60 + Number(s[1])
    })

    let count = useRef(0)
    let index = useRef(0)

    function processEcho(playerState) {
        // count and index are staying 0...
        console.log('echo:', count.current, index.current)
        if(playerState.currentTime >= timestamps[index.current]) {
            if(count.current >= 1) {
                index.current++
                count.current = 0
            } else {
                console.log('audio', playerState.audioTracks)
                player.current.seek(timestamps[index.current-1] || 0)
                player.current.play()
                count.current++
            }
        }
    }

    useEffect(()=>{
        player.current.subscribeToStateChange(processEcho)
    }, [props.src])
    
    return <MemeoryPowerVideo ref={player} {...props} src={props.watchSrc} />
}
