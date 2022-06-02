import React, { useMemo, useRef } from 'react';
import { Stack, Center, Frame, Split } from "@bedrock-layout/primitives"

import { useDownloadUrls } from 'bythebook-shared/dist/firebase';
import { friendlyScriptureRef, useRefListener, valuesAfter } from 'bythebook-shared/dist/util';
import { useResourceContext } from 'bythebook-shared/dist/components';

export function MediaResults({setQuery, numResults=2}) {
  const {query, resources, modules, seriesList, generatedResources, allResources} 
    = useResourceContext()

  // memoize filtering through all the videos for a list of similar videos for below
  const [similarVideos, locations] = useMemo(() => {
    if(!(query && allResources)) 
    return []

    let sameSeriesKeys = Object.entries(allResources)
      .filter( ([k, v]) => v.series===query.series).map(([k,v])=>k)
    sameSeriesKeys = valuesAfter(sameSeriesKeys, query.id, numResults)

    let sameModuleKeys = Object.entries(allResources)
      .filter( ([k, v]) => v.module===query.module).map(([k,v])=>k)
    sameModuleKeys = valuesAfter(sameModuleKeys, query.id, numResults)

    const keys = [...sameModuleKeys, ...sameSeriesKeys].filter(k=>k!=query.id)
    const similarVideos = keys.map(k=>[k, allResources[k]])
    const locations = similarVideos.map(([k,v]) => v?.location)

    return [similarVideos, locations]
  }, [query, allResources])

  const thumbnails = useDownloadUrls(locations)

  return query ? Object.keys(query).length > 0 && <Center maxWidth="50rem" >
    <Stack gutter="xl" >
      {similarVideos && thumbnails && similarVideos.map(([k, v], i) =>{
        return <VideoResult key={k} seriesList={seriesList} onClick={()=>setQuery({series:v.series, module:v.module})} videoKey={k} videoResource={v} thumbnail={thumbnails[i]} />
      })}
    </Stack>
  </Center> : ''
}

function VideoResult(props) {
  const {videoKey, videoResource, thumbnail, seriesList, ...other} = props
  const {module, series, translation, title, creator, description} = videoResource

  const special = seriesList[series]?.format === 'generated' ? 'special' : ''
  const thumbnailRef = useRef()

  // Jump past the first frame, because it is often blank right now
  useRefListener(thumbnailRef, 'loadedmetadata', ()=>{
    thumbnailRef.current.currentTime = 2.2
  }, [videoKey])

  return <Split fraction="1/3" switchAt="20rem" gutter="md" {...other}>
    <Frame ratio={[16,9]} className={'thumbnail ' + special}><video ref={thumbnailRef} muted src={thumbnail} /></Frame>
    <Stack gutter="sm" >
      <b>{friendlyScriptureRef(module)} {series} {title}</b>
      <p className='description'>{videoResource.description || seriesList[series]?.description || ''}</p>
    </Stack>
  </Split>
}
