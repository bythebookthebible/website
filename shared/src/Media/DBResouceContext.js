import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { objectFilter, ArrayAll, objectMap } from '../util';
import { useMemoryDB, firestoreCacheKey, useOnlineStatus } from '../firebase';

const ResourcesContext = React.createContext({})

export function useResourceContext() {
  return useContext(ResourcesContext)
}

export function useResourceContextProvider() {
  // fetch from firestore
  const {resources: _resources, modules, seriesList} = useMemoryDB()
  const online = useOnlineStatus()

  // add "cached" marker to resources
  const [resources, setResources] = useState({})
  useEffect(async () => {
    const cache = await self.caches?.open("media")

    const resourceEntries = Object.entries(_resources)
    const isCached = await Promise.all(resourceEntries.map(
      ([key, resource], index) => cache.match(firestoreCacheKey(resource?.location))
    ))

    const r = Object.fromEntries(resourceEntries.map(([key, resource], index) => {
      return [key, {...resource, isCached: !!isCached[index]}]
    }))
    setResources(r)
  }, [_resources, online]) // TODO: should also update whenever cache contents is updated!
  console.log({resources, _resources})

  // generate derivative resources
  const generatedResources = useGeneratedResources({resources, modules, seriesList})
  const allResources = {...resources, ...generatedResources}
  const offlineResources = objectFilter(allResources, (k,v)=>v.isCached)
  const [query, setQuery] = useNormalizedQuery({allResources, resources, modules, seriesList})

  // share this as all-or-nothing -- saves on checking each bit alone
  const ready = query && ArrayAll([resources, modules, seriesList, generatedResources, allResources],
    x => Object.keys(x).length > 0) // query can be empty, but others cannot

  const context =
    ready ? {query, resources, modules, seriesList, generatedResources, allResources, offlineResources} : {}

  console.log({query, resources, modules, seriesList, generatedResources, allResources, offlineResources})

  return [
    props => <ResourcesContext.Provider value={context}>
      {props.children}
    </ResourcesContext.Provider>,
    setQuery,
  ]
}

function useNormalizedQuery({allResources, resources, modules, seriesList}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = Object.fromEntries(searchParams.entries())
  const setQuery = query => {
    setSearchParams(objectFilter(query, (k,v) => v!=undefined))
  }

  let normalized = query
  if(!query) return [{}, setQuery]
  if(!allResources) return [{}, setQuery]

  if(query.id in allResources) {
    // id based query
    normalized.series = allResources[query.id].series
    normalized.module = allResources[query.id].module

  } else if(allResources && query.series in seriesList && query.module in modules) {
    // series & module based query
    normalized.id = Object.keys(allResources)
      .filter( k => allResources[k].series === query.series && allResources[k].module === query.module)?.[0]

  } else if(query.series || query.module) {
    // handle incomplete query
    normalized.id = Object.keys(allResources)
      .filter( k => allResources[k].series === query.series || allResources[k].module === query.module)?.[0]

  } else {
    // else empty or invalid query
    normalized = {}
    if(Object.keys(query).length > 0) console.warn("Unexpected query", query)
  }

  return [normalized, setQuery]
}

// create generated resources without a db entry
function useGeneratedResources({resources, modules, seriesList}) {
  return useMemo(() => {
    if(!(resources && modules && seriesList)) return undefined

    const moduleKeys = Object.keys(modules)
    const generatedSeries = Object.entries(seriesList)
      .filter( ([k,v]) => v.format == "generated").map(([k,v])=>k)

    const generatedResources = moduleKeys.map(module => {
      return generatedSeries.map(series => {
        return getGeneratedVideoMetadata({module, series, resources, seriesList})
      }).filter(k=>k) // generator above returns false when invalid generator data
    }).reduce((all, cur) => ([...all, ...cur]), []) // flatten the 2d array map

    return Object.fromEntries(generatedResources)
  }, [resources, modules, seriesList])
}

function getGeneratedVideoMetadata({series, module, resources, seriesList}) {
  const seriesData = seriesList[series]
  const format = seriesData.generatorFormat && JSON.parse(seriesData.generatorFormat)
  const referencedSeries = format.loop && [format.loop] || format?.interlace

  const referencedVideos = Object.entries(resources)
    .filter(([k,v]) => v.module===module && referencedSeries.includes(v.series))

  // check if invalid conditions for generator
  if(!(format && referencedVideos.length === referencedSeries.length && ArrayAll(referencedVideos, ([k,v])=>!!v.timestamps)))
    return undefined

  // if(referencedVideos.length == 1)
  //   return [`${module}-bythebook-${series}-generated`, {...referencedVideos[0], ...seriesData, series, module}]
  // else
  return [`${module}-bythebook-${series}-generated`, {
    referencedVideos: Object.fromEntries(referencedVideos),
    isCached: ArrayAll(referencedVideos, ([k,v])=>v.isCached),
    ...seriesData, series, module,
  }]

}
