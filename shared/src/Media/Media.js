import React, { useEffect, useMemo, useRef } from 'react';
import { useDownloadUrl, useDownloadUrls, useFirebaseStorageURL, useOnlineStatus } from '../firebase';
import './Media.scss';
import { Video } from "./Video"
import { Dragon } from "./DragonVideo"
import { TimestampEditor } from "./TimestampEditor"
import { Center, Cover, Frame, Inline } from '@bedrock-layout/primitives';
import { useForwardedRef, ensureCached } from '../util';
import { useResourceContext } from './DBResouceContext';
import joSchmo from '../../assets/JoSchmoWhat.png'
export { Video, Dragon, TimestampEditor }

export const CurrentMedia = (props) => {
  const {query, allResources, modules, seriesList} = useResourceContext()
  const online = useOnlineStatus()

  const seriesData = seriesList?.[query?.series]

  const video = allResources?.[query?.id]
  const {downloadUrl, cacheKey} = useFirebaseStorageURL(video?.location)
  const url = online ? downloadUrl : cacheKey

  // Add to the cache because <video> range requests won't fill cache
  // @Cleanup eventually want to combine range requests for the cache
  useEffect(async ()=>{
    if(online && url && self.caches) {
      let cache = await caches.open("media")
      let match = await cache.match(cacheKey)

      if(!match) {
        fetch(url).then((response) => {
          if (!response.ok) {
            throw new TypeError("bad response status");
          }
          return cache.put(cacheKey, response);
        })
        .catch(e=>console.error("cache add failed", e))
      }
    }
  }, [url, online])

  const locations = useMemo(()=>
    video?.referencedVideos && Object.values(video.referencedVideos).map(v=>v.location)
  , [video])
  const urls = useDownloadUrls(locations)

  const src = seriesData?.format === "generated" ? urls : url

  const thumbnail = useDownloadUrl(video?.thumbnail)

  if(!query || !(query.series || query.module || query.id)) return ""
  if(!video) return <Center centerChildren centerText >
    We havent uploaded this yet, maybe you can try another video, and come back again later.
    <img src={joSchmo} style={{height: "30vmin", maxHeight:"20rem"}} />
  </Center>

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

