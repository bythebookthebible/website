import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useFirestoreVariableDoc } from '../firebase';
import { findClosest, useRefListener } from '../util';
import { Video } from "./Video"

export const TimestampEditor = {
  Video: React.forwardRef(({timestampKey, firestoreDoc, src, ...props}, ref) => {
    const videoRef = useRef()
    const timestampState = TimestampEditor.useState({videoRef, timestampKey, firestoreDoc, src})

    useImperativeHandle(ref, ()=>({
      ...timestampState,
    }), [timestampState])

    return <Video.Container ref={videoRef} src={src} style={{width:"50vw"}}>
      <Video.PlayButton autoplay={false} />
      {timestampKey && <TimestampEditor.Bar {...timestampState} />}
      <Video.Fullscreen />
    </Video.Container>

  }),

  useState: ({timestampKey, firestoreDoc, videoRef, src}) => {
    const [timestamps, _setTimestamps] = useState([])
    const [curTime, setCurTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [curValueState] = useFirestoreVariableDoc(firestoreDoc)
    const barRootRef = useRef()

    const validTimestamps = t => {
      t = !videoRef.current?.duration ? [0, ...t] : [0, ...t, videoRef.current.duration]
      return Array.from(new Set(t)).sort((a, b)=>a-b)
    }

    const setTimestamps = x => {
      if(x instanceof Function) _setTimestamps(t=>validTimestamps(x(t)))
      else _setTimestamps(validTimestamps(x))
    }

    // reset timestamps when loading new video
    useEffect(() => {
      setTimestamps(curValueState?.[timestampKey] || [])
      videoRef.current?.focus()
    }, [firestoreDoc, timestampKey, curValueState])


    function updateTimes() {
      setCurTime(videoRef.current?.currentTime || 0)
      setDuration(videoRef.current?.duration || 0)
    }
    useRefListener(videoRef, 'loadedmetadata', updateTimes, [src]) // sync duration state for newly loaded videos
    useRefListener(videoRef, 'timeupdate', updateTimes, [src]) // update state on all timeupdate events

    // edit timestamps
    const handleKeyDown = e => {
      switch(e.key) {
      case " ":
        e.preventDefault()
        if(!e.repeat) setTimestamps(t=>[...t, videoRef.current.currentTime])
        break
      case "ArrowLeft":
        // TODO easier editing of timestamps
        break
      }
    }

    // apply keydown listener to video parent box
    useEffect(() => {
      const cur = videoRef.current?.parentNode
      if(cur) {
        cur.tabIndex = 0 // keydown wont work if you cant focus on the element
        cur.addEventListener('keydown', handleKeyDown, true)
        return () => cur.removeEventListener('keydown', handleKeyDown)
      }
    }, [videoRef, src])

    return {timestamps, setTimestamps, duration, curTime, barRootRef}
  },

  Bar: ({videoRef, src, timestamps, setTimestamps, duration, curTime, barRootRef, ...props}) => {
    const [selectedTimestamp, setSelectedTimestamp] = useState(undefined)
    
    const seekTime = seekFrac => seekFrac * duration || 0
    const seek = time => {
      const video = videoRef.current
      if(video.fastSeek) video.fastSeek(time)
      else video.currentTime = time
    }

    const seekClosestTimestamp = e => {
      const video = videoRef.current, bar = barRootRef.current
      const xFraction = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth

      if (timestamps.length > 0) {
        const closestTime = findClosest(timestamps, seekTime(xFraction))
        setSelectedTimestamp(closestTime)
        seek(closestTime)
      } else {
        seek(seekTime(seekFraction))
      }
    }

    return <div ref={barRootRef} className="progressBar" {...props}
      onClick={seekClosestTimestamp}>

      <div className="bar" style={{backgroundColor:"#aaa", width: `${100*curTime/duration}%`}} />

      {timestamps.map(t => <span className="starMarker" key={t} style={{
        left: `${100*t/duration}%`, 
        fontSize: t==selectedTimestamp ? "1.5rem" : ".8rem",
      }} >⟡</span>)  /** ⟡♦◆⬥ */}

      <i className="marker fas fa-trash" style={{left: `100%`}} 
        onClick={()=>setTimestamps([])} />
    </div>
  },
}

