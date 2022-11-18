import React from 'react';
import { PadBox, Stack } from "@bedrock-layout/primitives"
import { BrowserRouter } from "react-router-dom";
import './App.scss';

import { AuthSwitch, CurrentMedia, useResourceContextProvider, useResourceContext, LoadingPage } from 'bythebook-shared/dist/components';
import { VideoSelector } from './VideoSelector';
import { MediaResults } from './MediaResults';
import { friendlyScriptureRef } from 'bythebook-shared/dist/util';

const support = <p className='supportFooter'>This software is in active development, if you have trouble, improvements, or feedback, please reach out to <a href="mailto:andrew@bythebookthebible.com">andrew@bythebookthebible.com</a></p>

export default function Wrapper() {
  return <div style={{position:"relative", minHeight:"100vh"}}>
    <BrowserRouter>
      <AuthSwitch>
        <App />
      </AuthSwitch>
    </BrowserRouter>
    {support}
  </div>
}

function App() {
  const [Provider, setQuery] = useResourceContextProvider()

  return <Provider><RenderWhenContextReady>
    <Stack>
      <VideoSelector setQuery={setQuery} />
      <CurrentMedia />
      <PadBox padding="xl">
        <CurrentDescription />
        <MediaResults setQuery={setQuery} />
      </PadBox>
    </Stack>
  </RenderWhenContextReady></Provider>
}

function RenderWhenContextReady({children}) {
  const {query} = useResourceContext()

  if(!!query) return children
  return <LoadingPage title="Loading Database." />
}

export const CurrentDescription = (props) => {
  const {query, resources, modules, seriesList} = useResourceContext()
  if(!query || !query.series || !query.module) return ''

  const {series, module, id} = query

  const seriesData = seriesList[series]
  const moduleData = modules[module]
  const videoData = resources[id]

  let heading = '', description = ''
  if(seriesData?.format === "generated") {
    description = moduleData?.description || seriesData?.description || ''
    heading = `${friendlyScriptureRef(module)} ${series} ${videoData?.title}`

  } else {
    description = videoData?.description || seriesData?.description || ''
    heading = `${friendlyScriptureRef(module)} ${series}`
  }

  return <Stack gutter="sm" >
    <b>{heading}</b>
    <p className='big-description'>{description}</p>
    <hr style={{marginBottom: "3rem"}}/>
  </Stack>
}