import "./account.scss"

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


window.customElements.define('loading-page', class extends HTMLElement {
  static observedAttributes = ["message"]

  // life cycle rendering
  constructor() {
    super();
    syncAttributeProperty(this, 'message')
    this.fragmentRoot = document.getElementById("loading-page").content.cloneNode(true)
    this.elements = {
      message: this.fragmentRoot.getElementById("message")
    }

    this.attachShadow({ mode: "open" }).appendChild(this.fragmentRoot);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if(name == "message")
      this.elements.message.textContent = newValue

  }
})










window.customElements.define('create-account', class extends HTMLElement {
  static observedAttributes = ["mode"]
  static validModes = ["signIn", "createAccount", "forgotPassword"]

  // life cycle rendering
  constructor() {
    super();
    syncAttributeProperty(this, 'mode')
    this.fragmentRoot = document.getElementById("create-account").content.cloneNode(true)
    this.elements = this.getElements(this.fragmentRoot)

    this.attachShadow({ mode: "open" }).appendChild(this.fragmentRoot);
  }

  connectedCallback() {
    // this.syncMode(this.mode)
    this.setEventHandlers()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if(name == "mode") this.syncMode(newValue)
  }

  // helpers
  syncMode(mode) {
    assert(this.validModes.includes(mode), `invalid mode: ${mode}`)
    const el = this.elements
    el.root.setAttribute("data-mode", mode)

    if(mode === "signIn") {
      el.submit.replaceChildren("Sign In")
    }
    else if(mode === "createAccount") {
      el.submit.replaceChildren("Next")
    }
    else if(mode === "forgotPassword") {
      el.submit.replaceChildren("Send Reset Email")
    }
  }

  setEventHandlers() {
    const el = this.elements
    el.createLink.addEventListener("click", () => { this.mode = "createAccount" })
    el.signinLink.addEventListener("click", () => { this.mode = "signIn" })
    el.forgotPasswordLink.addEventListener("click", () => { this.mode = "forgotPassword" })
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