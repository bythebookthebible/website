import React, { useState, useRef} from 'react';
import { Card } from 'react-bootstrap';
import './common.css';

import {firebase, auth} from '../firebase'
import { PlayfulPlainContainer } from './components';
import LoginComp from './Login';
import ForgotPass from './ForgotPass';

const tosUrl = '/terms.html'
const privacyPolicyUrl = '/privacy.html'

var initUser = firebase.functions().httpsCallable('initUser');

export default function Login() {
    return <PlayfulPlainContainer>
        <CreatePage />
    </PlayfulPlainContainer>
}

function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

function CreatePage(props) {

    const [errorMessage, setErrorMessage] = useState("");
    const [action, setAction] = useState('create');

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

        console.log(e);
        setErrorMessage(msg);
    }

    // checks the email to change between signin and signup
    // returns true if the action was changed
    async function checkEmail(email) {
        if(validEmail(email)) {
            let methods = await auth.fetchSignInMethodsForEmail(email)        
            if (methods.length == 0) return true;
        }
        // switch state to login
        return false
    }

    async function createAccount() {
        let email = emailRef.current.value
        let password = pwdRef.current.value
        let name = nameRef.current.value

        // validate input
        if(!validEmail(email))
            setErrorToDisplay("Please enter a valid email.")
        else if (password.length === 0)
            setErrorToDisplay("Please enter password.")
        else if (name.length === 0)
            setErrorToDisplay("Please enter your name.")
        else {
            await auth.createUserWithEmailAndPassword(email, password).catch(setErrorToDisplay)
            await firebase.auth().currentUser.updateProfile({ displayName: name }).catch(setErrorToDisplay)
            await initUser()
        }
    }

    let submitForm = async (e) => {
        e.preventDefault();

        let email = emailRef.current.value;
        if(!await checkEmail(email)) return;
        await createAccount();
    }

    return action === 'signin' ? <LoginComp setAction={setAction} /> : action === 'create' ? <Card {...props} className={'small-card '+(props.className||'')} >
        <div style={{color:'gray', display:'flex', justifyContent: 'space-evenly', padding: '1.5rem 0.75rem 0rem'}}>
            <h5 className='form-header'>Create Account</h5>
            <h5 className='form-header' style={{borderBottom:0}} onClick={() => setAction('signin')}>Sign In</h5>
        </div>
        <div style={{marginBottom: '1rem', borderBottom: '1px solid lightgray'}} />
        <Card.Body as='form' onSubmit={submitForm}>
            <Card.Text> 
                <input type="text" className="form-control mb-2" name='name' ref={nameRef} placeholder="Name"/>
                <input type="email" className="form-control mb-2" name='email' ref={emailRef} placeholder="Email" onBlur={e => checkEmail(e.target.value)} />
                <input type="password" className="form-control mb-2" name='password' ref={pwdRef} placeholder="Password" />
            </Card.Text>
            <Card.Text as='div'>
                <div className="d-flex flex-centered">
                    <button type="submit" className="btn btn-round btn-primary m-1 w-100 mb-2" id="submitAuth">Next</button>
                </div>
                <div id="error-message" className="text-danger">{errorMessage}</div>
            </Card.Text>
        </Card.Body>
        <div className='form-footer'>
            <Card.Text style={{background:'none'}}>
                <a href={tosUrl} className="p-1">Terms of Service</a>
                <span style={{color:'lightgrey',margin:'0 .25rem'}}>|</span>
                <a href={privacyPolicyUrl} className="p-1">Privacy Policy</a>
            </Card.Text>
        </div>
    </Card> : action === 'forgot' ? <ForgotPass setAction={setAction} checkEmail={checkEmail} /> : ''
}