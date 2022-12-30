import { db, cloudStorage } from '../shared/firebase';
import {  objectFilter, scriptureFromKey } from '../shared/util'
import { 
  collection,
  getDocFromCache,
  getDocsFromCache,
  getDoc,
  getDocs,
} from "firebase/firestore"
import { ref, getDownloadURL } from "firebase/storage";

main();
async function main() {
  const {resources, modules, seriesList} = await getMemoryDB()

  // these come presorted by UID which is also in the Bible's order
  const schmideos = objectFilter(resources, (k,v) => v.series === 'Schmideo' || v.series === 'Music')
  console.log({schmideos})

  // whatever api call is with getDownloadURL, I want to do it in parallel (maybe network?)
  const withUrls = await Promise.all(Object.entries(schmideos).map(async ([k,v],i) => {
    const {book, chapter, verses} = scriptureFromKey(v.module)
    const url = await getDownloadURL(ref(cloudStorage, v.location))
      .then(u => {
        let u2 = new URL(u)
        u2.searchParams.delete("token")
        return u2.href
      })
      .catch(err => {
        console.error(err)
        return ''
      })
    return {...v, book, chapter, verses, url}
  }))
  withUrls.filter(s=>s.url != '')
  console.log({url: withUrls.map(s=>s.url)})

  // convert the data structure into what I will display
  const items = withUrls.reduce((items, newItem) => {
    const {book, chapter, verses, url, module, series} = newItem

    items[module] = items[module]
      || {book, chapter, verses, module}

    items[module][series] = url

    return items
  }, {})

  // add elements to root for each schmideo
  const root = document.getElementById("root")
  let lastBook = ''

  for(const i in items) {
    const {book, chapter, verses, Music, Schmideo} = items[i]

    // insert a title for each new book
    if(book !== lastBook) {
      root.insertAdjacentHTML("beforeend", `<h2>${book}</h2>`)
      lastBook = book
    }

    // insert a link for each video
    const title = `<div>${book} ${chapter}:${verses}</div>`
    const musicLink = Music ? `<a href="${Music}" download>Download Music</a>` : '<div></div>'
    const schmideoLink = Schmideo ? `<a href="${Schmideo}" download>Download Schmideo</a>` : '<div></div>'
    root.insertAdjacentHTML("beforeend", `<div class="grid-3">${title} ${schmideoLink} ${musicLink}</div>`)
  }

}



async function getMemoryDB() {
  const memoryResourcesDB = 'memoryResources'
  const memorySeriesDB = 'memorySeries'
  const memoryModulesDB = 'memoryModules'
  
  const [resources, modules, seriesList] = await Promise.all([
    getFirestoreData(collection(db, memoryResourcesDB)),
    getFirestoreData(collection(db, memoryModulesDB)),
    getFirestoreData(collection(db, memorySeriesDB)),
  ])

  return {resources, modules, seriesList}
}

function getFirestoreData(query, fromCache=false) {
  let response = undefined

  console.log({type: query.type, fromCache, query})
  
  // set response with the promsise according to the options
  // and transform data accordingly
  if(query.type === "document") {
    if(fromCache) response = getDocFromCache(query)
    else response = getDoc(query)

    response = response.then(d => d.data())

  } else { // query is a collection type
    if(fromCache) response = getDocsFromCache(query)
    else response = getDocs(query)

    response = response.then(snap => {
      let data = {}
      snap.forEach(d => { data[d.id] = d.data() })
      return data
    })
  }

  return response
}
