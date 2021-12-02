import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import './login.scss';

import { auth } from '../firebase'
import { PlayfulPlainContainer } from './components';
import LoginComp from './Login';
import CreateAccount from './CreateAccount';
import ForgotPass from './ForgotPass';

const tosUrl = '/terms.html'
const privacyPolicyUrl = '/privacy.html'

export function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

// checks the email to change between signin and signup
// returns true if the action was changed
export async function checkEmail(email) {
    if(validEmail(email)) {
        let methods = await auth.fetchSignInMethodsForEmail(email)        
        if (methods.length == 0) return true;
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
    const [action, setAction] = useState('create');

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

    return <PlayfulPlainContainer>
        <Card {...props} className={'small-card '+(props.className||'')} >
            <div style={{color:'gray', display:'flex', justifyContent: 'space-evenly', padding: '1.5rem 0.75rem 0rem'}}>
                <h5 className={'form-header' + (action===loginStates.create ? ' selected' : '')}
                    onClick={() => setAction(loginStates.create)}
                >
                    Create Account
                </h5>
                <h5 className={'form-header' + ((action===loginStates.signin || action===loginStates.forgot) ? ' selected' : '')}
                    onClick={() => setAction(loginStates.signin)}
                >
                    Sign In
                </h5>
            </div>
            <div style={{marginBottom: '1rem', borderBottom: '1px solid lightgray'}} />

            {body}

            <div className='form-footer'>
                <Card.Text style={{background:'none'}}>
                    <a href={tosUrl} className="p-1">Terms of Service</a>
                    <span style={{color:'lightgrey',margin:'0 .25rem'}}>|</span>
                    <a href={privacyPolicyUrl} className="p-1">Privacy Policy</a>
                </Card.Text>
            </div>
        </Card>
    </PlayfulPlainContainer>
}
