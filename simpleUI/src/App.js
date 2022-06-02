import React from 'react';
import { PadBox, Stack } from "@bedrock-layout/primitives"
import { BrowserRouter } from "react-router-dom";
import './App.scss';

import { AuthSwitch, CurrentMedia, useResourceContextProvider, useResourceContext } from 'bythebook-shared/dist/components';
import { VideoSelector } from './VideoSelector';
import { MediaResults } from './MediaResults';
import { friendlyScriptureRef } from 'bythebook-shared/dist/util';

export default function Wrapper() {
  return <BrowserRouter>
    <AuthSwitch>
      <App />
    </AuthSwitch>
  </BrowserRouter>
}

function App() {
  const [Provider, setQuery] = useResourceContextProvider()

  return <Provider>
    <Stack>
      <VideoSelector setQuery={setQuery} />
      <CurrentMedia />
      <PadBox padding="xl">
        <CurrentDescription />
        <MediaResults setQuery={setQuery} />
      </PadBox>
    </Stack>
  </Provider>
}

export const CurrentDescription = (props) => {
  const {query, resources, modules, seriesList} = useResourceContext()
  // if(!query) 
  return ''

  // const {series, module, id} = query

  // const seriesData = seriesList[series]
  // const moduleData = modules[module]
  // const videoData = resources[id]

  // let heading = '', description = ''
  // if(seriesData?.format === "generated") {
  //   description = moduleData?.description || seriesData?.description || ''
  //   heading = `${friendlyScriptureRef(module)} ${series} ${videoData?.title}`

  // } else {
  //   description = videoData?.description || seriesData?.description || ''
  //   heading = `${friendlyScriptureRef(module)} ${series}`
  // }

  // return <Stack gutter="sm" >
  //   <b>{heading}</b>
  //   <p className='description'>{description}</p>
  //   <hr /><br />
  // </Stack>
}