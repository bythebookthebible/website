import React, { useState, useRef} from 'react';
import { Modal, Card } from 'react-bootstrap';
import $ from 'jquery'

import {firebase} from '../firebase'
var auth = firebase.auth()
// var firebaseui = require('firebaseui');

const tosUrl = '/terms.html'
const privacyPolicyUrl = '/privacy.html'

var userDataMigration = firebase.functions().httpsCallable('userDataMigration');
var initUser = firebase.functions().httpsCallable('initUser');

export var Login = {
    LoginButton: LoginButton,
    LogInOutButton: LogInOutButton,
    LoginFrom: LoginForm,
    AuthSwitch: AuthSwitch,
}

export default LoginForm

function LogInOutButton(props) {
    let user = props.user

    if(user) {
        return <div className="btn btn-round btn-primary" onClick={() => {
                auth.signOut().then(function(user) {
                    }).catch(function(e) {
                        console.log('Signout error: ', e);
                    });
            }}>Logout</div>
    } else {
        return <LoginButton className="btn-secondary" />
    }
}

function LoginButton(props) {
    const [show, setShow] = useState(false);

    return <>
        <button {...props} className="btn btn-round btn-primary" onClick={() => setShow(true)}>Login</button>
        <Modal onHide={() => setShow(false)} show={show} size="sm" aria-labelledby="authTitle" centered>
            <LoginForm {...props} onCancel={()=>setShow(false)} />
        </Modal>
    </>
}

// requires withAuth
function AuthSwitch(props) {
    let {user, tests, ...passThru} = props
    if(!user) {
        return <LoginForm className='mt-5 mx-auto' user={user} {...passThru} />
    }
    for(let {test, value} of tests) {
        if(test(user)) return React.cloneElement(value, {user, ...passThru})
    }
    return React.cloneElement(props.default || props.children, {user, ...passThru})
}

function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

function LoginForm(props) {
    const [showResetPassword, setShowResetPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [action, setAction] = useState('signin')

    const emailRef = useRef()
    const pwdRef = useRef()
    const nameRef = useRef()

    function error(e) {
        let msg = e.message || e
        // Change some error messages
        if(e.code === 'auth/wrong-password') msg = 'Invalid Password.'
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
            error("Please enter a valid email.")
        else if (password.length === 0)
            error("Please enter password.")
        else if (name.length === 0)
            error("Please enter your name.")
        else {
            // console.log('create account', email, name, password.replaceAll(/./g, '*'))

            await auth.createUserWithEmailAndPassword(email, password).catch(error)
            await firebase.auth().currentUser.updateProfile({displayName: name}).catch(error)
            await initUser().then(setTimeout(()=>window.location.reload(), 100))
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
                error(e)
            })

        userDataMigration()
            .then(changed=>{
                console.log('migration', changed.data)
            })
            .catch(e=>console.log('migration', e))

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
            {showResetPassword && <Card.Text id="resetPassword" className="p-1 text-center">
                Having Trouble?
                <a href="" className="mx-1" onClick={() =>
                    auth.sendPasswordResetPassword($("#email").val()).catch(error) // TODO set better response message
                }>Reset Password</a>
            </Card.Text>}
        </Card.Body>
        <Card.Footer >
            <a href={tosUrl} className="p-1">Terms of Service</a>
            &#x27E1; {/* Diamond */}
            <a href={privacyPolicyUrl} className="p-1">Privacy Policy</a>
        </Card.Footer>
    </Card>
}