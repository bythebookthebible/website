import './index.scss'
import { firebase, auth } from '../shared/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { getFunctions, httpsCallable } from "firebase/functions";
import {loadStripe} from '@stripe/stripe-js'

// Config data is imported from .env files, to allow for development to use a testing server
// stripe config
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)
// firebase functions config
const firebaseFunctions = getFunctions()
const createPartnerCheckout = httpsCallable(firebaseFunctions, 'createPartnerCheckout');
const declinePartnership = httpsCallable(firebaseFunctions, 'declinePartnership');


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
  validModes = ["signIn", "createAccount", "forgotPassword"]

  static observedAttributes = ["mode"]

  // life cycle rendering
  constructor() {
    super();
    syncAttributeProperty(this, 'mode')
    const shadowRoot = attachTemplateToShadow(this, 'login')
    this.elements = this.getElements(shadowRoot)
  }

  connectedCallback() {
    // set event handlers
    const el = this.elements
    el.signinLink.addEventListener("click", () => { this.mode = "signIn" })
    el.createLink.addEventListener("click", () => { this.mode = "createAccount" })
    el.forgotPasswordLink.addEventListener("click", () => { this.mode = "forgotPassword" })

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    el.submit.addEventListener("click", this.handleFormData)
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if(name == "mode" && newValue != oldValue) {
      const mode = newValue
      const el = this.elements
      
      assert(this.validModes.includes(mode), `invalid mode: ${mode}`)
      el.root.setAttribute("data-mode", mode)

      if(mode === "signIn")  el.submit.replaceChildren("Sign In")
      else if(mode === "createAccount") el.submit.replaceChildren("Next")
      else if(mode === "forgotPassword") el.submit.replaceChildren("Send Reset Email")

      this.setErrorMessage("")
    }
  }

  handleFormData(e) {
    e.preventDefault()
    
    switch(this.mode) {
      case "signIn": {
        const email = this.elements.email.value
        const password = this.elements.password.value
        if(!emailRegex.test(email)) return this.setErrorMessage("Please enter a valid email.")
        if(password.length == 0) return this.setErrorMessage("Please enter your password.")

        signInWithEmailAndPassword(auth, email, password)
          .catch(this.setErrorMessage)
        break;

      } case "createAccount": {
        auth.signOut()
        break;

      } case "forgotPassword": {
        const email = this.elements.email.value
        if(!emailRegex.test(email)) return this.setErrorMessage("Please enter a valid email.")

        sendPasswordResetEmail(auth, email)
          .then(()=>{this.setSuccessMessage(
            "Successfully sent password reset email. You should receive a password reset email within the next five minutes. Follow the instructions inside to reset your password, then try logging in with your new password.")})
          .catch(this.setErrorMessage)
        break;
      }
    }
    console.log({currentUser: auth.currentUser, auth})
  }

  setErrorMessage(message) {
    this.elements.errorMessage.textContent = message
    this.elements.successMessage.textContent = ""
  }

  setSuccessMessage(message) {
    this.elements.errorMessage.textContent = ""
    this.elements.successMessage.textContent = message
  }

  getElements(node) {
    return {
      root: node.getElementById("root"),

      createLink: node.getElementById("create-link"),
      signinLink: node.getElementById("signin-link"),

      name: node.getElementById("name"),
      email: node.getElementById("email"),
      password: node.getElementById("password"),
      submit: node.getElementById("submit"),

      forgotPasswordText: node.getElementById("forgot-password-description"),
      forgotPasswordLink: node.getElementById("forgot-password-link"),
      successMessage: node.getElementById("success-message"),
      errorMessage: node.getElementById("error-message"),
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

window.customElements.define('create-account-page', class extends HTMLElement {
  static observedAttributes = ["mode"]

  // life cycle rendering
  constructor() {
    super();
    const shadowRoot = attachTemplateToShadow(this, 'login')
    this.elements = this.getElements(shadowRoot)
  }

  connectedCallback() {
    // set event handlers
    const el = this.elements
    el.signinLink.addEventListener("click", () => { window.location.pathname = "/"})
    // el.submit.addEventListener("submit", e=>this.handleFormData.call(this, e))
    el.form.addEventListener("submit", e=>this.handleFormData.call(this, e))
  }

  setErrorMessage(message) {
    this.elements.errorMessage.innerHTML = message
    this.elements.successMessage.textContent = ""
  }

  setSuccessMessage(message) {
    this.elements.errorMessage.textContent = ""
    this.elements.successMessage.innerHTML = message
  }

  getElements(node) {
    return {
      root: node.getElementById("root"),
      form: node.getElementById("form"),

      createLink: node.getElementById("create-link"),
      signinLink: node.getElementById("signin-link"),

      name: node.getElementById("name"),
      email: node.getElementById("email"),
      password: node.getElementById("password"),
      price: node.getElementById("price"),
      submit: node.getElementById("submit"),

      successMessage: node.getElementById("success-message"),
      errorMessage: node.getElementById("error-message"),
    }
  }

  async handleFormData(e) {
    e.preventDefault()

    const name     = this.elements.name.value
    const email    = this.elements.email.value
    const password = this.elements.password.value
    const price    = this.elements.price.value

    console.log({elements: this.elements, name, email, password, price})

    const combinedErrorMessage = (e) => {
      console.error(e);
      this.setErrorMessage(e);
    }

    // validate input
    let emailInUse = await accountExists(email)
    console.log("emailInUse", emailInUse)

    if (name.length === 0) this.setErrorMessage("Please enter your name.")
    else if(!emailRegex.test(email)) this.setErrorMessage("Please enter a valid email.")
    else if(emailInUse) this.setErrorMessage("This email already has an account. Please Sign in.")
    else if (password.length === 0) this.setErrorMessage("Please enter password.")
    else if (price < 0) this.setErrorMessage("Positive Amount Only ;)")
    else if (price > 0 && price < 0.50) this.setErrorMessage("The minimum nonzero value is $0.50, due to processing fees.")

    else {
      // give some feedback
      this.setSuccessMessage('<loading-icon width="5rem" color="white"></loading-icon>')

      await createUserWithEmailAndPassword(auth, email, password)
        .then(updateProfile(auth.currentUser, { displayName: name }))
        .catch(combinedErrorMessage)

      if(price == 0) {
        // don't do a checkout session, rather mark as free account
        await declinePartnership()
      } else {
        const sessionId = (await createPartnerCheckout({
          price,
          success_url: window.location.origin,
          cancel_url: window.location.href,
        })).data
        const stripe = await stripePromise
        stripe.redirectToCheckout({sessionId})
          .catch(combinedErrorMessage)
      }
    }

  }
})

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
    const shadowRoot = obj.attachShadow({ mode: "open" });
    shadowRoot.appendChild(fragmentRoot);
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

