import './index.scss'
import { firebase, auth, db } from '../shared/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { getFunctions, httpsCallable } from "firebase/functions";
import {loadStripe} from '@stripe/stripe-js'
import { collection, doc, onSnapshot } from 'firebase/firestore';

// Config data is imported from .env files, to allow for development to use a testing server
// stripe config
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)
// firebase functions config
const firebaseFunctions = getFunctions()
const createPartnerCheckout = httpsCallable(firebaseFunctions, 'createPartnerCheckout');
const declinePartnership = httpsCallable(firebaseFunctions, 'declinePartnership');


function loadFirebase(onUpdate) {
  // special state object to track what has been loaded
  // and call onUpdate whenever something changes
  let firebaseState = new class {
    #current = undefined
    #loaded = new Set()
    get current() { return this.#current }
    get loaded() { return Array.from(this.#loaded) }
    update(objectDiff) {
      let oldState = {current: {...this.#current}, loaded: [...this.loaded]}

      Object.keys(objectDiff).map(Set.prototype.add, this.#loaded)
      this.#current = {...this.#current, ...objectDiff}

      let newState = {current: {...this.#current}, loaded: [...this.loaded]}

      onUpdate(newState, oldState)
    }
  }

  // load everything asynchronously
  async function load() {
    // online
    firebaseState.update({online: navigator.onLine});
    window.addEventListener("online", () => { firebaseState.update({online: navigator.onLine}) })
    window.addEventListener("offline", () => { firebaseState.update({online: navigator.onLine}) })


    // firestore
    function registerFirestoreSnapshots(name) {
      let query = collection(db, name)
      let unsub = onSnapshot(query, (snap) => {
        let data = {}
        snap.forEach(d => { data[d.id] = d.data() })
        firebaseState.update({[name]: data})
      })
    }

    registerFirestoreSnapshots('memoryResources')
    registerFirestoreSnapshots('memoryModules')
    registerFirestoreSnapshots('memorySeries')


    // user
    // make sure there is one immediate update callback
    firebaseState.update({user: auth.currentUser});

    let unsubProfile = ()=>null
    let unsubAuth = auth.onAuthStateChanged(async (newUser) => {
      console.log({newUser})
      if (newUser !== null) {
        // get firestore profile ()
        let profileDocRef = doc(db, 'users', newUser.uid)

        // only reregister if this is a new user
        // or else you get an infinite callback loop with the forced getIdToken
        if(!firebaseState.loaded.includes('profile') || firebaseState.current.user?.uid == newUser.uid) {
          unsubProfile()
          unsubProfile = onSnapshot(profileDocRef, async (snap) => {
            let newProfile = snap.data()
            console.log({newProfile})
            if(!snap.exists()) console.error(`
              This user's profile does not exist. There may be an inconsistent local firebase state.
              Try Clear-Refresh-Clear with clearing the website data (Firebase's IndexedDB).
            `)
            firebaseState.update({profile: newProfile})

            // get updated claims token ()
            // hopefully we can DELETE THIS CONDITION and replace it with the conditional re-registration above
            // if(firebaseState.current.online && newProfile?.refreshToken !== profile?.refreshToken) {
              newUser.getIdTokenResult(true)
                .then( t => { firebaseState.update({token: t}) } )
                .catch(console.error)
            // }

          }, console.error)
        }

        firebaseState.update({user: newUser})

      } else {
        unsubProfile()
        firebaseState.update({profile: null})
        firebaseState.update({user: null})
      }
    }, console.error)
  };


  // firebaseState = {
  //   online,
  //   user,
  //   profile,
  //   token,
  //   memoryResources,
  //   memoryModules,
  //   memorySeries,
  // }

  load() // start loading, but return before it is finished
  return firebaseState
}


document.body.onload = function(e) {
  const root = document.getElementById("root")
  console.log(root)

  let page = "loading" // "loading" | "login" | "searching" | "playing"
  let query = {} // {module: "", series: ""}

  function firebaseUpdate(newState, oldState) {
    console.log({newState, oldState, user: auth.currentUser})
    let oldPage = page
    let newPage = page

    // TODO handle offline case

    // change app page as things are loaded into firebase
    let mustLoad = ['user', 'profile', 'memoryResources', 'memoryModules', 'memorySeries',] // 'online', 'token',
    let loaded = mustLoad.map(i => {return {[i]: newState.loaded.includes(i)}})

    if(!mustLoad.every(i => newState.loaded.includes(i))) {
      newPage = "loading"

    } else if(!newState.current.user) {
      newPage = "login"

    } else if(query?.module) {
      newPage = "video"

    } else {
      newPage = "searching"
    }

    console.log({newPage, loaded})
    // innerText = newPage

    // swap pages
    if(newPage !== oldPage) {
      const pages = {
        loading: 'loading-page',
        login: 'login-page',
        video: 'video-page',
        searching: 'search-page',
      }

      let element = document.createElement(pages[newPage])
      root.replaceChildren(element)

      if(newPage == "video") { queryUpdate() }
    }
  }

  function queryUpdate() {

  }

  root.replaceChildren(document.createElement("loading-page"))
  let firebaseState = loadFirebase((newState, oldState)=>firebaseUpdate(newState, oldState))
}




















window.customElements.define('loading-page', class extends HTMLElement {
  static observedAttributes = ["message"]

  // life cycle rendering
  constructor() {
    super();
    syncAttributeProperty(this, 'message')
    attachTemplateToShadow(this, 'loading-page')
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if(name == "message")
      this.shadowRoot.getElementById("message").textContent = newValue
  }
})

window.customElements.define('loading-icon', class extends HTMLElement {
  static observedAttributes = ["color", "width"]

  constructor() {
    super();
    syncAttributeProperty(this, 'color')
    syncAttributeProperty(this, 'width')
    attachTemplateToShadow(this, 'loading-icon')
    let style = this.shadowRoot.getElementById("root").style
    style.fill = this.color
    style.width = this.width
  }
})









window.customElements.define('login-page', class extends HTMLElement {

  connectedCallback() {
    // set event handlers
    const shadowRoot = attachTemplateToShadow(this, 'login')

    this.elements = {
      createAccount: shadowRoot.getElementById("createAccount"),
      forgot: shadowRoot.getElementById("forgot"),

      email: shadowRoot.getElementById("email"),
      password: shadowRoot.getElementById("password"),
      submit: shadowRoot.getElementById("submit"),

      errorMessage: shadowRoot.getElementById("error-message"),
    }

    this.elements.createAccount.onclick = () => window.location.pathname = '/account.html'
    this.elements.forgot.onclick = () => window.location.pathname = '/forgot.html'

    this.elements.submit.onclick = e => this.submitLogin(e)
  }

  submitLogin(e) {
    e.preventDefault()

    const email = this.elements.email.value
    const password = this.elements.password.value
    if(!emailRegex.test(email)) return this.setErrorMessage("Please enter a valid email.")
    if(password.length == 0) return this.setErrorMessage("Please enter your password.")

    signInWithEmailAndPassword(auth, email, password)
      .catch(e=>this.setErrorMessage(e))
  }

  setErrorMessage(message) {
    this.elements.errorMessage.textContent = message
  }
})






/*
const user = firebase.currentUser
if(!user) renderLoginPage()

const resourceDB = firebase.getResourceDB()
const query = (new URL(window.location)).query

*/
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/

// add spinners inside buttons (or anything)
function setSpinner(node, options='color="#ccc" width="2rem"') {
  console.log(node.spinnerData)

  if(node.spinnerData === undefined) {
    node.spinnerData = {
      innerHTML: node.innerHTML,
      onclick: node.onclick,
    }
    node.onclick = e => null
    node.innerHtml = `<loading-icon color="#ccc" width="2rem"></loading-icon>`
  }
}
function clearSpinner(node) {
  console.log(node.spinnerData)

  node.onclick = node.spinnerData.onclick
  node.innerHtml = node.spinnerData.innerHtml
  node.spinnerData = undefined
}

function assert(test, message) {
  if(!test) throw message
}

// sync object properties with html attributes -- attributes are the master
function syncAttributeProperty(obj, attr) {
  Object.defineProperty(obj, attr, {
    get() {
      return this.getAttribute(attr);
    },
    set(val) {
      if(val === false || val === undefined) this.removeAttribute(attr)
      else this.setAttribute(attr, val)
    },
  });
}

function attachTemplateToShadow(obj, templateId) {
    const fragmentRoot = document.getElementById(templateId).content.cloneNode(true)
    const shadowRoot = obj.shadowRoot || obj.attachShadow({ mode: "open" });
    shadowRoot.replaceChildren(fragmentRoot);
    return shadowRoot
}

async function accountExists(email) {
    if(emailRegex.test(email)) {
        let methods = await fetchSignInMethodsForEmail(auth, email)        
        if (methods.length > 0) return true;
    }
    // switch state to login
    return false
}

async function PromiseAllObject(obj) {
  const keys = Object.keys(obj)
  const values = await Promise.all(Object.values(obj))
  return keys.reduce((output, k, i) => { output[k] = values[i] }, {})
}