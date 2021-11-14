import React, { useState, useRef} from 'react';
import { Card } from 'react-bootstrap';

import {auth} from '../firebase'
import { PlayfulPlainContainer } from './components';
import './CreateAccount';

const tosUrl = '/terms.html'
const privacyPolicyUrl = '/privacy.html'

export default function Login({ setAction }) {
    return <PlayfulPlainContainer>
        <LoginForm setAction={setAction} />
    </PlayfulPlainContainer>
}

function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

function LoginForm(props) {
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

    // checks the email to change between signin and signup
    // returns true if the action was changed
    async function checkEmail(email) {
        if(validEmail(email)) {
            let methods = await auth.fetchSignInMethodsForEmail(email)        
            if (methods.length == 0) {
                setErrorMessage('There is no user registered with that email address.');
                return true;
            }
        }
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

        const notExist = await checkEmail();
        if (!notExist) {
            console.log('signing in...');
            auth.signInWithEmailAndPassword(email, password)
                .then(props.onSubmit)
                .catch(e => {
                    setErrorToDisplay(e)
                })
        }
    }



    return <Card {...props} className={'small-card '+(props.className||'')} >
        <div style={{color:'gray', display:'flex', justifyContent: 'space-evenly', padding: '1.5rem 0.75rem 0rem'}}>
            <h5 onClick={() => setAction('create')} style={{borderBottom:0}} className='form-header'>Create Account</h5>
            <h5 className='form-header'>Sign In</h5>
        </div>
        <div style={{marginBottom: '1rem', borderBottom: '1px solid lightgray'}} />
        <Card.Body as='form' onSubmit={signIn} style={{paddingBottom:0}}>
            <Card.Text> 
                <input type="email" className="form-control mb-2" name='email' ref={emailRef} placeholder="Email" onBlur={e => checkEmail(e.target.value)} />
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
        <div className='form-footer'>
            <Card.Text style={{background:'none'}}>
                <a href={tosUrl} className="p-1">Terms of Service</a>
                <span style={{color:'lightgrey',margin:'0 .25rem'}}>|</span>
                <a href={privacyPolicyUrl} className="p-1">Privacy Policy</a>
            </Card.Text>
        </div>
    </Card>
}