import React, { useState, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { accountExists, validEmail } from './LoginSignup';

import { auth } from '../firebase'
import { createUserWithEmailAndPassword } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions";

// var initUser = httpsCallable(getFunctions(), 'initUser');

export default function CreateAccount(props) {
    const [errorMessage, setErrorMessage] = useState("");

    const emailRef = useRef()
    const pwdRef = useRef()
    const nameRef = useRef()

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

        console.log(msg, e);
        setErrorMessage(msg);
    }

    async function createAccount() {
        let email = emailRef.current.value
        let password = pwdRef.current.value
        let name = nameRef.current.value

        // validate input
        let emailInUse = await accountExists(email)
        console.log("emailInUse", emailInUse)
        if(!validEmail(email)) {
            setErrorToDisplay("Please enter a valid email.")
        } else if(emailInUse) {
            setErrorToDisplay("This email already has an account. Please Sign in.")
        } else if (password.length === 0) {
            setErrorToDisplay("Please enter password.")
        } else if (name.length === 0) {
            setErrorToDisplay("Please enter your name.")
        } else {
            await createUserWithEmailAndPassword(auth, email, password)
                .catch(setErrorToDisplay)
                .then(
                    auth.currentUser.updateProfile({ displayName: name })
                    .catch(setErrorToDisplay)
                )
            // await initUser()
        }
    }

    let submitForm = async (e) => {
        e.preventDefault();
        await createAccount();
    }

    return <Card.Body as='form' onSubmit={submitForm}>
        <Card.Text> 
            <input type="text" className="form-control mb-2" name='name' ref={nameRef} placeholder="Name" />
            <input type="email" className="form-control mb-2" name='email' ref={emailRef} placeholder="Email" />
            <input type="password" className="form-control mb-2" name='password' ref={pwdRef} placeholder="Password" />
        </Card.Text>
        <Card.Text as='div'>
            <div className="d-flex flex-centered">
                <button type="submit" className="btn btn-round btn-primary m-1 w-100 mb-2" id="submitAuth">Next</button>
            </div>
            <div id="error-message" className="text-danger">{errorMessage}</div>
        </Card.Text>
    </Card.Body>
}