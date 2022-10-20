import React, { useState, useRef } from 'react';
import { Card } from 'react-bootstrap';
import { accountExists, validEmail } from './LoginSignup';

import { auth } from '../firebase'
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions";

import {loadStripe} from '@stripe/stripe-js'

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

    async function createAccount() {
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


    let submitForm = async (e) => {
        e.preventDefault();
        await createAccount();
    }

    return <Card.Body as='form' onSubmit={submitForm}>
        {/*** ACCOUNT INFO ***/}
        <Card.Text>
            <input type="text" className="form-control mb-2" name='name' ref={nameRef} placeholder="Name" />
            <input type="email" className="form-control mb-2" name='email' ref={emailRef} placeholder="Email" />
            <input type="password" className="form-control mb-2" name='password' ref={pwdRef} placeholder="Password" />
        </Card.Text>

        {/*** PRICING ***/}
        <Card.Text>
            You are about to embark on an adventure to memorize the Bible.
        </Card.Text>
        <Card.Text>
            Our purpose as By The Book is to help equip the church with it's weapons. 
            This is our gift to you. Everything we have online is yours.
        </Card.Text>
        <Card.Text>
            However, we would also like to ask if you would partner with us to keep this ministry growing.
        </Card.Text>
        <Card.Text>$<input type='number' name='amount' defaultValue="5" ref={priceRef} /></Card.Text>

        {/*** SUBMIT ***/}
        <Card.Text as='div'>
            <div className="d-flex flex-centered">
                <button type="submit" className="btn btn-round btn-primary m-1 w-100 mb-2" id="submitAuth">Next</button>
            </div>
            <div id="error-message" className="text-danger">{errorMessage}</div>
        </Card.Text>


    </Card.Body>
}