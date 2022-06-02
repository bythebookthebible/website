import React, { useEffect, useState } from 'react';
import { Stack, Inline, InlineCluster, Cover, Center } from '@bedrock-layout/primitives';

import { UserWidget } from 'bythebook-shared/dist/components';
import { friendlyScriptureRef } from 'bythebook-shared/dist/util';
import logo from '../node_modules/bythebook-shared/assets/logo.svg';
import { useResourceContext } from 'bythebook-shared/dist/components';

export function VideoSelector({setQuery,...props}) {
  const {query, modules, seriesList} = useResourceContext()

  const [series, setSeries] = useState('schmideo')
  const [module, setModule] = useState()

  // sync series and module states if query parameter is set
  useEffect(()=>{
    if(!query) return
    if(query.series in seriesList) setSeries(query.series)
    if(query.module in modules) setModule(query.module)
  }, [query, modules, seriesList])

  if(!query) return ''

  // options to show in the form
  const verseOptions = Object.keys(modules).reduce(
    (options, key) => {return {...options, [key]: friendlyScriptureRef(key) }}
  , {})
  const seriesOptions = Object.keys(seriesList).reduce(
    (options, key) => {return {...options, [key]: seriesList[key].name }}
  , {})

  // if no query yet, then show a googly simple page
  const fullPage = <Cover minHeight="70vh" className="titlePage" top={<UserWidget/>}>
    <Center centerChildren centerText maxWidth="30rem"><Stack gutter="xl">
      <div className="titleHack">
        <Inline align="center" gutter="md" className="title">
          <img src={logo} className="icon" />
          By the Book
        </Inline>
        <span>memorize the context</span>
      </div>

      <Select options={verseOptions} value={module} setValue={setModule} unselectedText="Passage" />
      <Center className='submitArrow'><i className="fas fa-right-long" onClick={()=>module && setQuery({series, module})}/></Center>
    </Stack></Center>
  </Cover>

  // display differently if a query is already chosen
  const topBar = <Inline justify="start" stretch="end" className="topBar">
    <UserWidget />
    <InlineCluster justify="center"  gutter="lg" >
      <Select options={verseOptions} value={query.module} unselectedText="Passage" 
        setValue={module=>setQuery({module, series: query.series})} />
      <Select options={seriesOptions} value={query.series} unselectedText="Resource"
        setValue={series=>setQuery({module: query.module, series})} />
    </InlineCluster>
  </Inline>

  return Object.keys(query).length == 0 ? fullPage : topBar
}

function Select(props) {
  let { options, value, setValue, unselectedText, ...other } = props

  // toggle within array list if multiple selection, else no array
  let onChange
  if (props.multiple) {
    onChange = v => {
      let set = new Set(value)
      let newValue = v.target.value
      if(set.has(newValue)) set.delete(newValue)
      else set.add(newValue)

      setValue(Array.from(set.keys()))
    }
  } else {
    onChange = v => { setValue(v.target.value) }
  }

  return <select {...other} value={value} onChange={onChange} >
    {unselectedText && <option value={undefined} selected={value==undefined} disabled={true}>{unselectedText}</option>}
    {Object.entries(options).map(([key, name]) => <option value={key} key={key}>{name}</option>)}
  </select>
}
