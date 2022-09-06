import { initializeApp } from "firebase/app"
import { 
  getFirestore,
  doc,
  onSnapshot,
  enableIndexedDbPersistence,
  collection,
  query,
  where,
  getDocFromCache,
  getDocsFromCache,
} from "firebase/firestore"
import { getAuth, setPersistence, indexedDBLocalPersistence } from "firebase/auth";
import { useEffect, useState, useRef } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";

// Config data is imported from .env files, to allow for development to use a testing server
const firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG)

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);
export const auth = getAuth(firebase)
export const db = getFirestore(firebase)
export const cloudStorage = getStorage(firebase)

// enable firestore to be accessible offline
enableIndexedDbPersistence(db)
.catch((err) => {
  if (err.code == 'failed-precondition') {
    console.log("Multiple tabs open, firestore persistence can only be enabled in one tab at a a time.")
  } else if (err.code == 'unimplemented') {
    console.log("The current browser does not support all of the features required to enable firestore persistence.")
  }
});

// enable auth persistence
setPersistence(auth, indexedDBLocalPersistence).catch(console.error)

/**
 * @returns a fresh reference to the current user, taking user.profile from firestore
 */
export function useAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [online, setOnline] = useState(navigator.onLine);
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);

  // Listen to online state
  useEffect(()=>{
    let f = ()=>setOnline(navigator.onLine)
    window.addEventListener("online", f)
    window.addEventListener("offline", f)

    return ()=>{
      window.removeEventListener("online", f)
      window.removeEventListener("offline", f)
    }
  }, [])


  // Listen to onAuthStateChanged
  useEffect(() => {
    let unsubProfile = ()=>null

    let unsubAuth = auth.onAuthStateChanged(async (newUser) => {
      if (newUser) {
        // get firestore profile ()
        let profileDocRef = doc(db, 'users', newUser.uid)

        unsubProfile()
        unsubProfile = onSnapshot(profileDocRef, async (snap) => {
          let newProfile = snap.data()
          if(!snap.exists()) console.error(`
            This user's profile does not exist. There may be an inconsistent local firebase state.
            Try Clear-Refresh-Clear with clearing the website data (Firebase's IndexedDB).
          `)
          // console.log({snap, exists: snap.exists(), data: newProfile })
          setProfile(newProfile)

          // get updated claims token ()
          if(online && newProfile?.refreshToken !== profile?.refreshToken) {
            newUser.getIdTokenResult(true)
              .then(setToken).catch(console.error)
          }

        }, console.error)

        setUser(newUser)

      } else {
        setProfile(null)
        setUser(null)
      }
    }, console.error)

    return () => { unsubProfile(); unsubAuth(); }
  }, [online]);

  return user && {...user, ...token, profile, online }
}

/**
 * @returns the url to download an cloud storage file at @param storageLocation
 */
export function useDownloadUrl (storageLocation) {
  const [url, setUrl] = useState()
  useEffect(() => {
    if(storageLocation) getDownloadURL(ref(cloudStorage, storageLocation)).then(url => setUrl(url))
    else setUrl(undefined)
  }, [storageLocation])
  return url
}

export function useDownloadUrls(storageLocations) {
  const [urls, setUrls] = useState([])
  useEffect(() => {
    if(!storageLocations) return
    let urls = Array(storageLocations.length)

    Promise.all(storageLocations.map((location, i)=>
      location && getDownloadURL(ref(cloudStorage, location))//.then(url => urls[i]=url)
    )).then(setUrls)

  }, [storageLocations])

  return urls
}

/**
 * A shortcut to the user's memory power from user.profile.power
 * @returns a user's memory power
 */
export function useMemoryPower() {
    // shortcut to the memory power
  let user = useAuth()
  return user.profile.power
}

export const memoryResourcesDB = 'memoryResources'
export const memorySeriesDB = 'memorySeries'
export const memoryModulesDB = 'memoryModules'

/**
 * @returns the database of memory videos which are available
 */
export function useMemoryDB() {
  const resources = useFirestoreData(collection(db, memoryResourcesDB))
  const modules = useFirestoreData(collection(db, memoryModulesDB))
  const seriesList = useFirestoreData(collection(db, memorySeriesDB))

  return {resources, modules, seriesList}
}

/**
 * @returns the database of memory videos which are available
 */
export function useFirestoreData(q, fromCache=false) {
  const [values, setValues] = useState({});

  useEffect(() => {
    if(fromCache) { // optionally get data from cache
      if(q.type === "document") getDocFromCache(q).then(d => setValues(d.data()))
      else getDocsFromCache(q).then(snap => {
        data = {}
        snap.forEach(d => { data[d.id] = d.data() })
        setValues(data)
      })

    } else { // not fromCache
      let unsub = onSnapshot(q, (snap) => {
        let data = {}
        if(q.type === "document") data = snap.data()
        else snap.forEach(d => { data[d.id] = d.data() })
        setValues(data)
      })
      return unsub
    }
  }, []);

  return values
}

export function useFirestoreVariableDoc(d, fromCache=false) {
  const [valuesState, setValues] = useState({});
  const values = useRef()

  useEffect(() => {
    if(!d) return

    const query = doc(db, d)
    if(fromCache) // optionally get data from cache
      getDocFromCache(query).then(d => setValues(values.current = d.data()))
    else // not fromCache
      return onSnapshot(query, d => setValues(values.current = d.data()))

  }, [d]);

  return [valuesState, values]
}

export function useFirestoreVariableCollection(c, fromCache=false) {
  const [valuesState, setValues] = useState({});
  const values = useRef()

  useEffect(() => {
    if(!c) return

    const query = collection(db, c)
    const processData = snap => {
      data = {}
      snap.forEach(d => { data[d.id] = d.data() })
      setValues(values = data)
    }
    // optionally get data from cache
    if(fromCache) getDocsFromCache(query).then(processData)
    else return onSnapshot(query, processData)

  }, [c]);

  return [valuesState, values]
}
