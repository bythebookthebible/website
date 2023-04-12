import { auth } from '../sharedUI/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth'
import { syncAttributeProperty, attachTemplateToShadow, accountExists, setSpinner, clearSpinner } from '../sharedUtil/uiUtil'
import { emailRegex } from '../sharedUtil/dataUtil';

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


