import './index.scss'
import { firebase, auth, db } from '../sharedUI/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { getFunctions, httpsCallable } from "firebase/functions";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import {loadStripe} from '@stripe/stripe-js'
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { scriptureFromKey, keyFromScripture } from '../sharedUtil/util'

// Config data is imported from .env files, to allow for development to use a testing server
// stripe config
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)
const cloudStorage = getStorage()
// firebase functions config
const firebaseFunctions = getFunctions()
const createPartnerCheckout = httpsCallable(firebaseFunctions, 'createPartnerCheckout');
const declinePartnership = httpsCallable(firebaseFunctions, 'declinePartnership');

var firebaseState // keep this as a global state

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
      // console.log({newUser})
      if (newUser !== null) {
        // get firestore profile ()
        let profileDocRef = doc(db, 'users', newUser.uid)

        // only reregister if this is a new user
        // or else you get an infinite callback loop with the forced getIdToken
        if(!firebaseState.loaded.includes('profile') || firebaseState.current.user?.uid == newUser.uid) {
          unsubProfile()
          unsubProfile = onSnapshot(profileDocRef, async (snap) => {
            let newProfile = snap.data()
            // console.log({newProfile})
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

  let page = "loading" // "loading" | "login" | "searching" | "playing"
  let query = Object.fromEntries(new URL(window.location).searchParams) // {module: "", series: ""}

  function firebaseUpdate(newState, oldState) {
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
  firebaseState = loadFirebase((newState, oldState)=>firebaseUpdate(newState, oldState))
}




window.customElements.define('search-page', class extends HTMLElement {
  connectedCallback() {
    attachTemplateToShadow(this, 'search-page')

    const el = this.elements = {
      submit: this.shadowRoot.getElementById("submitArrow"),
      search: this.shadowRoot.querySelector('scripture-search'),
    }

    el.submit.onclick = e => {
      const value = this.elements.search.value
      window.location.search = "?module=" + value
    }
  }
})



window.customElements.define('scripture-search', class extends HTMLElement {
  // static observedAttributes = ["value"]

  // get & set this.value with the DOM elements as the master
  #value = ''
  get value() { return this.#value }

  set value(newValue) {
    const oldRef = scriptureFromKey(this.#value)
    const newRef = scriptureFromKey(newValue)

    // update book selector
    this.elements.book.value = newRef.book


    // update chapter selector
    if(!oldRef || oldRef.book !== newRef.book) {
      // refresh chapter options
      this.elements.chapter.innerHTML = Object.keys(this.activeModules[newRef.book]).reduce((html, chapter, index) => {
        return html + `<option value="${chapter}">${chapter}</option>`
      }, "")
    }
    this.elements.chapter.value = newRef.chapter


    // update verses selector
    if(!oldRef || oldRef.chapter !== newRef.chapter || oldRef.book !== newRef.book) {
      // refresh chapter options
      this.elements.verses.innerHTML = Object.keys(this.activeModules[newRef.book][newRef.chapter]).reduce((html, verses, index) => {
        return html + `<option value="${verses}">${verses}</option>`
      }, "")
    }
    this.elements.verses.value = newRef.verses

    this.#value = newValue
  }


  connectedCallback() {
    attachTemplateToShadow(this, 'scripture-search')

    let { memoryModules, memoryResources } = firebaseState.current

    const activeModules = this.activeModules = Object.values(memoryResources).reduce((books, {module}, index) => {
      if(!memoryModules.hasOwnProperty(module)) {
        console.error(`Resources for missing module "${module}" - this is an inconsistency in the database`)
        return books
      }

      const moduleInfo = memoryModules[module]

      let {book, chapter} = moduleInfo
      let verses = `${moduleInfo.startVerse}-${moduleInfo.endVerse}`

      books[book] ??= {}
      books[book][chapter] ??= {}
      books[book][chapter][verses] ??= module

      return books
    }, {})

    const el = this.elements = {
      book: this.shadowRoot.getElementById('book'),
      chapter: this.shadowRoot.getElementById('chapter'),
      verses: this.shadowRoot.getElementById('verses'),
    }


    // initialize
    el.book.innerHTML = Object.keys(activeModules).reduce((html, book, index) => {
      return html + `<option value="${book}">${book}</option>`
    }, "")

    const defaultValue = this.getAttribute('defaultValue') 
      ?? Object.values(Object.values(activeModules['James'])[0])[0]

    this.value = defaultValue

    // handlers
    el.book.onchange = e => {
      if(el.book.value !== scriptureFromKey(this.value).book) {
        this.value = Object.values(Object.values(activeModules[el.book.value])[0])[0]
      }
    }

    el.chapter.onchange = e => {
      if(el.chapter.value !== scriptureFromKey(this.value).chapter) {
        this.value = Object.values(activeModules[el.book.value][el.chapter.value])[0]
      }
    }

    el.verses.onchange = e => {
      if(el.verses.value !== scriptureFromKey(this.value).verses) {
        this.value = activeModules[el.book.value][el.chapter.value][el.verses.value]
      }
    }
  }

})








window.customElements.define('video-page', class extends HTMLElement {
  static observedAttributes = [ ]

  connectedCallback() {
    syncAttributeProperty(this, 'message')
    attachTemplateToShadow(this, 'video-page')

    const el = this.elements = {
      search: this.shadowRoot.querySelector('scripture-search'),
      video: this.shadowRoot.querySelector('video'),
    }

    // search bar handler
    const query = Object.fromEntries(new URL(window.location).searchParams) // {module: "", series: ""}
    el.search.value = query.module
    el.search.onblur = e => {
      const value = this.elements.search.value
      let url = new URL(window.location)
      url.searchParams.set('module', value)
      window.location = url.href
    }

    // get things for the video
    let { memoryModules, memorySeries, memoryResources } = firebaseState.current

    // reorder memorySeries
    let { Schmideo, Music, ...other } = memorySeries
    memorySeries = { Schmideo, Music, ...other }

    let relevantResources = Object.values(memoryResources).filter(val => val.module == query.module)

    // sort relevantResources in order of memorySeries
    relevantResources = Object.keys(memorySeries)
      .map(series => relevantResources.find(x => x.series == series))
      .filter(x => x != undefined)
    console.log({relevantResources, memoryModules, memorySeries})


    let resource = relevantResources[0]
    getDownloadURL(ref(cloudStorage, resource.location))
      .then(url => el.video.src = url)
  }

  attributeChangedCallback(name, oldValue, newValue) {
  }
})







// COPYPASTE from account
window.customElements.define('user-widget', class extends HTMLElement {
  static observedAttributes = ["expanded", "name", "email"]
  connectedCallback() {
    const shadowRoot = attachTemplateToShadow(this, 'user-widget')
    syncAttributeProperty(this, 'expanded')
    syncAttributeProperty(this, 'name')
    syncAttributeProperty(this, 'email')

    const el = this.elements = {
      root: shadowRoot.getElementById('root'),
      icon: shadowRoot.getElementById('icon'),
      name: shadowRoot.getElementById('name'),
      email: shadowRoot.getElementById('email'),
      manage: shadowRoot.getElementById('manage'),
      signout: shadowRoot.getElementById('signout'),
    }

    el.icon.onclick = () => this.expanded = !this.expanded
    el.manage.onclick = () => window.location.pathname = '/account.html'
    el.signout.onclick = () => auth.signOut()

    this.expanded = false

    auth.onAuthStateChanged(async (newUser) => {
      this.name = newUser.displayName
      this.email = newUser.email
    })
  }


  attributeChangedCallback(name, oldValue, newValue) {    
    const el = this.elements

    if(name == 'expanded') {
      // show / hide stuff
      el.name.hidden = !newValue
      el.email.hidden = !newValue
      el.manage.hidden = !newValue
      el.signout.hidden = !newValue

      if(newValue) {
        el.root.setAttribute('expanded', newValue)
      } else {
        el.root.removeAttribute('expanded')
      }
    }
    if(name == 'name') { el.name.innerText = this.name }
    if(name == 'email') { el.email.innerText = this.email }

  }
})


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




window.customElements.define('sign-out-button', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<button data-button="solid round" id="logout">Logout</button>'
    this.children.logout.onclick = e => {
      e.preventDefault()
      auth.signOut()
    }
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

function defineAllDefaultTemplates() {
  document.querySelectorAll('template[data-custom-element="shadow"').forEach(element => {
    const name = element.id

    window.customElements.define(name, class extends HTMLElement {    
      connectedCallback() {
        this.attachShadow({mode:'open'})
        this.shadowRoot.replaceChildren(element.content.cloneNode(true))
      }
    })
  })
}
defineAllDefaultTemplates()