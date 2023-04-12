import { firebase, auth, db } from '../sharedUI/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail, updateProfile } from 'firebase/auth'
import { emailRegex } from '../sharedUtil/dataUtil';
import '../sharedUI/sharedWidgets'
import '../sharedUI/loginWidgets'


document.body.onload = async function() {
  const elements = {
    form: document.getElementsByTagName("form")[0],
    title: document.getElementById("title"),
    message: document.getElementById("message"),
    email: document.getElementById("email"),
    sendEmail: document.getElementById("sendEmail"),
    returnSignIn: document.getElementById("returnSignIn"),
    responseMessage: document.getElementById("responseMessage"),
  }

  let curState = {}

  function renderUpdate(state) {
    curState = {...curState, ...state}
    console.log("renderUpdate", {state, curState})

    // renders based on a state diff (first time is provided a full state)
    if(state.waiting === true) {
      elements.sendEmail.innerHTML = '<loading-icon color="#ccc" width="2rem"></loading-icon>'
      elements.form.onsubmit = null
      elements.sendEmail.onclick = null
    }

    if(state.waiting === false) {
      if(curState.submitted) {
        elements.sendEmail.innerText = "Resend Email"
        elements.form.onsubmit = returnSignIn
        elements.sendEmail.onclick = submitEmail

      } else {
        elements.sendEmail.innerText = "Submit"
        elements.form.onsubmit = submitEmail
        elements.sendEmail.onclick = submitEmail
      }      
    }

    if(state.hasOwnProperty('submitted')) {
      if(curState.submitted) {
        elements.email.style.visibility = "hidden"
        elements.form.onsubmit = returnSignIn

        elements.sendEmail.setAttribute('data-button', 'round outline')
        elements.returnSignIn.setAttribute('data-button', 'round')

        elements.sendEmail.innerText = "Resend Email"
        elements.title.innerText = "Password reset email sent."
        elements.message.innerText = 'You should receive a password reset email within the next five minutes. Follow the instructions inside to reset your password, then try logging in with your new password. If you don’t see the email, make sure to check your junk mail box.'

      } else {
        elements.email.style.visibility = "visible"
        elements.form.onsubmit = submitEmail

        elements.sendEmail.setAttribute('data-button', 'round')
        elements.returnSignIn.removeAttribute('data-button')

        elements.sendEmail.innerText = "Submit"
        elements.title.innerText = "Forgot your password?"
        elements.message.innerText = 'Enter your email to recieve instructions on how to reset your password.'
      }
    }

    if(state.hasOwnProperty('responseMessage')) {
      elements.responseMessage.innerHTML = state.responseMessage
    }
  }

  // define handlers

  function returnSignIn(e) {
    e.preventDefault()
    window.location.pathname = "/"
  }

  async function submitEmail(e) {
    e.preventDefault()
    renderUpdate({waiting:true})

    let email = elements.email.value
    if(await validateEmail(email)) {
      sendPasswordResetEmail(auth, email)
        .then(() => renderUpdate({submitted:true, waiting:false}))
        .catch(e => renderUpdate({responseMessage:e, waiting:false}))
    } else {
        renderUpdate({waiting:false})
    }
  }

  async function validateEmail() {
    let email = elements.email.value

    if(!emailRegex.test(email)) {
      renderUpdate({responseMessage:'Please enter a valid email.'})
      return false
    }

    let methods = await fetchSignInMethodsForEmail(auth, email)
    if (methods.length > 0) {
        renderUpdate({responseMessage:''})
        return true
    }

    else {
      renderUpdate({responseMessage:'This account does not exist, please <a href="/account">create an account</a>'})
      return false
    }
  }

  // setup handlers

  elements.email.onblur = validateEmail
  elements.sendEmail.onclick = submitEmail
  elements.returnSignIn.onclick = returnSignIn

  renderUpdate({submitted:false, responseMessage:''})
}
