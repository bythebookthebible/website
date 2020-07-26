
// import { Button } from "reactstrap"

import React, { useEffect, useRef, useContext, useState } from "react"
import {
  Player,
  ControlBar,
  PlaybackRateMenuButton,
  VolumeMenuButton,
  BigPlayButton,
} from "video-react"
import "../../node_modules/video-react/dist/video-react.css"
// import ProcessVideoMemoryPower from "./processVideoMemoryPower"

import videoSplash from "../images/videoSplash.png"
// import { useAuth, useFirestore, useCachedStorage } from "../hooks"
import { DispatchContext, StateContext } from "./kidModeApp"

// @TODO: 1) fix timestamps
//        2) fix if (repetitionVideo) check
// pre: parameters passed in: src
//
// 
export default function ProcessVideoMemeoryPower(props) {
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext)

    let timer = useRef(0)
    let player = useRef()
    let counter = 1;
    let timestamps = '2 4 6 8 10 12 14'
    let loopCount = 3;
    let [arrTimestamps, setArrTimestamps] = useState(traverse(timestamps))

    useEffect(() => {
        player.current.subscribeToStateChange(handleStateChange)
    }, [state.activity.key])

    function handleStateChange(newState) {
        if (props.repeat.current) {
            player.current.actions.seek('0')
            props.resetRepeat()
            console.log("Calleddddd")
        }
        // for repeating videos
        if (state.activity.kind == 'Repetition Video') {
            processRepetitionVideo(newState)
        }
        processMemoryPower(newState)
    }

    let arrTimestampsIndex = arrTimestamps.length - 1;
    function processRepetitionVideo(newState) {
        let arr = arrTimestamps[arrTimestampsIndex].split(' ')
        let start = arr[0]
        let stop = arr[1]
        if (counter < loopCount && newState.currentTime >= stop) {
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
        let timeArr = timestamps.split(' ') // arr of timestamps
        let half = Math.floor(timeArr.length / 2)
        let firstHalf = timeArr.slice(0, half + 1)
        let secondHalf = timeArr.slice(half, timeArr.length)
        let startEndTimePair = "" + timeArr[0] + " " + timeArr[timeArr.length - 1]
        let arr = [startEndTimePair]
        return traverseHelper(firstHalf, secondHalf, arr)
    }

    function processMemoryPower(newState) {
        if (newState.currentTime + 2 >= newState.duration && !newState.paused) {
            props.setShow()
        }
        if (newState.paused) {
            timer.current = newState.currentTime
        } else if (Math.abs(newState.currentTime - timer.current) >= 1.0) {
            timer.current = newState.currentTime
            dispatch({type:'addMemoryPower', power: 0.1})
        }
    }

    return <div>
        <Player ref={player} playsInline className="player" poster={videoSplash} key={state.activity.key}>
            <source src={props.src} />
            <BigPlayButton position="center" />
            <ControlBar>
                <PlaybackRateMenuButton rates={[2.0, 1.5, 1.0, 0.7, 0.5]} order={7.1} />
                <VolumeMenuButton order={7.1} vertical />
            </ControlBar>
        </Player>
    </div>
}  


// props.src