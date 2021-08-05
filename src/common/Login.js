import React, { useState, useRef} from 'react';
import { Card } from 'react-bootstrap';
import $ from 'jquery'

import {firebase, auth} from '../firebase'
import { PlayfulPlainContainer, AbsoluteCentered } from './components';

const tosUrl = '/terms.html'
const privacyPolicyUrl = '/privacy.html'

var userDataMigration = firebase.functions().httpsCallable('userDataMigration');
var initUser = firebase.functions().httpsCallable('initUser');

export default function Login(props) {
    return <PlayfulPlainContainer>
        <LoginForm />
    </PlayfulPlainContainer>
}

function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

function LoginForm(props) {
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [infoMessage, setInfoMessage] = useState("");
    const [action, setAction] = useState('signin')

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
            let newAction = methods.length == 0 ? 'create' : 'signin'
    
            if(newAction != action) {
                setAction(newAction)
                return true
            }
        }
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
            // console.log('create account', email, name, password.replaceAll(/./g, '*'))

            await auth.createUserWithEmailAndPassword(email, password).catch(setErrorToDisplay)
            await firebase.auth().currentUser.updateProfile({ displayName: name }).catch(setErrorToDisplay)
            await initUser()
            // .then((res) => {
            //     console.log('response', res)
            //     console.log('user', auth.currentUser)
            // })
        }
    }

    async function signIn() {
        let email = emailRef.current.value
        let password = pwdRef.current.value

        // console.log('sign in', email, password.replaceAll(/./g, '*'))

        auth.signInWithEmailAndPassword(email, password)
            .then(props.onSubmit)
            .catch(e => {
                setShowResetPassword(true)
                setErrorToDisplay(e)
            })

        // // NOT NEEDED ANYMORE
        // userDataMigration()
        //     .then(changed=>{
        //         console.log('migration', changed.data)
        //     })
        //     .catch(e=>console.log('migration', e))

    }

    let submitForm = e=>{
        e.preventDefault()

        let submit = async ()=>{
            // if the action has changed on this submit (ex: auto-submit), cancel submit and let form update
            let email = emailRef.current.value
            if(await checkEmail(email)) return
            
            if(action=='signin') await signIn()
            else await createAccount()
        }
        submit()
    }

    let title = 'Sign In / Create Account' // action=='signin' ? 'Sign In' : 'Create Account'

    return <Card {...props} className={'small-card '+(props.className||'')} >
        <Card.Title as='h3' className='mt-3 text-center'>
            {title}
        </Card.Title>
        <hr/>
        <Card.Body as='form' onSubmit={submitForm}>
            <Card.Text> 
                {action=='create' && <input type="text" className="form-control" name='name' ref={nameRef} placeholder="Name"/>}
                <input type="email" className="form-control" name='email' ref={emailRef} placeholder="Email" onBlur={e => checkEmail(e.target.value)} />
                <input type="password" className="form-control" name='password' ref={pwdRef} placeholder="Password" />
            </Card.Text>
            <Card.Text as='div'>
                <div className="d-flex flex-centered">
                    <button type="button" className="btn btn-round btn-secondary m-1" onClick={props.onCancel} >Cancel</button>
                    <button type="submit" className="btn btn-round btn-primary m-1" id="submitAuth" onClick={submitForm}>Submit</button>
                </div>
                <div id="error-message" className="text-danger py-2">{errorMessage}</div>
            </Card.Text>
            {
                showResetPassword &&
                <Card.Text as='div'>
                    <div className="d-flex flex-centered">
                        <button type="button" className="btn btn-round btn-secondary m-1" onClick={
                            function() {
                                let email = emailRef.current.value;

                                if (!validEmail(email)) {
                                    setErrorToDisplay("Please enter a valid email.")
                                }
                                else {
                                    firebase.auth().sendPasswordResetEmail(emailRef.current.value)
                                        .then(function () {
                                            // User has been sent a password reset email with a link to do the reset.
                                            setInfoMessage("You should receive a password reset email within the next 5 minutes. Follow the instructions inside to reset your password, then try logging in with your new password. If you don't receive an email in the next 5 minutes, try clicking Reset Password again.");
                                            setErrorMessage("");
                                        })
                                        .catch((errorMsg) => {
                                            // Error occurred trying to reset email.
                                            setErrorToDisplay(errorMsg);
                                        });
                                }
                            }
                        } >Reset Password</button>
                    </div>
                </Card.Text>
            }
            {/* Place the info message below the Password Reset button because it's an info message informing of password reset success.*/}
            <Card.Text as='div'>
                <div id="info-message" className="p-1 text">{infoMessage}</div>
            </Card.Text>
        </Card.Body>
        <Card.Footer >
            <a href={tosUrl} className="p-1">Terms of Service</a>
            &#x27E1; {/* Diamond */}
            <a href={privacyPolicyUrl} className="p-1">Privacy Policy</a>
        </Card.Footer>
    </Card>
}