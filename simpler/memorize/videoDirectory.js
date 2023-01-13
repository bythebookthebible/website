import {  objectFilter, scriptureFromKey } from '../shared/util'
// import { db, cloudStorage } from '../shared/firebase';
import { initializeApp } from "firebase/app"
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  collection,
  getDocFromCache,
  getDocsFromCache,
  getDoc,
  getDocs,
} from "firebase/firestore"

// Initialize Firebase
const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG)
const firebase = initializeApp(firebaseConfig);
const db = getFirestore(firebase)
const cloudStorage = getStorage(firebase)

function getFirestoreData(query, fromCache=false) {
  let response = undefined
  
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

main();
async function main() {
  const memoryResourcesDB = 'memoryResources'
  const resources = await getFirestoreData(collection(db, memoryResourcesDB))

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

    items[book] = items[book] || {}

    items[book][module] = items[book][module]
      || {book, chapter, verses, module}

    items[book][module][series] = url

    return items
  }, {})

  // add elements to root for each schmideo
  const root = document.getElementById("root")
  let lastBook = ''

  for(const book in items) {
    // insert a title for each new book
    root.insertAdjacentHTML("beforeend", `<h2>${book}</h2>`)

    for(const module in items[book]) {
      const {chapter, verses, Music, Schmideo} = items[book][module]

      // insert a link for each video
      const title = `<div>${book} ${chapter}:${verses}</div>`
      const musicLink = Music ? `<a href="${Music}" download>Download Audio Only</a>` : '<div></div>'
      const schmideoLink = Schmideo ? `<a href="${Schmideo}" download>Download Schmideo</a>` : '<div></div>'
      root.insertAdjacentHTML("beforeend", `<div class="grid-3">${title} ${schmideoLink} ${musicLink}</div>`)
    }
  }
}
