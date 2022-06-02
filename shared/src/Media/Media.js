import React, { useMemo, useRef } from 'react';
import { useDownloadUrl, useDownloadUrls } from '../firebase';
import './Media.scss';
import { Video } from "./Video"
import { Dragon } from "./DragonVideo"
import { TimestampEditor } from "./TimestampEditor"
import { Cover, Frame, Inline } from '@bedrock-layout/primitives';
import { useForwardedRef } from '../util';
import { useResourceContext } from './DBResouceContext';

export { Video, Dragon, TimestampEditor }

export const CurrentMedia = (props) => {
  const {query, allResources, modules, seriesList} = useResourceContext()

  const seriesData = seriesList?.[query?.series]

  const video = allResources?.[query?.id]
  const url = useDownloadUrl(video?.location)
  
  const locations = useMemo(()=>
    video?.referencedVideos && Object.values(video.referencedVideos).map(v=>v.location)
  , [video])
  const urls = useDownloadUrls(locations)

  const src = seriesData?.format === "generated" ? urls : url
  
  const thumbnail = useDownloadUrl(video?.thumbnail)

  if(!query || !(query.series || query.module || query.id)) return ""
  if(!video) return "This video does not exist yet, try emailing us and we'll post it as soon as we can :)"

  switch(seriesData?.format) {
    case "generated":
      const generatorFormat = JSON.parse(seriesData.generatorFormat)
      if(seriesList?.[generatorFormat?.loop]?.format == "music")
        return <Music.Dragon {...{src, thumbnail, metadata: video}} />
      else if(seriesList?.[generatorFormat?.loop]?.format == "video")
        return <Dragon.Video {...{src, thumbnail, metadata: video}} />
      return ''

    case "video":
      return <Video {...{src, thumbnail}} />
    case "music":
      return <Music {...{src, thumbnail}} />
    case "pdf":
      return <PdfDisplay src={src} />
    default:
      return ''
  }
}

export function PdfDisplay(props) {
  return <Cover top={
    <Inline align="center" gutter="sm"><i className="fas fa-download" onClick={()=>{window.open(src, "_blank")}} />Download</Inline>
  }>
    <Frame ratio={[8,11]} position="50% 50%" className="pdfMedia" >
      <iframe src={props.src} />
    </Frame>
  </Cover>
}

export const Music = props => {
  const videoRef = useRef()
  const progressState = Video.Progress.useState({videoRef, src: props.src})

  return <Music.Container ref={videoRef} {...props} >
    <Video.PlayButton autoPlay={props.autoPlay} />
    <Video.Progress.Text {...progressState} />
    <Video.Progress.Bar {...progressState} />
    <Video.Loop />
    <Video.Fullscreen />
    <Video.Download />
  </Music.Container>
}

Music.Container = React.forwardRef(
  ({ src, thumbnail, children, absoluteChildren, className, ...props }, fwVideoRef) => {
    const videoRef = useForwardedRef(fwVideoRef)

    return <div className={'mediaRoot '+className}>
      <div className="absoluteContainer musicContainer">
        <audio ref={videoRef} src={src} controls={false}  
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

Music.Dragon = ({src, metadata, autoPlay, repetitionCount = 5, ...props}) => {
  src = Object.values(src)[0]
  const videoRef = useRef()
  const dragonState = Dragon.useState({videoRef, src, metadata, repetitionCount})

  return <Music.Container ref={videoRef} {...{src, autoPlay, ...props}}
    absoluteChildren={
      <Dragon.RepeatBadge {...dragonState} />
    }
  >
    <Video.PlayButton autoPlay={props.autoPlay} />
    <Dragon.TimeBar {...dragonState} />
    <Video.Loop />
    <Video.Fullscreen />
  </Music.Container>
}

