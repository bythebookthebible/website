import { auth } from '../sharedUI/firebase';
import { syncAttributeProperty, attachTemplateToShadow } from '../sharedUtil/uiUtil'


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


// window.customElements.define('loading-page', class extends HTMLElement {
//   static observedAttributes = ["message"]

//   // life cycle rendering
//   constructor() {
//     super();
//     syncAttributeProperty(this, 'message')
//     attachTemplateToShadow(this, 'loading-page')
//   }

//   attributeChangedCallback(name, oldValue, newValue) {
//     if(name == "message")
//       this.shadowRoot.getElementById("message").textContent = newValue
//   }
// })

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



