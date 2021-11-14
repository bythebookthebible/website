import React, { useState, useRef} from 'react';
import { Card } from 'react-bootstrap';

import {firebase} from '../firebase'
import { PlayfulPlainContainer } from './components';
import './CreateAccount';

const tosUrl = '/terms.html';
const privacyPolicyUrl = '/privacy.html';

function validEmail(email) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

export default function ForgotPass({ setAction, checkEmail }) {
    return <PlayfulPlainContainer>
        <ForgotPassForm setAction={setAction} checkEmail={checkEmail} />
    </PlayfulPlainContainer>
}
function ForgotPassForm(props) {
    const { setAction, checkEmail } = props;

    const [errorMessage, setErrorMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const sendEmail = async (e) => {
        e.preventDefault();
        let email = emailRef.current.value;
        if (!validEmail(email)) return setErrorMessage("Please enter a valid email.");

        firebase.auth().sendPasswordResetEmail(email)
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

    return (
    <Card {...props} className={'small-card '+(props.className||'')} >
        <div style={{color:'gray', display:'flex', justifyContent: 'space-evenly', padding: '1.5rem 0.75rem 0rem'}}>
            <h5 onClick={() => setAction('create')} style={{borderBottom:0}} className='form-header'>Create Account</h5>
            <h5 className='form-header'>Sign In</h5>
        </div>
        <div style={{marginBottom: '1rem', borderBottom: '1px solid lightgray'}} />
        <Card.Body as='form' onSubmit={sendEmail} style={{paddingBottom:0}}>
            <Card.Text style={{color:'#5b6267',fontWeight:700, fontSize:'1.25rem',marginBottom:'.5rem'}}>
                { !submitted ? (
                    'Forgot your password.'
                  ) : (
                    'Password reset email sent.'
                )}
            </Card.Text>
            <Card.Text style={{fontSize:'.9rem'}}>
                { !submitted ? (
                    'Enter your email to recieve instructions on how to reset your password.'
                ) : (
                    'You should receive a password reset email within the next five minutes. Follow the instructions inside to reset your password, then try logging in with your new password. If you don’t receive an email in the next five minutes, try clicking "Resend Email."'
                )}
            </Card.Text>
            <Card.Text style={submitted ? {height:0,margin:0} : {}}> 
                <input type="email" style={{visibility: !submitted ? 'visible':'hidden'}} className="form-control mb-2" name='email' ref={emailRef} placeholder="Email" onBlur={e => checkEmail(e.target.value)} />
            </Card.Text>
            { !submitted ? (
                    <button type="submit" className="btn btn-round btn-primary m-1 w-100" id="submitAuth">Submit</button>
                ) : (<>
                    <button type="submit" style={{background:'#5b6267', borderColor:'#5b6267'}} className="btn btn-round btn-primary m-1 w-100">Resend Email</button>
                    <button onClick={() => setAction('signin')} className="btn btn-round btn-primary m-1 w-100">Return to Sign in</button></>
                )
            }
            

            {/* Place the info message below the Password Reset button because it's an info message informing of password reset success.*/}
            <Card.Text as='div'>
                <div id="info-message" style={{color:'#d10909'}} className="p-1 text">{errorMessage}</div>
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
    )
}
