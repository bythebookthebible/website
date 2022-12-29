import React from 'react';
import { PadBox, Stack } from "@bedrock-layout/primitives"
import { BrowserRouter, useLocation } from "react-router-dom";
import './App.scss';

import { CurrentMedia, useResourceContextProvider, useResourceContext, LoadingPage, Login, CreateAccount, ForgotPass, ManageAccount } from 'bythebook-shared/dist/components';
import { useAuth } from "bythebook-shared/dist/firebase"
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

function AuthSwitch(props) {
  // const rehydrated = useSelector(state => state._persist.rehydrated)
  let user = useAuth()
  let location = useLocation()

  console.log({user, location})

  // login / loading cases
  if(!user && location.pathname === '/account') return <CreateAccount />
  if(!user && location.pathname === '/forgot') return <ForgotPass />
  if(!user) return <Login />

  if(!user.profile) return <LoadingPage title="Loading Profile..."/> // loading profile (and claims)
  // if(!user.online) return props.children // offline mode assumes you have a valid account
  if(!(user.profile.updatedSubscription || user.profile.freePartner)) return <ManageAccount />
  if(location.pathname == '/account') return <ManageAccount /> // default is create account
  else return props.children

  // Maybe also check stripe status:
  // is stripe initialized (wait or trigger) -> preparing Account
  // stripe errors -> notification or something
}