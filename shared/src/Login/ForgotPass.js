import React, { useState, useRef} from 'react';

import { auth } from '../firebase'
import { sendPasswordResetEmail } from 'firebase/auth'
import { validEmail } from './LoginSignup';

export function ForgotPass(props) {
    const { setAction } = props;

    const [errorMessage, setErrorMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const sendEmail = async (e) => {
        e.preventDefault();
        let email = emailRef.current.value;
        if (!validEmail(email)) return setErrorMessage("Please enter a valid email.");

        sendPasswordResetEmail(auth, email)
            .then(function () {
                // User has been sent a password reset email with a link to do the reset.
                setSubmitted(true);
                setErrorMessage("");
            })
            .catch((errorMsg) => {
                // Error occurred trying to reset email.
                setErrorMessage(errorMsg);
            });
    }

    const emailRef = useRef();
    let title = !submitted ? 'Forgot your password?' : 'Password reset email sent.'
    let message = !submitted ?
        'Enter your email to recieve instructions on how to reset your password.'
        : 'You should receive a password reset email within the next five minutes. Follow the instructions inside to reset your password, then try logging in with your new password. If you don’t receive an email in the next five minutes, try clicking "Resend Email."'


    let buttons = !submitted ? <>
        <button type="submit" data-button="round" style={{width:"100%"}}>Submit</button>
        <label onClick={()=>window.location.pathname = "/"}>Return to Sign In</label>
    </>
    : <>
        <button type="submit" data-button="round outline" style={{width:"100%"}}>Resend Email</button>
        <button type="submit" data-button="round" style={{width:"100%"}} onClick={()=>window.location.pathname = "/"}>Return to Sign In</button>
    </>

    return <form onSubmit={sendEmail} className="loginForm">
        <h2>{title}</h2>
        <p style={{fontSize:'.9rem'}}>{message}</p>

        <input type="email" data-button="round outline"  className="form-control" name='email' ref={emailRef} style={{visibility: !submitted ? 'visible':'hidden'}} placeholder="Email" autoFocus />

        {buttons}

        {/* Place the info message below the Password Reset button because it's an info message informing of password reset success.*/}
        <div id="info-message" style={{color:'#d10909'}} className="p-1 text">{errorMessage}</div>

    </form>
}
