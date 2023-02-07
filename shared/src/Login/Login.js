import React, { useState, useRef} from 'react';
import { Card } from 'react-bootstrap';

import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { accountExists, validEmail } from './LoginSignup';

export function Login(props) {
    const { setAction } = props;
    const [errorMessage, setErrorMessage] = useState("");

    const emailRef = useRef()
    const pwdRef = useRef()

    function setErrorToDisplay(e) {
        let msg = e.message || e

        // Change some error messages
        if (e.code === 'auth/wrong-password') {
            msg = 'Invalid Password.'
        }
        if (e.code === 'auth/user-not-found') {
            // Original message: "There is no user record corresponding to this identifier. The user may have been deleted."
            msg = 'There is no user registered with that email address.'
        }

        console.log(e);
        setErrorMessage(msg);
    }

    async function signIn(e) {
        e.preventDefault();
        let email = emailRef.current.value
        let password = pwdRef.current.value

        // validate input
        if (!validEmail(email)) {
            return setErrorMessage("Please enter a valid email.");}
        else if (password.length === 0) {
            return setErrorMessage("Please enter a password.");
        }

        const exists = await accountExists(email);
        if (exists) {
            console.log('signing in...');
            signInWithEmailAndPassword(auth, email, password)
                .then(props.onSubmit)
                .catch(e => {
                    setErrorToDisplay(e)
                })
        } else {
            setErrorMessage('There is no user registered with that email address.');
        }
    }

    return <form onSubmit={signIn} className="loginForm">
        <h2 style={{textAlign:"center"}}>Sign In</h2>

        <input type="email" data-button="round outline" name='email' ref={emailRef} placeholder="Email" autoFocus />

        <div>
            <input type="password" data-button="round outline" name='password' ref={pwdRef} placeholder="Password" />

            <label onClick={()=>window.location.pathname = "/forgot"}>Forgot your password?</label>
        </div>

        <div>
            <button type="submit" data-button="round" style={{width:"100%"}}>Sign In</button>

            <label onClick={()=>window.location.pathname = "/account"}>Create an account</label>
        </div>

        <div id="error-message" className="text-danger py-2">{errorMessage}</div>
    </form>
}