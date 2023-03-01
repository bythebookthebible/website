import './index.scss'
import { firebase, auth, db } from '../shared/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail, updateProfile, onAuthStateChanged } from 'firebase/auth'
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
const getPartnershipStatus = httpsCallable(firebaseFunctions, 'getPartnershipStatus');
const manageBilling = httpsCallable(firebaseFunctions, 'createBillingManagementSession');

 
// COPYPASTE FROM index.js
function loadFirebase(handlers) {
  handlers.onUpdate = handlers.onUpdate || (()=>null)
  handlers.onAuthStateChanged = handlers.onAuthStateChanged || (()=>null)
  handlers.onProfileSnapshot = handlers.onProfileSnapshot || (()=>null)
  
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

      // let newState = {current: {...this.#current}, loaded: [...this.loaded]}

      handlers.onUpdate(this, oldState)
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
      handlers.onAuthStateChanged(newUser, firebaseState)
      if (newUser !== null) {
        // get firestore profile ()
        let profileDocRef = doc(db, 'users', newUser.uid)

        // only reregister if this is a new user
        // or else you get an infinite callback loop with the forced getIdToken
        if(!firebaseState.loaded.includes('profile') || firebaseState.current.user?.uid == newUser.uid) {
          unsubProfile()
          unsubProfile = onSnapshot(profileDocRef, async (snap) => {
            handlers.onProfileSnapshot(snap, firebaseState)
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

  let page = "loading" // "loading" | "login" | "searching" | "playing"
  let query = {} // {module: "", series: ""}


  function firebaseUpdate(newState, oldState) {
    let oldPage = page
    let newPage = page

    let {user, profile} = newState.current

    // TODO handle offline case

    // change app page as things are loaded into firebase
    let mustLoad = ['user', 'profile'] // 'memoryResources', 'memoryModules', 'memorySeries', 'online', 'token',
    let loaded = mustLoad.map(i => {return {[i]: newState.loaded.includes(i)}})

    if(!mustLoad.every(i => newState.loaded.includes(i))) {
      newPage = "loading"

    } else if(!newState.current.user) {
      newPage = "createAccount"

    } else if(!newState.loaded.includes('partnerRate')) {
      newPage = "loading"
    } else {
      newPage = "manageAccount"
    }

    console.log({newPage, loaded})
    // innerText = newPage

    // swap pages if needed
    if(newPage !== oldPage) {
      const pages = {
        loading: 'loading-page',
        createAccount: 'create-account',
        manageAccount: 'manage-account',
      }

      let element = document.createElement(pages[newPage])
      root.replaceChildren(element)
    }

    // update attributes
    if(newPage == "manageAccount") {
      let element = root.children[0]

      element.setAttribute('partnerRate', newState.current.partnerRate)

      const isSubscribed = profile && profile?.partnerSince && !profile?.freePartner
      if(isSubscribed) {
        element.setAttribute('subscribed', "true")

      } else {
        element.removeAttribute('subscribed')
      }
    }
  }


  function onAuthStateChanged(user, state) {
    if(!state.loaded.includes('partnerRate') || state.current.user?.uid == user.uid) {
      getPartnershipStatus().then(({data}) => {
        console.log({data, length: data.length})

        if(data.length > 1) console.warn("You seem to have multiple active subscriptions, is this correct?")
        if(data.length == 0) {
          // not subscribed in stripe
          state.update({partnerRate: 0})
          return
        }

        const subscription = data[0]
        console.log({subscription})

        const subItem = subscription.items.data[0]
        const partnerRate = subItem.quantity * subItem.price.unit_amount / 100
        console.log({partnerRate})

        state.update({partnerRate})
      })
    }
  }

  root.replaceChildren(document.createElement("loading-page"))
  let firebaseState = loadFirebase({onUpdate: firebaseUpdate, onAuthStateChanged})
}










window.customElements.define('create-account', class extends HTMLElement {
  // life cycle rendering

  // constructor() {}
  // attributeChangedCallback(name, oldValue, newValue) {}
  
  connectedCallback() {
    const root = attachTemplateToShadow(this, 'create-account')

    const elements = {
      name: root.getElementById("name"),
      email: root.getElementById("email"),
      password: root.getElementById("password"),
      price: root.getElementById("price"),
      submit: root.getElementById("submit"),
      login: root.getElementById("login"),
      errorMessage: root.getElementById("errorMessage"),
    }
    this.elements = elements


    elements.login.onclick = ()=>window.location.pathname = "/"
    elements.submit.onclick = e => this.submitForm(e)
  }


  setErrorMessage(e) {
    let msg = e.message || e 

    // Change some error messages
    if (e.code === 'auth/wrong-password') {
        msg = 'Invalid Password.'
    }
    if (e.code === 'auth/user-not-found') {
        // Original message: "There is no user record corresponding to this identifier. The user may have been deleted."
        msg = 'There is no user registered with that email address.'
    }

    console.warn(msg, e);
    this.elements.errorMessage.innerText = msg
  }


  async submitForm(e) {
    e.preventDefault();

    let email    = this.elements.email.value
    let password = this.elements.password.value
    let name     = this.elements.name.value
    let price    = this.elements.price.value

    // give a loading spinner
    this.elements.submit.onclick = null
    let buttonText = this.elements.submit.innerHtml
    this.elements.submit.innerHtml = '<loading-icon color="#ccc" width="2rem"></loading-icon>'

    // validate input
    if(!this.validateEmailAvailable(email)) {
      return

    } else if (password.length === 0) {
      this.setErrorMessage("Please enter password."); return

    } else if (name.length === 0) {
      this.setErrorMessage("Please enter your name."); return

    } else if (price < 0) {
      this.setErrorMessage("Positive Numbers Only ;)"); return

    } else if (price > 0 && price < 0.50) {
      this.setErrorMessage("The minimum value is $0.50, due to processing fees. "); return

    }

    // execute transaction
    await createUserWithEmailAndPassword(auth, email, password)
        .then(updateProfile(auth.currentUser, { displayName: name }))
        .catch(this.setErrorMessage)

    if(price == 0) {
      // dont do a checkout session, rather mark as free account
      response = await declinePartnership()
      console.log("free version", {response})

    } else {
      const sessionId = (await createPartnerCheckout({
        price,
        success_url: window.location.origin,
        cancel_url: window.location.href,
      })).data

      stripePromise.catch(console.error)

      (await stripePromise).redirectToCheckout({sessionId})
        .catch(this.setErrorMessage)
    }

    // revert loading spinner
    this.elements.submit.innerHtml = buttonText
    this.elements.submit.onclick = e => this.submitForm(e)
  }


  async validateEmailAvailable() {
    let email = this.elements.email.value

    if(!validEmail(email)) {
      this.setErrorMessage("Please enter a valid email.")
      return false
    }

    let methods = await fetchSignInMethodsForEmail(auth, email)
    if (methods.length > 0) {
      this.setErrorMessage("This email already has an account. Please Sign in.")
      return false
    }

    else {
      this.setErrorMessage("")
      return true
    }
  }

})












window.customElements.define('manage-account', class extends HTMLElement {
  // constructor() {}

  renderDiff({subscribed, partnerRate}) {
    const el = this.elements

    if(partnerRate !== undefined) {
      if(partnerRate) {
        // switch message
        el.message.replaceChildren(el.subscribedMessage)
        el.partnerRate.innerText = partnerRate

        // switch submit button text & handler
        el.submit.innerText = "Edit Partnership"
        el.submit.onclick = this.manageSubscription

      } else {
        // switch message
        el.message.replaceChildren(el.notSubscribedMessage)

        // switch submit button text & handler
        el.submit.innerText = "Next"
        el.submit.onclick = e => this.verifyAndCheckout(e)

      }
    }

    if(subscribed !== undefined) {
      if(subscribed) {
        // switch back button text & handler
        el.back.innerText = "⟵ Back to Memorizing"
        el.back.style.textAlign = 'left'
        el.onclick = e => { window.location.pathname = '/' }

      } else {
        // switch back button text & handler
        el.back.innerText = "Not right now ⟶"
        el.back.style.textAlign = 'right'
        el.back.onclick = e => {
          e.preventDefault()
          declinePartnership()
          .then(
            e => this.setErrorMessage(""),
            e => this.setErrorMessage(e)
          )
          window.location.pathname = '/'
        }
      }
    }
  }


  attributeChangedCallback(name, oldValue, newValue) {
    if(name === 'partnerRate') {
      this.renderDiff({partnerRate: newValue})

    } else if(name === 'subscribed') {
      this.renderDiff({subscribed: newValue})
    }
  }

  setErrorMessage(msg) {
    this.elements.errorMessage.innerText = msg

    if(msg == "") {
      this.elements.errorMessage.setAttribute('hidden', '')
    } else {
      this.elements.errorMessage.removeAttribute('hidden')
    }
  }

  connectedCallback() {
    const root = attachTemplateToShadow(this, 'manageAccount')
    syncAttributeProperty(this, 'subscribed')
    syncAttributeProperty(this, 'partnerRate')

    const elements = this.elements = {
      message: root.getElementById("message"),
      submit: root.getElementById("submit"),
      back: root.getElementById("back"),
      errorMessage: root.getElementById("errorMessage"),

      subscribedMessage: document.getElementById("subscribedMessage").content.cloneNode(true),
      notSubscribedMessage: document.getElementById("notSubscribedMessage").content.cloneNode(true),
    }

    elements.partnerRateInput = elements.notSubscribedMessage.getElementById("partnerRateInput")
    elements.partnerRate = elements.subscribedMessage.getElementById("partnerRate")

    this.renderDiff(this)
    // elements.login.onclick = ()=>window.location.pathname = "/"
    // elements.submit.onclick = e => this.submitForm(e)

  }

  /**
   * Display Name & Email - later maybe change
   * Reset Password Button
   * 
   * if subscribed:
   *   Display amount subscribed
   *   Change amount button
   * 
   * not subscribed:
   *   Create partner same as create account 
  */

  setErrorToDisplay(e) {
    console.error(e);
    let msg = e.message || e
    setErrorMessage(msg);
  }

  async verifyAndCheckout(e) {
    e.preventDefault()

    const price = this.elements.partnerRateInput.value
    // validate input
    if (price < 0) this.setErrorToDisplay("Positive Numbers Only ;)")
    else if (price > 0 && price < 0.50) this.setErrorToDisplay("The minimum value is $0.50, due to processing fees. ")
    else {
      if(price == 0) {
        await declinePartnership()
        this.setErrorMessage("")

      } else if(price == '') {

        this.setErrorToDisplay("Please enter a partnership amount.")
      } else {
        const sessionId = (await createPartnerCheckout({
          price,
          success_url: window.location.origin,
          cancel_url: window.location.href,
        })).data
        const stripe = await stripePromise
        stripe.redirectToCheckout({sessionId})
          .catch(e=>{console.error(e.message)})
        this.setErrorMessage("")
      }
    }
  }

  async manageSubscription(e) {
    e.preventDefault()

    const session = (await manageBilling({
      return_url: window.location.href,
    })).data

    console.log(session)

    window.location = session.url
  }
})










////////////////////////////////
////// FORGOT PASSWORD PAGE ////
////////////////////////////////

// import { firebase, auth, db } from '../shared/firebase';
// import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail, updateProfile } from 'firebase/auth'

function validEmail(email) {
  return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}


// document.body.onload = async function() {
//   const elements = {
//     form: document.getElementsByTagName("form")[0],
//     title: document.getElementById("title"),
//     message: document.getElementById("message"),
//     email: document.getElementById("email"),
//     sendEmail: document.getElementById("sendEmail"),
//     returnSignIn: document.getElementById("returnSignIn"),
//     responseMessage: document.getElementById("responseMessage"),
//   }

//   let curState = {}

//   function renderUpdate(state) {
//     curState = {...curState, ...state}
//     console.log("renderUpdate", {state, curState})

//     // renders based on a state diff (first time is provided a full state)
//     if(state.waiting === true) {
//       elements.sendEmail.innerHTML = '<loading-icon color="#ccc" width="2rem"></loading-icon>'
//       elements.form.onsubmit = null
//       elements.sendEmail.onclick = null
//     }

//     if(state.waiting === false) {
//       if(curState.submitted) {
//         elements.sendEmail.innerText = "Resend Email"
//         elements.form.onsubmit = returnSignIn
//         elements.sendEmail.onclick = submitEmail

//       } else {
//         elements.sendEmail.innerText = "Submit"
//         elements.form.onsubmit = submitEmail
//         elements.sendEmail.onclick = submitEmail
//       }      
//     }

//     if(state.hasOwnProperty('submitted')) {
//       if(curState.submitted) {
//         elements.email.style.visibility = "hidden"
//         elements.form.onsubmit = returnSignIn

//         elements.sendEmail.setAttribute('data-button', 'round outline')
//         elements.returnSignIn.setAttribute('data-button', 'round')

//         elements.sendEmail.innerText = "Resend Email"
//         elements.title.innerText = "Password reset email sent."
//         elements.message.innerText = 'You should receive a password reset email within the next five minutes. Follow the instructions inside to reset your password, then try logging in with your new password. If you don’t see the email, make sure to check your junk mail box.'

//       } else {
//         elements.email.style.visibility = "visible"
//         elements.form.onsubmit = submitEmail

//         elements.sendEmail.setAttribute('data-button', 'round')
//         elements.returnSignIn.removeAttribute('data-button')

//         elements.sendEmail.innerText = "Submit"
//         elements.title.innerText = "Forgot your password?"
//         elements.message.innerText = 'Enter your email to recieve instructions on how to reset your password.'
//       }
//     }

//     if(state.hasOwnProperty('responseMessage')) {
//       elements.responseMessage.innerHTML = state.responseMessage
//     }
//   }

//   // define handlers

//   function returnSignIn(e) {
//     e.preventDefault()
//     window.location.pathname = "/"
//   }

//   async function submitEmail(e) {
//     e.preventDefault()
//     renderUpdate({waiting:true})

//     let email = elements.email.value
//     if(await validateEmail(email)) {
//       sendPasswordResetEmail(auth, email)
//         .then(() => renderUpdate({submitted:true, waiting:false}))
//         .catch(e => renderUpdate({responseMessage:e, waiting:false}))
//     } else {
//         renderUpdate({waiting:false})
//     }
//   }

//   async function validateEmail() {
//     let email = elements.email.value

//     if(!validEmail(email)) {
//       renderUpdate({responseMessage:'Please enter a valid email.'})
//       return false
//     }

//     let methods = await fetchSignInMethodsForEmail(auth, email)
//     if (methods.length > 0) {
//         renderUpdate({responseMessage:''})
//         return true
//     }

//     else {
//       renderUpdate({responseMessage:'This account does not exist, please <a href="/account">create an account</a>'})
//       return false
//     }
//   }

//   // setup handlers

//   elements.email.onblur = validateEmail
//   elements.sendEmail.onclick = submitEmail
//   elements.returnSignIn.onclick = returnSignIn

//   renderUpdate({submitted:false, responseMessage:''})
// }


// common custom elements

""







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
