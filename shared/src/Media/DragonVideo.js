import React, { useEffect, useRef, useState } from 'react';
import { useRefListener } from '../util';
import { Video } from "./Video"

export const Dragon = {
  Video: ({src, metadata, autoPlay, repetitionCount = 5, ...props}) => {
    src = Object.values(src)[0]
    const videoRef = useRef()
    const dragonState = Dragon.useState({videoRef, src, metadata, repetitionCount})

    return <Video.Container ref={videoRef} {...{src, autoPlay, ...props}}
      absoluteChildren={
        <Dragon.RepeatBadge {...dragonState} />
      }
    >
      <Video.PlayButton autoPlay={props.autoPlay} />
      <Dragon.TimeBar {...dragonState} />
      <Video.Loop />
      <Video.Fullscreen />
    </Video.Container>
  },

  useState: ({videoRef, src, metadata, repetitionCount}) => {
    const [repeatState, setRepeatState] = useState({offset:0, length:1, repeats:0})

    const [curTime, setCurTime] = useState(0)
    const [duration, setDuration] = useState(0)

    // reset repeat state for new video
    useEffect(()=>{
      setRepeatState({offset:0, length:1, repeats:0})
      setCurTime(0)
    }, [src])

    const timestamps = metadata?.timestamps

    const nextState = Dragon.nextState({repetitionCount, segmentCount: timestamps?.length})

    const updateTimes = () => {
      if(videoRef.current?.currentTime >= timestamps[repeatState.offset + repeatState.length]) {
        let newState = nextState(repeatState)
        if(newState.offset != repeatState.offset+repeatState.length)
          videoRef.current.currentTime = timestamps[newState.offset]
          // because it unhelpfully pauses when it hits the end of the video, but we haven't finished looping yet
          if(videoRef.current.paused) videoRef.current.play()
        setRepeatState(nextState)
      }
      setCurTime(videoRef.current?.currentTime || 0)
      setDuration(videoRef.current?.duration || 0)
    }

    useRefListener(videoRef, 'loadedmetadata', updateTimes, [src, repeatState]) // init on newly loaded videos
    useRefListener(videoRef, 'timeupdate', updateTimes, [src, repeatState]) // update state on all timeupdate events

    return {...repeatState, timestamps, curTime, duration, repetitionCount}
  },

  TimeBar: ({timestamps, curTime, duration, offset, length}) => {
    const scale = 100/duration
    return <div className='progressBar'>
      <div className='bar' style={{backgroundColor:"#fd4", width: timestamps[offset]*scale + "%"}} />
      <div className='bar' style={{backgroundColor:"#fd44", width: timestamps[offset+length]*scale + "%"}} />

      {timestamps // a star for each future timestamp
        .filter((t,i) => i >= offset+length)
        .map((t,i)=><span className="starMarker" key={i} style={{left: `${t*scale}%`}} >⟡</span>)
      }

      <div className="circleMarker" style={{left: `${scale*curTime}%`}} />
    </div>
  },

  RepeatBadge: ({repetitionCount, repeats}) => <div className='repeatsBadge'><b>{repetitionCount - repeats}</b><br/>More Times</div>,

  nextState: ({repetitionCount, segmentCount}) => ({offset, length, repeats}) => {
    // first innermost repeats
    repeats++
    if(repeats < repetitionCount)
      return {offset, length, repeats}
    repeats = 0

    // check ending condition
    if(length >= segmentCount) {
      // TODO: send ending event?
      // loop back to beginning
      return {offset:0, length:1, repeats:0}
    }

    // if this interval is not aligned in the next size block, and the next block exists
    // then start new material (smallest interval immediately after current one)
    if( (offset + length) % (2 * length) != 0  &&  offset+length < segmentCount) {
      return {offset: offset+length, length: 1, repeats}
    }

    // if we are aligned, and we still have room in this module
    // then review (double interval size, end time fixed)
    if(2*length < segmentCount) {
      return {offset: offset-length, length:2*length, repeats}
    }

    // we are ready to review the whole module (interval expands to cover everything)
    blockOffset = {measure: 0, module: OM + LM}
    blockLength = {measure: 0, module: 1}
    return {offset: 0, length: segmentCount, repeats}
  },
}
