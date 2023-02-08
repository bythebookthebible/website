import React, { useState, useRef } from 'react';
import { Card, Stack } from 'react-bootstrap';
import { accountExists, validEmail } from './LoginSignup';

import { auth } from '../firebase'
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions";

import {loadStripe} from '../../../simpler/node_modules/@stripe/stripe-js'
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

export function CreateAccount(props) {
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
                .then(updateProfile(auth.currentUser, { displayName: name }))
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
        <div className='darkBackground'>
            <Stack as="form" gap={5} style={{padding: "5vw"}} onSubmit={submitForm}>
                <div>
                    <h1 style={{fontSize: "3rem", lineHeight: "3rem"}}>Start Your Memorization Journey!</h1>
                    <em>Digital access to all BtB products, memorization tools, resources, & curriculum.</em>
                </div>

                <Stack gap={3}>
                    <input type="text" data-button="round outline negative" name='name' ref={nameRef} placeholder="Name" autoFocus />

                    <input type="email" data-button="round outline negative" name='email' ref={emailRef} placeholder="Email" />

                    <input type="password" data-button="round outline negative" name='password' ref={pwdRef} placeholder="Password" />
                    <em>
                        <p>We've invested so much in developing these high quality products to serve you guys. In order to follow Christ's lead in servitude, we are choosing to not fix a high price point, but rather to give our work in support of God's people. If you choose, please give back to us according to however God has blessed you.</p>
                    </em>
                </Stack>

                <div>
                    <input type='number' data-button="round outline negative" name='amount' placeholder='$ Amount/Month' ref={priceRef} className="form-control"/>
                    <em>Suggested $5/month subscription</em>
                </div>

                <button type="submit" data-button="round outline negative" className="btn" id="submitAuth">Next</button>
                <div id="errorMessage">{errorMessage}</div>
            </Stack>
        </div>
        <div>
            <div style={{display:"flex", justifyContent:"end", margin:"1rem"}}>
                <button data-button="round outline" className="btn" onClick={()=>window.location.pathname = "/"}>Login</button>
            </div>

            <div style={{padding: "0 5vw 5vw"}}>
                <ul data-bullet="circle-check">
                    <li>Complete digital Access to all updated By the Book <u>memorization tools</u>:<ul>
                        <li>Basic Mnemonic tracks</li>
                        <li>‘Looping’ version</li>
                        <li>‘Audio’ version</li>
                        <li>‘Visual’ version</li>
                        <li>‘Dance’ version</li>
                        <li>‘Echo’ version</li>
                        <li>‘Slow/Speed’ version</li>
                        <li>‘Blooper’ version</li>
                        <li>‘Karaoke’ version</li>
                        <li>‘Relax’ version</li>
                    </ul></li>

                    <li>Complete Digital access to all By the Book <u>curriculum & products</u>:<ul>
                        <li>full pdf resource collection</li>
                        <li>Coloring pages pdf</li>
                        <li>Life-application story books pdf</li>
                        <li>illustrated scripture books pdf</li>
                        <li>Craft/Activities pdf</li>
                        <li>Copywork pdf</li>
                        <li>Vocabulary page pdf</li>
                        <li>Worksheet pdf</li>
                        <li>Sheet music pdf</li>
                        <li>Supporting lesson videos</li>
                        <li>Life-application story videos</li>
                        <li>Visual illustration videos</li>
                        <li>Princess exposition video</li>
                        <li>‘Schmo toon’ life-application video</li>
                    </ul></li>

                    <li>Complete digital access to all <u>updated BtB content</u>: (currently including)<ul>
                        <li>James (all 5 chapters)</li>
                        <li>1 John (all 5 chapters)</li>
                        <li>Malachi (all 4 chapters)</li>
                        <li>Matthew (chapter 5-7)</li>
                        <li>Psalm 1</li>
                        <li>Various other passages</li>
                    </ul></li>
                </ul>
            </div>
        </div>
    </Split>
}