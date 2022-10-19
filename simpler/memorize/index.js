import './index.scss'
import { firebase, auth } from '../shared/firebase';
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail } from 'firebase/auth'

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