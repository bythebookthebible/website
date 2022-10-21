import React, { useRef, useState } from 'react'
import {loadStripe} from '@stripe/stripe-js'
import $ from "jquery"
import { Card } from 'react-bootstrap';
import { AbsoluteCentered } from '../components';
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from '../firebase';
import { UserWidget } from './User';
import { Split } from '@bedrock-layout/primitives';

var createSession = httpsCallable(getFunctions(), 'createCheckoutSession');

// Config data is imported from .env files, to allow for development to use a testing server
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)
const plans = JSON.parse(process.env.REACT_APP_STRIPE_PLANS)
const tosUrl = '/terms.html'
const privacyPolicyUrl = '/privacy.html'

const firebaseFunctions = getFunctions()
const createPartnerCheckout = httpsCallable(firebaseFunctions, 'createPartnerCheckout');
const declinePartnership = httpsCallable(firebaseFunctions, 'declinePartnership');


export default function Subscribe(props) {
    let user = useAuth()
    const priceRef = useRef()
    const [errorMessage, setErrorMessage] = useState("");

    function setErrorToDisplay(e) {
        console.error(e);
        let msg = e.message || e
        setErrorMessage(msg);
    }

    async function submitForm(e) {
        e.preventDefault()

        let price = priceRef.current.value

        // validate input
        if (price < 0) setErrorToDisplay("Positive Numbers Only ;)")
        else if (price > 0 && price < 0.50) setErrorToDisplay("The minimum value is $0.50, due to processing fees. ")

        else {
            if(price == 0) {
                // dont do a checkout session, rather mark as free account
                await declinePartnership()
            } else {
                const sessionId = (await createPartnerCheckout({
                    price,
                    success_url: window.location.origin,
                    cancel_url: window.location.href,
                })).data
                const stripe = await stripePromise
                stripe.redirectToCheckout({sessionId})
                    .catch(e=>{console.error(e.message)})
            }
        }
    }


    return <Split fraction="1/2" style={{height: "100vh"}}>
        <div style={{backgroundColor: "#018", color: "white"}}>
            <UserWidget />
            <form style={{margin: "5vw"}} onSubmit={submitForm}>
                <h1>Your Memorization Journey!</h1>
                {/* <p>Digital access to all BtB products, memorization tools, resources, & curriculum.</p> */}
                {/* <p>{user?.displayName || ''},</p> */}

                <p>We've invested so much in developing these high quality products to serve you guys. Although we have every reason to set price for our products and services, we'd rather us both overate our of generocity. For our part, we'll give our products & services, and on your part you can give according to what God has given you.</p>

                <input type='number' name='amount' placeholder='$ Amount/Month' ref={priceRef} className="form-control"/>

                <label for='amount'>Suggested $5/month subscription</label>

                <div className="d-flex flex-centered">
                    <button type="submit" className="btn btn-round btn-primary m-1 w-100 mb-2" id="submitAuth">Next</button>
                </div>
                <div id="error-message" className="text-danger">{errorMessage}</div>
                <p>
                    <a href={tosUrl} className="p-1">Terms of Service</a>
                    <span style={{color:'lightgrey',margin:'0 .25rem'}}>|</span>
                    <a href={privacyPolicyUrl} className="p-1">Privacy Policy</a>
                </p>
            </form>
        </div>


        <div style={{margin: "5vw"}}>
            <ul data-bullet='<i class="fas fa-circle-check"></i>'>
                <li>Access all updated By the Book memorization tools.</li>
                <li>Digital access to all By the Book curriculum & products</li>
            </ul>
        </div>
    </Split>
}