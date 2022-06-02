import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import './login.scss';

import { auth } from '../firebase'
import { fetchSignInMethodsForEmail } from "firebase/auth"
import { AbsoluteCentered } from '../components'

import LoginComp from './Login';
import CreateAccount from './CreateAccount';
import ForgotPass from './ForgotPass';

const tosUrl = '/terms.html'
const privacyPolicyUrl = '/privacy.html'

export function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

export async function accountExists(email) {
    if(validEmail(email)) {
        let methods = await fetchSignInMethodsForEmail(auth, email)        
        if (methods.length > 0) return true;
    }
    // switch state to login
    return false
}

let loginStates = {
    'signin': 'signin',
    'create': 'create',
    'forgot': 'forgot',
}

export default function LoginSignup(props) {
    const [action, setAction] = useState('signin');

    let body = ''
    switch (action) {
        case loginStates.signin:
            body = <LoginComp setAction={setAction} />
            break
        case loginStates.create:
            body = <CreateAccount setAction={setAction} /> 
            break
        case loginStates.forgot:
            body = <ForgotPass setAction={setAction} /> 
            break
    }

    return <AbsoluteCentered>
        <Card {...props} style={{width:"20rem", maxWidth:"100%"}} >
            <div className='form-header'>
                <h5 className={'form-header-item' + (action===loginStates.create ? ' selected' : '')}
                    onClick={() => setAction(loginStates.create)}
                >
                    Create Account
                </h5>
                <h5 className={'form-header-item' + ((action===loginStates.signin || action===loginStates.forgot) ? ' selected' : '')}
                    onClick={() => setAction(loginStates.signin)}
                >
                    Sign In
                </h5>
            </div>

            {body}

            <div className='form-footer'>
                <Card.Text>
                    <a href={tosUrl} className="p-1">Terms of Service</a>
                    <span style={{color:'lightgrey',margin:'0 .25rem'}}>|</span>
                    <a href={privacyPolicyUrl} className="p-1">Privacy Policy</a>
                </Card.Text>
            </div>
        </Card>
    </AbsoluteCentered>
}
