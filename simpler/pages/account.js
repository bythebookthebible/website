import './index.scss'
import { firebase, auth, db, loadFirebase } from '../sharedUI/firebase';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail, updateProfile } from 'firebase/auth'
import { getFunctions, httpsCallable } from "firebase/functions";
import {loadStripe} from '@stripe/stripe-js'
import { emailRegex } from '../sharedUtil/dataUtil';
import { defineAllDefaultTemplates, syncAttributeProperty, attachTemplateToShadow } from '../sharedUtil/uiUtil'
import '../sharedUI/sharedWidgets'
import '../sharedUI/loginWidgets'

// Config data is imported from .env files, to allow for development to use a testing server
// stripe config
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)

// firebase functions config
const firebaseFunctions = getFunctions()
const createPartnerCheckout = httpsCallable(firebaseFunctions, 'createPartnerCheckout');
const declinePartnership = httpsCallable(firebaseFunctions, 'declinePartnership');
const getPartnershipStatus = httpsCallable(firebaseFunctions, 'getPartnershipStatus');
const manageBilling = httpsCallable(firebaseFunctions, 'createBillingManagementSession');



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

    // dont swap pages, if the child is actively processing stuff
    // (specifically, when we get a new user partially created)
    const skip = root.children[0].hasAttribute('processing')

    console.log({newPage, loaded, skip})
    // innerText = newPage

    // swap pages if needed
    if(!skip && newPage !== oldPage) {
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


  function onAuthStateChanged(newUser, state) {
    console.log("updating partnerRate maybe:", {newUser, state})
    if(newUser && (!state.loaded.includes('partnerRate') || state.current.user?.uid == newUser.uid)) {
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

  attributeChangedCallback(name, oldValue, newValue) {
    const el = this.elements

    // PROCESSING
    if(name === 'processing') {
      if(newValue) {
        // disable buttons
        if(el.submit.loadingButton === undefined) {
          el.submit.loadingButton = {
            innerHTML: el.submit.innerHTML,
            onclick: el.submit.onclick
          }
          el.submit.onclick = null
          el.submit.innerHTML = '<loading-icon color="white" width="2rem"></loading-icon>'
        }
      }
      if(this.processing) {
        // postpone syncing other attributes  
      }
      if(!newValue) {
        // enable buttons
        if(el.submit.loadingButton) {
          el.submit.onclick = el.submit.loadingButton.onclick
          el.submit.innerHTML = el.submit.loadingButton.innerHTML
          el.submit.loadingButton = undefined
        }
        // resync remaining attributes (so they are eventually consistent)
      }

    }
  
  }

  observedAttributes = ["processing"]
  
  connectedCallback() {
    const root = attachTemplateToShadow(this, 'create-account')
    syncAttributeProperty(this, 'processing')

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

    if(msg == "") {
      this.elements.errorMessage.setAttribute('hidden', '')
    } else {
      this.elements.errorMessage.removeAttribute('hidden')
    }
  }


  async submitForm(e) {
    e.preventDefault();

    let email    = this.elements.email.value
    let password = this.elements.password.value
    let name     = this.elements.name.value
    let price    = this.elements.price.value

    // give a loading spinner
    this.processing = true

    const errorAndCleanup = e => {
      this.setErrorMessage(e)
      this.processing = false
    }

    // validate input
    if (name.length === 0) {
      errorAndCleanup("Please enter your name.")

    } else if(!(await this.validateEmailAvailable(email))) {
      this.processing = false

    } else if (password.length === 0) {
      errorAndCleanup("Please enter a password.")

    } else if (price < 0) {
      errorAndCleanup("Positive Numbers Only ;)")

    } else if (price > 0 && price < 0.50) {
      errorAndCleanup("The minimum value is $0.50, due to processing fees. ")

    }    

    // execute transaction
    await createUserWithEmailAndPassword(auth, email, password)
    .catch(errorAndCleanup)
    await updateProfile(auth.currentUser, { displayName: name })

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

      stripePromise.catch(errorAndCleanup)

      const stripe = (await stripePromise)
      console.log(stripe)

      stripe.redirectToCheckout({sessionId})
        .catch(errorAndCleanup)
    }

    // revert loading spinner
    return errorAndCleanup('')
  }


  async validateEmailAvailable() {
    let email = this.elements.email.value

    if(!emailRegex.test(email)) {
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

  renderDiff(diff) {
    let {subscribed, partnerRate, processing} = diff
    const el = this.elements

    console.log("rendering diff", diff)


    // PROCESSING
    if(processing) {
      // disable buttons
      if(el.submit.loadingButton === undefined) {
        el.submit.loadingButton = {
          innerHTML: el.submit.innerHTML,
          onclick: el.submit.onclick
        }
        el.submit.onclick = null
        el.submit.innerHTML = '<loading-icon color="#ccc" width="2rem"></loading-icon>'
      }
    }
    if(this.processing) {
      // postpone syncing other attributes
      subscribed = undefined
      partnerRate = undefined

    }
    if(diff.hasOwnProperty('processing') && !processing) {
      // enable buttons
      if(el.submit.loadingButton) {
        el.submit.onclick = el.submit.loadingButton.onclick
        el.submit.innerHTML = el.submit.loadingButton.innerHTML
        el.submit.loadingButton = undefined
      }

      // resync remaining attributes (so they are eventually consistent)
      if(!diff.hasOwnProperty('subscribed')) subscribed = this.subscribed
      if(!diff.hasOwnProperty('partnerRate')) partnerRate = this.partnerRate
    }


    // PARTNER RATE
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


    // SUBSCRIBED
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
    this.renderDiff({[name]: newValue})

  }

  setErrorMessage(msg) {
    this.elements.errorMessage.innerText = msg

    if(msg == "") {
      this.elements.errorMessage.setAttribute('hidden', '')
    } else {
      this.elements.errorMessage.removeAttribute('hidden')
    }
  }

  static observedAttributes = ["subscribed", "partnerRate", "processing"]
  connectedCallback() {
    const root = attachTemplateToShadow(this, 'manageAccount')
    syncAttributeProperty(this, 'subscribed')
    syncAttributeProperty(this, 'partnerRate')
    syncAttributeProperty(this, 'processing')

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

    this.processing = true

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

    this.processing = false
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



defineAllDefaultTemplates()
