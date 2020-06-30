import React, {useState, useEffect} from 'react'
import {openDB, deleteDB, wrap, unwrap} from 'idb'
import deepEqual from 'deep-equal'
import { diff, detailedDiff } from 'deep-object-diff'

var firebase = require('firebase')
var db = firebase.firestore()
var storage = firebase.storage()

// export function useAuth(useClaims) {
//     let [user, setUser] = useState(null)
//     let [claims, setClaims] = useState(null)
//     if(useClaims === undefined) useClaims = false

//     firebase.auth().onAuthStateChanged(async (u) => {
//         if(useClaims && u != user) {
//             let newClaims = u && (await u.getIdTokenResult(true)).claims
//             setClaims(newClaims)
//         }
//         setUser(u)
//     })
//     // console.debug(user, claims)

//     return useClaims ? [user, claims] : user
// }

export var withAuth = wrappedComponent => props => {
    let [user, setUser] = useState(null)
    let [claims, setClaims] = useState(null)

    firebase.auth().onAuthStateChanged(async (u) => {
        if(!deepEqual(u, user)) {
            // console.log('user diff', detailedDiff(u, user))
            setUser(u)
        }
    })

    useEffect(()=>{
        let abort=false
        async function updateClaims() {
            let newClaims = user && (await user.getIdTokenResult()).claims
            if(!abort) setClaims(newClaims)
        }
        updateClaims()
        return ()=>abort=true
    }, [user])

    return wrappedComponent({...props, 'user': user && claims && {...user, 'claims': claims}})
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


const cacheName = 'btbtb'
const cacheMetaStore = 'resources'
let totalCacheSize = 0
const maxCacheSize = 300*1024*1024 // safari warned "lots of energy" at 500MB, and "permission to store" at 1.2GB

// resource object with {url: "", version: ""}
export function useCachedStorage(resource) {
    let [url, setUrl] = useState('')
    
    useEffect(() => {
        let abort = false
        async function getVideoUrl(resource) {

            if(caches && resource.url) {
                let cache = await caches.open(cacheName)
                idb = await idb
                
                // update cache if needed (old or missing) but don't await
                let meta = await idb.get(cacheMetaStore, resource.url)
                let res = await cache.match(resource.url)
                console.log('meta', meta)
                if(!res || !(meta && meta.version && resource.version <= meta.version)) {
                    preCacheStorage([resource])
                }

                // serve from cache if available
                if(res) {
                    console.log('using blob')
                    let blob = await res.blob()
                    if(!abort) setUrl(URL.createObjectURL(blob))
                } else {
                    console.log('using download url')
                    const downloadUrl = await storage.ref(resource.url).getDownloadURL()
                    if(!abort) setUrl(downloadUrl)
                }
                                
            } else {
                console.warn('caching not supported')
                const downloadUrl = await storage.ref(resource.url).getDownloadURL()
                if(!abort) setUrl(downloadUrl)
            }
        }
        getVideoUrl(resource)
        return () => abort = true;
    }, [resource.url, resource.version])

    return url
}

// let resourceDataStore = 'resource-data'
// let cacheMetaStore = 'resource-meta'
deleteDB('btbtb')

let idb = openDB('btbtb', 1, {
    upgrade(db) {
        // metadata and data blobs for video/pdf content
        // let dataStore = db.createObjectStore(resourceDataStore, {keyPath: 'url'})
        let metaStore = db.createObjectStore(cacheMetaStore, {keyPath: 'url'})
        metaStore.createIndex('accessDate', 'accessDate')
    },
});

// let totalCacheSize = 0
// const maxCacheSize = 1<<9 // safari warned at 1.2G

export async function preCacheStorage(resources) {
    if(!caches) return
    let cache = await caches.open(cacheName)
    idb = await idb

    for(let r of resources) {
        let meta = await idb.count(cacheMetaStore, r.url).catch(e=>console.log(e))

        if(meta && meta.version && r.version <= meta.version) continue
        // if(meta > 0) continue
        if(!r.url) continue

        let downloadUrl = await storage.ref(r.url).getDownloadURL()

        // cannot get without setting configuring CORS from gsutil with
        // gsutil cors set cors.json gs://bythebookthebible.appspot.com
        let res = await fetch(downloadUrl, {
            method:'GET',
            mode:'cors',
            // credentials:'include',
        })
        console.log(r.url, downloadUrl, res)
        await Promise.all([
            idb.put(cacheMetaStore, {...r, accessDate: Date.now(), size: (await res.blob()).size}),
            cache.put(r.url, res),
        ]).catch(e=>console.log(e))
        console.log('freshly cached', r)

    }

    totalCacheSize = 0
    let tx = idb.transaction(cacheMetaStore, 'readwrite')
    let cursor = await tx.store.index('accessDate').openCursor(null, 'prev')
    while (cursor) {
        totalCacheSize += cursor.value.size
        if (totalCacheSize > maxCacheSize) {
            totalCacheSize -= cursor.value.size
            cursor.delete()
        }
        cursor = await cursor.continue()
    }
    console.log(totalCacheSize/1024/1024, 'MB cached')
}
