import React, { useState, useRef} from 'react';
import { Card } from 'react-bootstrap';

import { auth } from '../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { accountExists, validEmail } from './LoginSignup';

export default function LoginForm(props) {
    const { setAction } = props;
    const [errorMessage, setErrorMessage] = useState("");
    const [infoMessage, setInfoMessage] = useState("");

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

    return <Card.Body as='form' onSubmit={signIn} style={{paddingBottom:0}}>
        <Card.Text> 
            <input type="email" className="form-control mb-2" name='email' ref={emailRef} placeholder="Email" />
            <input type="password" className="form-control mb-2" name='password' ref={pwdRef} placeholder="Password" />
        </Card.Text>
        <Card.Text as='div'>
            <div className="d-flex flex-centered">
                <button type="submit" className="btn btn-round btn-primary m-1 w-100" id="submitAuth">Sign In</button>
            </div>
            <div id="error-message" className="text-danger py-2">{errorMessage}</div>
        </Card.Text>
        <Card.Text className='text-center forgot-pass' onClick={() => setAction('forgot')}>
            Forgot your password?
        </Card.Text>

        {/* Place the info message below the Password Reset button because it's an info message informing of password reset success.*/}
        <Card.Text as='div'>
            <div id="info-message" className="p-1 text">{infoMessage}</div>
        </Card.Text>
    </Card.Body>
}