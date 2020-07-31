import React, {useState, useEffect, useRef} from 'react'
import {openDB, deleteDB, wrap, unwrap} from 'idb'
import deepEqual from 'deep-equal'
import { diff } from 'deep-object-diff'

import {firebase, db, storage} from './firebase'

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

// this pattern is used enough I wanted to encapsulate it
export function useAsyncEffect(fn=()=>undefined, deps=[]) {
    let abort = useRef(false)
    useEffect(() => {
        fn(abort)
        return ()=>abort.current=true
    }, deps)
}

export var withAuth = wrappedComponent => props => {
    let [user, setUser] = useState(firebase.auth().currentUser)
    let [claims, setClaims] = useState(undefined)

    firebase.auth().onAuthStateChanged(async (u) => {
        if(!deepEqual(u, user)) {
            // console.log('user diff', detailedDiff(u, user))
            setUser(u)
        }
    })

    async function refresh() {
        console.log('refreshing')
        let user = firebase.auth().currentUser
        setUser(firebase.auth().currentUser)
        let newClaims = user && (await user.getIdTokenResult(true)).claims
        setClaims(newClaims)
    }

    useAsyncEffect(async abort => {
        let newClaims = user && (await user.getIdTokenResult()).claims
        setClaims(newClaims)
    }, [user])

    return wrappedComponent({...props, 'user': user && claims && {...user, 'claims': claims}, refreshUser:refresh})
}

export function useFirestore(collection, reduceFn=undefined, reduceInit={}) {
    let [resources, setResources] = useState(undefined)
    if(!reduceFn) {
        reduceFn = (cum, doc) => { cum[doc.id]=doc.data(); return cum }
    }

    // load list of video resources
    useAsyncEffect(async abort => {
        let snapshot = await db.collection(collection).get()
        let resources = snapshot.docs.reduce(reduceFn, reduceInit)

        if(!abort.current) setResources(resources)
    }, [])
    
    return resources
}

export function useFirestoreState(ref, onload) {
    let [data, setData] = useState(undefined)

    // initial fetch from firestore
    useAsyncEffect(async abort => {
        let snapshot = await db.doc(ref).get()
        let data = snapshot.data() || {} // create new object if not exist
        console.log('data from firebase', data)
        // .docs.reduce(
        //     (cum, doc) => { cum[doc.id]=doc.data(); return cum }, {}
        // )

        if(!abort.current) {
            setData(data)
            onload(data)
        }
    }, [])
    
    // update function
    function updateData(newData) {
        let d = diff(data, newData)
        // TODO: less hacky fix to diff of mp wrongly being 0
        if (d.memoryPower) {
            d.memoryPower = Object.entries(d.memoryPower)
                .filter(([k,v])=>v.power>0)
                .reduce((obj, [k,v])=>{obj[k]=v; return obj}, {})
            d.memoryPower = deepEqual(d.memoryPower, {}) ? undefined : d.memoryPower
        }
        
        d = Object.entries(d)
            .filter(([k,v])=>v!=undefined)
            .reduce((obj, [k,v])=>{obj[k]=v; return obj}, {})
        console.log('updating firebase:', data, newData, d)

        db.doc(`${ref}`).set(d, {merge: true})
        setData(newData)
        // go through the changed values, and upload to fb
        // update data state
        // do not update if not loaded yet
    }

    return [data, updateData]
}

export function useIdbState(ref, onload) {
    let [data, setData] = useState(undefined)

    // initial fetch from idb
    useAsyncEffect(async abort => {
        onload(data)
    }, [])
    
    // update function
    function updateData(newData) {
        console.log(diff(data, newData))
        // go through the changed values, and upload to fb
        // update data state
        // do not update if not loaded yet
    }

    return [data, updateData]
}

const cacheName = 'btbtb'
const cacheMetaStore = 'resources'
let totalCacheSize = 0
const maxCacheSize = 300*1024*1024 // safari warned "lots of energy" at 500MB, and "permission to store" at 1.2GB

// resource object with {url: "", version: ""}
export function useCachedStorage(resource) {
    let [url, setUrl] = useState('')
    
    useAsyncEffect(async abort => {
        //console.log(caches, resource.url)

        if(idb && resource.url) {
            // let cache = await caches.open(cacheName)
            idb = await idb
            console.log('IDB after await:', idb)
            
            let meta = await idb.get(cacheMetaStore, resource.url)
            let res = await idb.transaction(cacheMetaStore).objectStore(cacheMetaStore).get(resource.url)
            console.log('New RES:', res)
            console.log('meta', meta)
            // update cache if needed (old or missing) but don't await
            if(!res || !(meta && meta.version && resource.version <= meta.version)) {
                preCacheStorage([resource])
                console.log("precachestorage is called")
            }

            // serve from cache if available
            if(res) {
                console.log('using blob')
                let blob = res.file
                console.log('making sure blob is here:', blob)
                if(!abort.current) setUrl(URL.createObjectURL(blob))
            } else {     
                console.log('using download url')
                const downloadUrl = await storage.ref(resource.url).getDownloadURL()
                if(!abort.current) setUrl(downloadUrl)
            }

        } else {
            if(resource.url) {
                const downloadUrl = await storage.ref(resource.url).getDownloadURL()
                if(!abort.current) setUrl(downloadUrl)
            }
            if(!idb) {
                console.warn('caching not supported')
            }
        }
    }, [resource.url, resource.version])
    
    return url
}

// let resourceDataStore = 'resource-data'
// let cacheMetaStore = 'resource-meta'
// deleteDB('btbtb')

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
    // if(!caches) return
    // let cache = await caches.open(cacheName)
    // idb = await idb

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
        let resBlob = await res.clone().blob()
        console.log(r.url, downloadUrl, res)
        console.log('clone:', res.clone())
        console.log('res: ', resBlob)
        // console.log('trying to reach into BLOB:', resCloned['PromiseValue'])
        console.log('URL from blob:', URL.createObjectURL(resBlob))
        await Promise.all([
            idb.put(cacheMetaStore, {...r, file: resBlob, accessDate: Date.now(), size: resBlob.size}),
            // cache.put(r.url, res),
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












// ORIGINAL CODE just in case

// import React, {useState, useEffect} from 'react'
// import {openDB, deleteDB, wrap, unwrap} from 'idb'
// import deepEqual from 'deep-equal'
// import { diff } from 'deep-object-diff'

// import {firebase, db, storage} from './firebase'

// // export function useAuth(useClaims) {
// //     let [user, setUser] = useState(null)
// //     let [claims, setClaims] = useState(null)
// //     if(useClaims === undefined) useClaims = false

// //     firebase.auth().onAuthStateChanged(async (u) => {
// //         if(useClaims && u != user) {
// //             let newClaims = u && (await u.getIdTokenResult(true)).claims
// //             setClaims(newClaims)
// //         }
// //         setUser(u)
// //     })
// //     // console.debug(user, claims)

// //     return useClaims ? [user, claims] : user
// // }

// export var withAuth = wrappedComponent => props => {
//     let [user, setUser] = useState(firebase.auth().currentUser)
//     let [claims, setClaims] = useState(undefined)

//     firebase.auth().onAuthStateChanged(async (u) => {
//         if(!deepEqual(u, user)) {
//             // console.log('user diff', detailedDiff(u, user))
//             setUser(u)
//         }
//     })

//     async function refresh() {
//         console.log('refreshing')
//         let user = firebase.auth().currentUser
//         setUser(firebase.auth().currentUser)
//         let newClaims = user && (await user.getIdTokenResult(true)).claims
//         setClaims(newClaims)
//     }

//     useEffect(()=>{
//         let abort=false
//         async function updateClaims() {
//             let newClaims = user && (await user.getIdTokenResult()).claims
//             if(!abort) setClaims(newClaims)
//         }
//         updateClaims()
//         return ()=>abort=true
//     }, [user])

//     return wrappedComponent({...props, 'user': user && claims && {...user, 'claims': claims}, refreshUser:refresh})
// }

// export function useFirestore(collection, reduceFn=undefined, reduceInit={}) {
//     let [resources, setResources] = useState(undefined)
//     if(!reduceFn) {
//         reduceFn = (cum, doc) => { cum[doc.id]=doc.data(); return cum }
//     }

//     // load list of video resources
//     useEffect(() => {
//         let abort = false
//         async function getResources() {
//             let snapshot = await db.collection(collection).get()
//             let resources = snapshot.docs.reduce(reduceFn, reduceInit)

//             if(!abort) {
//                 setResources(resources) // Must set resources before setting scriptureSelected
//             }
//         }
//         getResources()
//         return () => abort = true;
//     }, [])

//     return resources
// }

// export function useFirestoreState(ref, onload) {
//     let [data, setData] = useState(undefined)

//     // initial fetch from firestore
//     useEffect(()=>{
//         let abort = false
//         async function getResources() {
//             let snapshot = await db.doc(ref).get()
//             let data = snapshot.data() || {} // create new object if not exist
//             console.log('data from firebase', data)
//             // .docs.reduce(
//             //     (cum, doc) => { cum[doc.id]=doc.data(); return cum }, {}
//             // )

//             if(!abort) {
//                 setData(data)
//                 onload(data)
//             }
//         }
//         getResources()
//         return () => abort = true;
//     }, [])

//     // update function
//     function updateData(newData) {
//         let d = diff(data, newData)
//         // TODO: less hacky fix to diff of mp wrongly being 0
//         if (d.memoryPower) {
//             d.memoryPower = Object.entries(d.memoryPower)
//                 .filter(([k,v])=>v.power>0)
//                 .reduce((obj, [k,v])=>{obj[k]=v; return obj}, {})
//             d.memoryPower = deepEqual(d.memoryPower, {}) ? undefined : d.memoryPower
//         }
        
//         d = Object.entries(d)
//             .filter(([k,v])=>v!=undefined)
//             .reduce((obj, [k,v])=>{obj[k]=v; return obj}, {})
//         console.log('updating firebase:', data, newData, d)

//         db.doc(`${ref}`).set(d, {merge: true})
//         setData(newData)
//         // go through the changed values, and upload to fb
//         // update data state
//         // do not update if not loaded yet
//     }

//     return [data, updateData]
// }

// export function useIdbState(ref, onload) {
//     let [data, setData] = useState(undefined)

//     // initial fetch from idb
//     useEffect(()=>{
//         let abort = false
//         async function getResources() {
//             // fetch from idb
//             onload(data)
//         }
//         getResources()
//         return () => abort = true;
//     }, [])

//     // update function
//     function updateData(newData) {
//         console.log(diff(data, newData))
//         // go through the changed values, and upload to fb
//         // update data state
//         // do not update if not loaded yet
//     }

//     return [data, updateData]
// }

// const cacheName = 'btbtb'
// const cacheMetaStore = 'resources'
// let totalCacheSize = 0
// const maxCacheSize = 300*1024*1024 // safari warned "lots of energy" at 500MB, and "permission to store" at 1.2GB

// // resource object with {url: "", version: ""}
// export function useCachedStorage(resource) {
//     let [url, setUrl] = useState('')
    
//     useEffect(() => {
//         let abort = false
//         async function getVideoUrl(resource) {
//             console.log('CACHES:', caches, resource.url)
//             if(caches && resource.url) {
//                 let cache = await caches.open(cacheName)
//                 idb = await idb
                
//                 let meta = await idb.get(cacheMetaStore, resource.url)
//                 let res = await cache.match(resource.url)
//                 console.log('meta', res, meta, idb)
//                 // update cache if needed (old or missing) but don't await
//                 if(!res || !(meta && meta.version && resource.version <= meta.version)) {
//                     preCacheStorage([resource])
//                     console.log("precachestorage is called")
//                 }

//                 // serve from cache if available
//                 if(res) {
//                     console.log('using blob')
//                     let blob = await res.blob()
//                     if(!abort) setUrl(URL.createObjectURL(blob))
//                 } else {
//                     console.log('using download url')
//                     const downloadUrl = await storage.ref(resource.url).getDownloadURL()
//                     if(!abort) setUrl(downloadUrl)
//                 }

//             } else {
//                 if(resource.url) {
//                     const downloadUrl = await storage.ref(resource.url).getDownloadURL()
//                     if(!abort) setUrl(downloadUrl)
//                 }
//                 if(!caches) {
//                     console.warn('caching not supported')
//                 }
//             }
//         }
//         getVideoUrl(resource)
//         return () => abort = true;
//     }, [resource.url, resource.version])

//     return url
// }

// // let resourceDataStore = 'resource-data'
// // let cacheMetaStore = 'resource-meta'
// deleteDB('btbtb')

// let idb = openDB('btbtb', 1, {
//     upgrade(db) {
//         // metadata and data blobs for video/pdf content
//         // let dataStore = db.createObjectStore(resourceDataStore, {keyPath: 'url'})
//         let metaStore = db.createObjectStore(cacheMetaStore, {keyPath: 'url'})
//         metaStore.createIndex('accessDate', 'accessDate')
//     },
// });

// // let totalCacheSize = 0
// // const maxCacheSize = 1<<9 // safari warned at 1.2G

// export async function preCacheStorage(resources) {
//     if(!caches) return
//     let cache = await caches.open(cacheName)
//     idb = await idb

//     for(let r of resources) {
//         let meta = await idb.count(cacheMetaStore, r.url).catch(e=>console.log(e))

//         if(meta && meta.version && r.version <= meta.version) continue
//         // if(meta > 0) continue
//         if(!r.url) continue

//         let downloadUrl = await storage.ref(r.url).getDownloadURL()

//         // cannot get without setting configuring CORS from gsutil with
//         // gsutil cors set cors.json gs://bythebookthebible.appspot.com
//         let res = await fetch(downloadUrl, {
//             method:'GET',
//             mode:'cors',
//             // credentials:'include',
//         })
//         console.log(r.url, downloadUrl, res)
//         await Promise.all([
//             idb.put(cacheMetaStore, {...r, accessDate: Date.now(), size: (await res.blob()).size}),
//             cache.put(r.url, res),
//         ]).catch(e=>console.log(e))
//         console.log('freshly cached', r)

//     }

//     totalCacheSize = 0
//     let tx = idb.transaction(cacheMetaStore, 'readwrite')
//     let cursor = await tx.store.index('accessDate').openCursor(null, 'prev')
//     while (cursor) {
//         totalCacheSize += cursor.value.size
//         if (totalCacheSize > maxCacheSize) {
//             totalCacheSize -= cursor.value.size
//             cursor.delete()
//         }
//         cursor = await cursor.continue()
//     }
//     console.log(totalCacheSize/1024/1024, 'MB cached')
// }
