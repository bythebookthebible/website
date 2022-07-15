import React, { useEffect, useMemo, useState } from 'react';
import { Stack, Inline, InlineCluster, Cover, Center } from '@bedrock-layout/primitives';

import { UserWidget } from 'bythebook-shared/dist/components';
import { friendlyScriptureRef } from 'bythebook-shared/dist/util';
import logo from '../node_modules/bythebook-shared/assets/logo.svg';
import { useResourceContext } from 'bythebook-shared/dist/components';

const defaultSeries = "Schmideo"
const defaultModule = "58-001-001-004" // James 1:1-4

export function VideoSelector({setQuery,...props}) {
  const {query, seriesList: _seriesList, modules: _modules, allResources} = useResourceContext()
  const [modules, seriesList] = useMemo(() => {
    if(!allResources) return []
    const moduleKeys = Array.from(new Set(Object.values(allResources).map(x=>x.module)))
    const seriesKeys = Array.from(new Set(Object.values(allResources).map(x=>x.series)))

    return [
      Object.fromEntries(moduleKeys.map(k=>[k,_modules[k]])),
      Object.fromEntries(seriesKeys.map(k=>[k,_seriesList[k]])),
    ]
  }, [allResources])

  const [series, setSeries] = useState(defaultSeries)
  const [module, setModule] = useState(defaultModule)

  // sync series and module states if query parameter is set
  useEffect(()=>{
    if(!query) return
    if(query.series in seriesList) setSeries(query.series)
    if(query.module in modules) setModule(query.module)
  }, [query, allResources])

  if(!query) return ''

  // options to show in the form
  const verseOptions = Object.keys(modules).reduce(
    (options, key) => {return {...options, [key]: friendlyScriptureRef(key) }}
  , {})


  const seriesOptions = !query 
    ? Object.keys(seriesList)
      .reduce(
        (options, key) => {return {...options, [key]: seriesList[key].name }}
      , {})
    : Object.entries(allResources)
      .filter( ([k, v]) => v.module===query.module)
      .map(([k, v]) => v.series)
      .reduce(
        (options, key) => {return {...options, [key]: seriesList[key].name }}
      , {})

  const getBestSeries = ({module, series}) => {
    const sameModule = Object.entries(allResources)
      .filter( ([k, v]) => v.module===module)

    const filterFor = s => !!sameModule.filter(([k,v])=>v.series === s)?.[0]

    console.log({sameModule, module, series})

    if(filterFor(series)) return series
    else if(filterFor(defaultSeries)) return defaultSeries
    else if(filterFor("Music")) return "Music"
    else return sameModule?.[0]?.[1]?.series
  }

  const getBestModule = ({module, series}) => {
    const sameSeries = Object.entries(allResources)
      .filter( ([k, v]) => v.series===series)

    const filterFor = m => !!sameSeries.filter(([k,v])=>v.module === m)?.[0]

    if(filterFor(module)) return module
    else if(filterFor(defaultModule)) return defaultModule
    else return sameSeries?.[0]?.[1]?.module
  }

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

      <Select options={verseOptions} value={module} setValue={setModule} />
      <Center className='submitArrow'><i className="fas fa-right-long" onClick={()=>module && setQuery({module, series: getBestSeries({module, series})})}/></Center>
    </Stack></Center>
  </Cover>

  // display differently if a query is already chosen
  const topBar = <Inline justify="start" stretch="end" className="topBar">
    <UserWidget />
    <InlineCluster justify="center"  gutter="lg" >
      <Select options={verseOptions} value={query.module} 
        setValue={module=>setQuery({module, series: getBestSeries({module, series})})} />
      <Select options={seriesOptions} value={query.series}
        setValue={series=>setQuery({module: getBestModule({module, series}), series})} />
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
