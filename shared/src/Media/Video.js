import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { toHHMMSS, useForwardedRef, useRefListener, toggleFullscreen, fullScreenEnabled } from '../util';
import { Inline } from "@bedrock-layout/primitives"

export const Video = props => {
  const videoRef = useRef()
  const progressState = Video.Progress.useState({videoRef, src: props.src})

  return <Video.Container ref={videoRef} {...props} >
    <Video.PlayButton autoPlay={props.autoPlay} />
    <Video.Progress.Text {...progressState} />
    <Video.Progress.Bar {...progressState} />
    <Video.Loop />
    <Video.Fullscreen />
    <Video.Download />
  </Video.Container>
}

Video.Container = React.forwardRef(
  ({ src, thumbnail, children, absoluteChildren, className, ...props }, fwVideoRef) => {
    const videoRef = useForwardedRef(fwVideoRef)

    return <div className={'mediaRoot '+className}>
      <div className="absoluteContainer">
        <video ref={videoRef} src={src} controls={false}  
          poster={thumbnail} playsInline {...props} />
        {React.Children.map(absoluteChildren, 
          child => React.cloneElement(child, {videoRef, src}))
        }

        <Inline className='controlBar' gutter="2%" align="center" >
          {React.Children.map(children, child => React.cloneElement(child, {videoRef, src}))}
        </Inline>
      </div>
    </div>
  }
)

Video.Fullscreen = ({videoRef, src}) => {
  const [fullscreen, setFullscreen] = useState(document.fullscreen)

  const toggle = useCallback(() => {
    if(videoRef) setFullscreen(toggleFullscreen(videoRef.current.parentNode.parentNode))
  }, [videoRef])

  return fullScreenEnabled() && <i className={`fas fa-${fullscreen ? "minimize" : "maximize"}`} onClick={toggle} />
}

Video.Download = ({videoRef, src}) => <i className="fas fa-download" onClick={()=>{window.open(src, "_blank")}} /> 

Video.Loop = ({videoRef, src}) => {
  const [loop, setLoop] = useState(true)

  const playAgain = () => {
    if(loop) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
    }
  }
  useRefListener(videoRef, 'ended', playAgain, [src, loop])

  return <i className="fas fa-sync-alt" onClick={()=>setLoop(loop=>!loop)} style={loop?{}:{color:'#888'}} />
}

Video.PlayButton = (props) => {
  const { videoRef, src, autoPlay=false } = props
  const [playing, setPlaying] = useState(false)

  // whenever a new source is loaded, try to autoPlay
  useEffect(() => {
    if(autoPlay) {
      videoRef.current?.play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false))
    } else {
      setPlaying(false)
    }
  }, [src, videoRef.current])

  // also toggle play on clicking the video
  const toggle = ()=>setPlaying(p=>!p)
  useRefListener(videoRef, 'click', toggle, [src])

  // sync playing state with video element
  useLayoutEffect(()=>{ 
    // LayoutEffect is nescesary for safari https://lukecod.es/2020/08/27/ios-cant-play-youtube-via-react-useeffect/
    if(!videoRef.current) return
    if(playing && videoRef.current.paused) {
      videoRef.current.play()
        .catch(() => setPlaying(false))

    } else if(!playing && !videoRef.current.paused) {
      videoRef.current.pause()
    }
  }, [videoRef, playing])

  return playing
    ? <i className="fas fa-pause" onClick={()=>setPlaying(false)} /> 
    : <i className="fas fa-play" onClick={()=>setPlaying(true)}/>
}

Video.Progress = {
  useState: ({ videoRef, src }) => {
    const [curTime, setCurTime] = useState(0)
    const [duration, setDuration] = useState(0)

    function updateTimes() {
      setCurTime(videoRef.current?.currentTime || 0)
      setDuration(videoRef.current?.duration || 0)
    }

    // useEffect(updateTimes, [videoRef, src]) // init on newly loaded videos
    // useRefListener(videoRef, 'timeupdate', updateTimes) // update state on all timeupdate events
    useRefListener(videoRef, 'loadedmetadata', updateTimes) // init on newly loaded videos
    useRefListener(videoRef, 'timeupdate', updateTimes) // update state on all timeupdate events

    return {curTime, setCurTime, duration, videoRef}
  },

  Text: ({curTime, setCurTime, duration, videoRef, src, ...props}) => <span {...props}>{toHHMMSS(curTime)} / {toHHMMSS(duration)}</span>,

  Bar: ({curTime, setCurTime, duration, videoRef, src, ...props}) => {
    const progressRootRef = useRef()

    const getSeekTime = e => {
      bar = progressRootRef.current
      const seekFraction = (e.clientX - bar.getBoundingClientRect().left) / bar.offsetWidth
      const seekTime = seekFrac => seekFrac*duration || 0

      return seekTime(seekFraction)
    }

    const seek = e => {
      const video = videoRef.current
      const seekTime = getSeekTime(e)
      video.currentTime = seekTime
    }

    const drag = e => {
      if(e.buttons == 1) {
        const seekTime = getSeekTime(e)
        setCurTime(seekTime)
        const video = videoRef.current
        if(video.fastSeek) video.fastSeek(seekTime)
        else video.currentTime = seekTime
      }
    }

    return <div className="progressBar" ref={progressRootRef} {...props} onMouseMove={drag} onClick={seek} >
      <div className='bar' style={{backgroundColor:"#999", width: `${100*curTime/duration}%` }} />
      <div className="circleMarker" style={{left: `${curTime/duration*100}%`}} />
    </div>
  },
}
