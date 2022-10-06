import './index.scss'
// import loginStyles from './login.scss'

// const root = document.getElementById("root")
// const loading = document.getElementById("loading")
// const login = document.getElementById("login")

function assert(test, message) {
  if(!test) throw message
}

function renderLoadingPage(message) {
  const node = loading.content.cloneNode(true)
  node.getElementById("message").textContent = message
  root.replaceChildren(node)
  root.classList.value = "loading"
}

const loginModes = ["signIn", "createAccount", "forgotPassword"]

// function renderLoginPage(mode, errorText, successText) {
//   assert(loginModes.includes(mode), `Invalid login mode: ${mode}`)
//   const node = login.content.cloneNode(true)

//   // const signInNode = node.getElementById("signInBody").content.cloneNode(true)
//   // const createAccountNode = node.getElementById("createAccountBody").content.cloneNode(true)
//   // const forgotPasswordNode = node.getElementById("forgotPasswordBody").content.cloneNode(true)

//   // const nameNode = node.getElementById("name")
//   // const emailNode = node.getElementById("email")
//   // const passwordNode = node.getElementById("password")
//   // const submitNode = node.getElementById("submit")

//   // const forgotPasswordTextNode = node.getElementById("forgot-password-text")
//   // const forgotPasswordLinkNode = node.getElementById("forgot-password-link")
//   // const successMessageNode = node.getElementById("success-message")
//   // const errorMessageNode = node.getElementById("error-message")


//   root.replaceChildren(node)
//   root.classList.value = "login"
// }


window.customElements.define('login-page', class extends HTMLElement {
  validModes = ["signIn", "createAccount", "forgotPassword"]

  // sync properties with attributes -- attributes are the master
  get mode() { return this.getAttribute('mode'); }
  set mode(val) {
    if(val === false) this.removeAttribute('mode')
    else this.setAttribute('mode', val)
  }

  // life cycle rendering
  constructor() {
    super();
    this.fragmentRoot = document.getElementById("login").content.cloneNode(true)
    this.elements = this.getElements(this.fragmentRoot)

    const shadowRoot = this.attachShadow({ mode: "open" });
    // const styleNode = document.createElement("style")
    // styleNode.innerHTML = loginStyles
    // shadowRoot.appendChild(styleNode)
    shadowRoot.appendChild(this.fragmentRoot);
  }

  connectedCallback() {
    console.log(this.getElementById("name"))
    const el = this.elements
    if(this.mode === "signIn") {
      el.nameNode.style.display = "none"
      el.forgotPasswordTextNode.style.display = "none"
      el.nameNode.style.display = "none"
      el.nameNode.style.display = "none"

      el.submitNode.replaceChildren("Sign In")
    } 
    else if(this.mode === "createAccount") {
      el.nameNode.style.display = "none"
      el.forgotPasswordTextNode.style.display = "none"
      el.nameNode.style.display = "none"
      el.nameNode.style.display = "none"

      el.submitNode.replaceChildren("Sign In")
    } 
    else if(this.mode === "forgotPassword") {
      el.nameNode.style.display = "none"
      el.forgotPasswordTextNode.style.display = "none"
      el.nameNode.style.display = "none"
      el.nameNode.style.display = "none"

      el.submitNode.replaceChildren("Sign In")
    } 

  }

  // helpers
  getElements(node) {
    return {
      nameNode: node.getElementById("name"),
      emailNode: node.getElementById("email"),
      passwordNode: node.getElementById("password"),
      submitNode: node.getElementById("submit"),

      forgotPasswordTextNode: node.getElementById("forgot-password-text"),
      forgotPasswordLinkNode: node.getElementById("forgot-password-link"),
      successMessageNode: node.getElementById("success-message"),
      errorMessageNode: node.getElementById("error-message"),
    }
  }
})

// renderLoginPage("signIn")


/*
const user = firebase.currentUser
if(!user) renderLoginPage()

const resourceDB = firebase.getResourceDB()
const query = (new URL(window.location)).query




*/