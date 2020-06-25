import React, {useState, useEffect} from 'react'
import {openDB, deleteDB, wrap, unwrap} from 'idb'

import {firebase, db, storage} from './firebase'

export function useAuth(useClaims) {
    let [user, setUser] = useState(null)
    let [claims, setClaims] = useState(null)
    if(useClaims === undefined) useClaims = false

    firebase.auth().onAuthStateChanged(async (u) => {
        if(useClaims && u != user) {
            let newClaims = u && (await u.getIdTokenResult(true)).claims
            setClaims(newClaims)
        }
        setUser(u)
    })
    // console.debug(user, claims)

    return useClaims ? [user, claims] : user
}

export var withAuth = wrappedComponent => props => {
    let [user, setUser] = useState(null)
    let [claims, setClaims] = useState(null)

    firebase.auth().onAuthStateChanged(async (u) => {
        if(u != user) {
            let newClaims = u && (await u.getIdTokenResult(true)).claims
            setClaims(newClaims)
            setUser(u)
        }
    })

    return wrappedComponent({...props, 'user': {...user, 'claims': claims}})
}

export function useFirestore(collection, reduceFn=undefined, reduceInit={}) {
    let [resources, setResources] = useState(undefined)
    if(!reduceFn) {
        reduceFn = (cum, doc) => { cum[doc.id]=doc.data(); return cum }
    }

    // load list of video resources
    useEffect(() => {
        let abort = false
        async function getResources() {
            let snapshot = await db.collection(collection).get()
            let resources = snapshot.docs.reduce(reduceFn, reduceInit)

            if(!abort) {
                setResources(resources) // Must set resources before setting scriptureSelected
            }
        }
        getResources()
        return () => abort = true;
    }, [])

    return resources
}

//
// Placeholders for now
//
export function useCachedStorage(resource) {
    // safari warned at 1.2G
    let [url, setUrl] = useState('')
    
    useEffect(() => {
        let abort = false
        async function getVideoUrl(resource) {
            const downloadUrl = await storage.ref(resource.url).getDownloadURL()
            if(!abort) setUrl(downloadUrl)
        }
        getVideoUrl(resource)
        return () => abort = true;
    }, [resource.url, resource.version])

    return url
}

export async function preCacheStorage(resources) {
}

//
// The real thing
//


// const cacheName = 'btbtb'
// const cacheMetaIdbName = 'btbtb_versions'
// const maxCache = 8 // safari warned at 1.2G

// // resource object with {url: "", version: ""}
// export function useCachedStorage(resource, cacheName = cacheName, maxCache = maxCache) {
//     // safari warned at 1.2G
//     let [url, setUrl] = useState('')
    
//     useEffect(() => {
//         let abort = false
//         async function getVideoUrl(resource) {
//             let cache = await caches.open(cacheName)
//             let newUrl = resource.url
//             let version = resource.version

//             if(!newUrl) {
//                 if(!abort) setUrl(newUrl)
//             } else if(caches) {
//                 let res = await cache.match(newUrl)
//                 if(res) {
//                     let blob = await res.blob()``
//                     if(!abort) setUrl(URL.createObjectURL(blob))
//                 } else {
//                     const downloadUrl = await storage.ref(newUrl).getDownloadURL()
                    
//                     preCacheStorage([resource])
//                     if(!abort) setUrl(downloadUrl)
//                 }
//             }
//         }
//         getVideoUrl(resource)
//         return () => abort = true;
//     }, [resource.url, resource.version])

//     return url
// }

// export async function preCacheStorage(resources) {
//     if(!caches) return
//     let cache = await caches.open(cacheName)

//     let keys = await cache.keys()
//     for(let i in resources) {
//         let url = resources[i].url
//         let version = resources[i].version

//         if(!url) continue
//         let res = await cache.match(url)
//         if(res) {
//             res = undefined
//             continue
//         }

//         let downloadUrl = await storage.ref(url).getDownloadURL()
//         // console.log(downloadUrl)

//         // cannot get without setting configuring CORS from gsutil with
//         // gsutil cors set cors.json gs://bythebookthebible.appspot.com
//         res = await fetch(downloadUrl, {
//             method:'GET',
//             mode:'cors',
//             // credentials:'include',
//         })
//         console.log(url, downloadUrl, res)
//         await cache.put(url, res)
//         res = undefined
//     }
//     console.log(keys.length)
//     for(let k in keys) {
//         let res = await cache.match(keys[k])
//         console.log(keys[k], res)
//     }
//     if(keys.length > maxCache) {
//         // if too many items stored, remove some
//     }
// }

// storeName = 'resource-cache'
// // resourceCacheStore = 'resource-cache'
// // resourceMetaStore = 'resources'
// const idb = await openDB('btbtb', '1.0.0', {
//     upgrade(db) {
//         store = db.createObjectStore(storeName, {keyPath='url'})
//         store.createIndex('accessDate', 'accessDate')
//     },
// });
// const maxCacheSize = 8 // safari warned at 1.2G

// // resource object with {url: "", version: ""}
// export function useCachedStorage(resource, cacheName = cacheName, maxCache = maxCache) {
//     // safari warned at 1.2G
//     let [url, setUrl] = useState('')

//     useEffect(() => {
//         let abort = false
//         async function getVideoUrl(resource) {
//             let cached = idb.get(storeName, resource.url)
//             if(cached && cached.version && cached.version >= resource.version) {
//                 tx.store.put({...cached, accessDate: Date.now()})
//                 if(!abort) setUrl(URL.createObjectURL(cached.blob))
//             } else {
//                 const downloadUrl = await storage.ref(resource.url).getDownloadURL()
                
//                 preCacheStorage([resource])
//                 if(!abort) setUrl(downloadUrl)
//             }
//         }
//         getVideoUrl(resource)
//         return () => abort = true;
//     }, [resource.url, resource.version])

//     return url
// }

// export async function preCacheStorage(resource, cacheName = cacheName, maxCache = maxCache) {
//     for(let r in resources) {
//         let cached = idb.get(storeName, r.url)
//         if(cached && cached.version && cached.version >= r.version) continue

//         let downloadUrl = await storage.ref(r.url).getDownloadURL()
//         // console.log(downloadUrl)

//         // cannot get without setting configuring CORS from gsutil with
//         // gsutil cors set cors.json gs://bythebookthebible.appspot.com
//         res = await fetch(downloadUrl, {
//             method:'GET',
//             mode:'cors',
//             // credentials:'include',
//         })
//         console.log(url, downloadUrl, res)
//         blob = await res.blob()
//         idb.put(storeName, {...r, blob: blob, accessDate: Date.now(), size: blob.size})
//     }

//     size = 0
//     tx = idb.transaction(storeName)
//     cursor = tx.store.index('date').openCursor(null, 'prev')
//     while (cursor) {
//         size += cursor.value.size
//         if (size > maxCacheSize) {
//             tx.store.re
//         }
//         cursor = await cursor.continue()
//     }

//     // console.log(keys.length)
//     // for(let k in keys) {
//     //     let res = await cache.match(keys[k])
//     //     console.log(keys[k], res)
//     // }
//     // if(keys.length > maxCache) {
//     //     // if too many items stored, remove some
//     // }
// }
