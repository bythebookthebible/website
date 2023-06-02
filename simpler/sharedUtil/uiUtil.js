import { auth } from '../sharedUI/firebase';
import { fetchSignInMethodsForEmail } from 'firebase/auth'


// add spinners inside buttons (or anything)
export function setSpinner(node, options='color="#ccc" width="2rem"') {
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
export function clearSpinner(node) {
  console.log(node.spinnerData)

  node.onclick = node.spinnerData.onclick
  node.innerHtml = node.spinnerData.innerHtml
  node.spinnerData = undefined
}

// sync object properties with html attributes -- attributes are the master
export function syncAttributeProperty(obj, attr) {
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

export function attachTemplateToShadow(obj, templateId) {
    const fragmentRoot = document.getElementById(templateId).content.cloneNode(true)
    const shadowRoot = obj.shadowRoot || obj.attachShadow({ mode: "open" });
    shadowRoot.replaceChildren(fragmentRoot);
    return shadowRoot
}

export async function accountExists(email) {
    if(emailRegex.test(email)) {
        let methods = await fetchSignInMethodsForEmail(auth, email)        
        if (methods.length > 0) return true;
    }
    // switch state to login
    return false
}

export function defineAllDefaultTemplates() {
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


export const fullScreenEnabled = () => (!!(
  document.fullscreenEnabled ||
  document.mozFullScreenEnabled || 
  document.msFullscreenEnabled || 
  document.webkitSupportsFullscreen || 
  document.webkitFullscreenEnabled || 
  document.webkitSupportsPresentationMode
))

export const toggleFullscreen = function(node) {
   if (isFullScreen()) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      else if (document.webkitSetPresentationMode) document.webkitSetPresentationMode("inline");
      return false;
   }
   else {
      if (node.requestFullscreen) node.requestFullscreen();
      else if (node.mozRequestFullScreen) node.mozRequestFullScreen();
      else if (node.webkitRequestFullScreen) node.webkitRequestFullScreen();
      else if (node.msRequestFullscreen) node.msRequestFullscreen();
      else if (node.webkitSetPresentationMode) node.webkitSetPresentationMode("fullscreen");
      return true
   }
}

export const isFullScreen = function() {
   return !!(document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
}
