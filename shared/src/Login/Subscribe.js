import React, { useRef, useState } from 'react'
import {loadStripe} from '../../../simpler/node_modules/@stripe/stripe-js/types'
import $ from "jquery"
import { Card } from 'react-bootstrap';
import { AbsoluteCentered } from '../components';
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from '../firebase';
import { UserWidget } from './User';
import { Cover, Split, Stack } from '@bedrock-layout/primitives';

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


    return <Split fraction="1/2" style={{minHeight: "100vh"}}>
        <Cover className='darkBackground' top={<UserWidget />}>
            <Stack as="form" gap={4} style={{padding: "5vw"}} onSubmit={submitForm}>
                <div><h1>Your Memorization Journey!</h1></div>
                {/* <p>Digital access to all BtB products, memorization tools, resources, & curriculum.</p> */}
                {/* <p>{user?.displayName || ''},</p> */}

                <div>
                    <p>We've invested so much in developing these high quality products to serve you guys. In order to follow Christ's lead in servitude, we are choosing to not fix a high price point, but rather to give our work in support of God's people. If you choose, please give back to us according to however God has blessed you.</p>
                </div>

                <div>
                    <input type='number' data-button="round" name='amount' placeholder='$ Amount/Month' ref={priceRef} className="form-control mt-3"/>
                    <label>Suggested $5/month subscription</label>
                </div>

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