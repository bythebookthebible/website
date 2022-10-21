import React, { useState, useRef } from 'react';
import { Card, Stack } from 'react-bootstrap';
import { accountExists, validEmail } from './LoginSignup';

import { auth } from '../firebase'
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions";

import {loadStripe} from '@stripe/stripe-js'
import { Cover, Split } from '@bedrock-layout/primitives';
import { UserWidget } from './User';

const tosUrl = '/terms.html'
const privacyPolicyUrl = '/privacy.html'

const firebaseFunctions = getFunctions()
const createPartnerCheckout = httpsCallable(firebaseFunctions, 'createPartnerCheckout');
const declinePartnership = httpsCallable(firebaseFunctions, 'declinePartnership');

// Config data is imported from .env files, to allow for development to use a testing server
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)
const plans = JSON.parse(process.env.REACT_APP_STRIPE_PLANS)

export default function CreateAccount(props) {
    const [errorMessage, setErrorMessage] = useState("");

    const emailRef = useRef()
    const pwdRef = useRef()
    const nameRef = useRef()
    const priceRef = useRef()

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

    async function submitForm(e) {
        e.preventDefault();

        let email = emailRef.current.value
        let password = pwdRef.current.value
        let name = nameRef.current.value
        let price = priceRef.current.value

        // validate input
        let emailInUse = await accountExists(email)
        console.log("emailInUse", emailInUse)
        if(!validEmail(email)) setErrorToDisplay("Please enter a valid email.")
        else if(emailInUse) setErrorToDisplay("This email already has an account. Please Sign in.")
        else if (password.length === 0) setErrorToDisplay("Please enter password.")
        else if (name.length === 0) setErrorToDisplay("Please enter your name.")
        else if (price < 0) setErrorToDisplay("Positive Numbers Only ;)")
        else if (price > 0 && price < 0.50) setErrorToDisplay("The minimum value is $0.50, due to processing fees. ")
        else {
            await createUserWithEmailAndPassword(auth, email, password)
                .catch(console.error)
            await updateProfile(auth.currentUser, { displayName: name })
                .catch(setErrorToDisplay)

            if(price == 0) {
                // dont do a checkout session, rather mark as free account
                console.log("free version")
                console.log({declinePartnership: await declinePartnership()})
            } else {
                const sessionId = (await createPartnerCheckout({
                    price,
                    success_url: window.location.origin,
                    cancel_url: window.location.href,
                })).data
                const stripe = await stripePromise
                console.log({stripe})
                stripe.redirectToCheckout({sessionId})
                    .catch(e=>{console.error(e.message)})
            }
        }
    }

    return <Split fraction="1/2" style={{minHeight: "100vh"}}>
        <Cover className='darkBackground' top={<UserWidget />}>
            <Stack as="form" gap={4} style={{padding: "5vw"}} onSubmit={submitForm}>
                <h1>Start Your Memorization Journey!</h1>
                <p>Digital access to all BtB products, memorization tools, resources, & curriculum.</p>

                <Stack gap={2}>
                    <input type="text" data-button="round" className="form-control" name='name' ref={nameRef} placeholder="Name" />

                    <input type="email" data-button="round"  className="form-control" name='email' ref={emailRef} placeholder="Email" />

                    <input type="password" data-button="round"  className="form-control" name='password' ref={pwdRef} placeholder="Password" />
                </Stack>

                <div>
                    <p>We've invested so much in developing these high quality products to serve you guys. In order to follow Christ's lead in servitude, we are choosing to not fix a high price point, but rather to give our work in support of God's people. If you choose, please give back to us according to however God has blessed you.</p>
                </div>

                <input type='number' data-button="round" name='amount' placeholder='$ Amount/Month' ref={priceRef} className="form-control mt-3"/>

                <label for='amount'>Suggested $5/month subscription</label>

                <button type="submit" data-button="round outline negative" className="btn mt-5 mb-5" id="submitAuth">Next</button>
                <div id="error-message" className="text-danger">{errorMessage}</div>
            </Stack>
        </Cover>
        <div style={{padding: "5vw"}}>
            <ul data-bullet="circle-check">
                <li>Access all updated By the Book memorization tools.</li>
                <li>Digital access to all By the Book curriculum & products</li>
            </ul>
        </div>
    </Split>
}