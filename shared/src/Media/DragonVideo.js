import React, { useEffect, useRef, useState } from 'react';
import { useRefListener, findClosest } from '../util';
import { Video } from "./Video"

const newRepetitions = 10
const reviewRepetitions = 2

export const Dragon = {
  Video: ({src, metadata, autoPlay, ...props}) => {
    src = Object.values(src)[0]
    const videoRef = useRef()
    const dragonState = Dragon.useState({videoRef, src, metadata, newRepetitions, reviewRepetitions})

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

  useState: ({videoRef, src, metadata }) => {
    const [repeatState, setRepeatState] = useState({offset:0, length:1, repeats: newRepetitions})

    const [curTime, setCurTime] = useState(0)
    const [duration, setDuration] = useState(0)

    const seekToOffset = offset => setRepeatState({offset, length:1, repeats: newRepetitions})

    // reset repeat state for new video
    useEffect(()=>{
      seekToOffset(0)
      setCurTime(0)
    }, [src])

    const timestamps = Object.values(metadata.referencedVideos)[0]?.timestamps

    const nextState = Dragon.nextState({newRepetitions, reviewRepetitions, segmentCount: timestamps?.length})

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

    return {...repeatState, setRepeatState, timestamps, seekToOffset, curTime, duration}
  },

  TimeBar: ({timestamps, setRepeatState, seekToOffset, curTime, duration, offset, length, videoRef}) => {
    const barRootRef = useRef()
    const scale = 100/duration

    const getSeekTime = e => {
      const bar = barRootRef.current
      const xFraction = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth
      return xFraction * duration || 0
    }

    const seek = e => {
      const seekTime = getSeekTime(e)
      videoRef.current.currentTime = seekTime;

      if (timestamps.length > 0) {
        const [closestTime, index] = findClosest(timestamps, seekTime, true)
        setRepeatState({offset: index, length:1, repeats: newRepetitions})
      }
    }

    const mouseMove = e => {
      if(e.buttons == 1) {
        seek(e)
      }
    }

    return <div className='progressBar' ref={barRootRef} onMouseMove={mouseMove} onTouchMove={seek} onClick={seek}>
      <div className='bar' style={{backgroundColor:"#fd4", width: timestamps[offset]*scale + "%"}} />
      <div className='bar' style={{backgroundColor:"#fd44", width: timestamps[offset+length]*scale + "%"}} />

      {timestamps // a star for each future timestamp
        .map((t,i)=><span className="starMarker" key={i} style={{left: `${t*scale}%`}} >
          {i == offset ? '•' : i < offset+length ? '·' : '⟡'}
        </span>)
      }

      <div className="circleMarker" style={{left: `${scale*curTime}%`}} />
    </div>
  },

  RepeatBadge: ({repeats}) => <div className='repeatsBadge'><b>{repeats}</b><br/>More Times</div>,

  nextState: ({newRepetitions, reviewRepetitions, segmentCount}) => ({offset, length, repeats}) => {
    // first innermost repeats
    repeats--
    if(repeats > 0)
      return {offset, length, repeats}

    // Done with the full cycle? start at the beginning again.
    if(length >= segmentCount) {
      // TODO: send ending event?
      // loop back to beginning
      return {offset:0, length:1, repeats: newRepetitions}
    }

    // if this interval is not aligned in the next size block, and the next block exists
    // then start new material (smallest interval immediately after current one)
    if( (offset + length) % (2 * length) != 0  &&  offset+length < segmentCount) {
      return {offset: offset+length, length: 1, repeats: newRepetitions}
    }

    // if we are aligned, and we still have room in this module
    // then review (double interval size, end time fixed)
    if(2*length < segmentCount) {
      return {offset: offset-length, length:2*length, repeats: reviewRepetitions}
    }

    // we are ready to review the whole module (interval expands to cover everything)
    blockOffset = {measure: 0, module: OM + LM}
    blockLength = {measure: 0, module: 1}
    return {offset: 0, length: segmentCount, repeats: reviewRepetitions}
  },
}
