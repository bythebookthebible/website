import React, { useEffect, useRef, useState } from 'react'
import {loadStripe} from '@stripe/stripe-js'
import $ from "jquery"
import { Card } from 'react-bootstrap';
import { AbsoluteCentered } from '../components';
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAuth } from '../firebase';
import { UserWidget } from './User';
import { Cover, Split, Stack } from '@bedrock-layout/primitives';

// Config data is imported from .env files, to allow for development to use a testing server
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)
const plans = JSON.parse(process.env.REACT_APP_STRIPE_PLANS)
const tosUrl = '/terms.html'
const privacyPolicyUrl = '/privacy.html'

const firebaseFunctions = getFunctions()
const createPartnerCheckout = httpsCallable(firebaseFunctions, 'createPartnerCheckout');
const declinePartnership = httpsCallable(firebaseFunctions, 'declinePartnership');
const getPartnershipStatus = httpsCallable(firebaseFunctions, 'getPartnershipStatus');
const manageBilling = httpsCallable(firebaseFunctions, 'createBillingManagementSession');

export function ManageAccount(props) {
    let user = useAuth()
    const priceRef = useRef()
    const [errorMessage, setErrorMessage] = useState("");

    const isSubscribed = user && user.profile?.partnerSince && !user.profile?.freePartner
    const [partnerRate, setPartnerRate] = useState()

    useEffect(() => {
        let nvm = false
        if(user) {
            getPartnershipStatus().then(({data}) => {
                console.log({data})

                if(data.length > 1) console.warn("You seem to have multiple active subscriptions, is this correct?")
                if(data.length === 0) {
                    // not subscribed
                    if(partnerRate) setPartnerRate(0)
                    return
                }

                const subscription = data[0]
                console.log({subscription})

                const subItem = subscription.items.data[0]
                const partnerRate = subItem.quantity * subItem.price.unit_amount / 100
                console.log({partnerRate})

                setPartnerRate(partnerRate)
            })
        }
        return ()=>{nvm=true}
    }, [user.email, isSubscribed])

    /**
     * Display Name & Email - later maybe change
     * Reset Password Button
     * 
     * if subscribed:
     *   Display amount subscribed
     *   Change amount button
     * 
     * not subscribed:
     *   Create partner same as create account 
    */

    function setErrorToDisplay(e) {
        console.error(e);
        let msg = e.message || e
        setErrorMessage(msg);
    }

    async function verifyAndCheckout(e) {
        e.preventDefault()

        const price = priceRef.current.value
        // validate input
        if (price < 0) setErrorToDisplay("Positive Numbers Only ;)")
        else if (price > 0 && price < 0.50) setErrorToDisplay("The minimum value is $0.50, due to processing fees. ")
        else {
            if(price === 0) {
                await declinePartnership()
                setErrorMessage("")

            } else if(price == '') {

                setErrorToDisplay("Please enter a partnership amount.")
            } else {
                const sessionId = (await createPartnerCheckout({
                    price,
                    success_url: window.location.origin,
                    cancel_url: window.location.href,
                })).data
                const stripe = await stripePromise
                stripe.redirectToCheckout({sessionId})
                    .catch(e=>{console.error(e.message)})
                setErrorMessage("")
            }
        }
    }

    async function manageSubscription(e) {
        e.preventDefault()

        const session = (await manageBilling({
            return_url: window.location.href,
        })).data

        console.log(session)

        window.location = session.url
    }

    const notSubscribedMessage = <>
        <div>{user?.displayName || ''},</div>
        <div>
            We've invested so much in developing these high quality products to serve you guys. In order to follow Christ's lead in servitude, we are choosing to not fix a high price point, but rather to give our work freely in support of God's people. If you choose, please give back to us according to however God has blessed you.
        </div>

        <div>
            <input type='number' data-button="round outline negative" name='amount' placeholder='$ Amount/Month' ref={priceRef} className="form-control"/>
            <em>Suggested $5/month subscription</em>
        </div>

        <button onClick={verifyAndCheckout} data-button="round outline negative" className="btn" id="submitAuth">Next</button>
    </>

    const subscribedMessage = <>
        <div>{user?.displayName || ''},</div>
        <div>
            We've invested so much in developing these high quality products to serve you guys. In order to follow Christ's lead in servitude, we are choosing to not fix a high price point, but rather to give our work freely in support of God's people.
        </div>
        <div>
            Currently, you are partering with us at ${partnerRate}, but if you'd like to change that, you can do so below.
        </div>

        <button onClick={manageSubscription} data-button="round outline negative" className="btn" id="submitAuth">Edit Partnership</button>
        {errorMessage && <div id="errorMessage" data-button="round outline negative">{errorMessage}</div>}
    </>


    return <Split fraction="2/3" style={{minHeight: "100vh", maxWidth: "60rem"}}>
        <Cover className='darkBackground' top={<UserWidget />}>
            <Stack as="form" style={{gap: "1.5rem", padding: "5vw"}}>
                <div><h1>Keep Up Your Memorization Journey!</h1></div>

                {partnerRate ? subscribedMessage : notSubscribedMessage}

                {errorMessage && <div id="errorMessage" data-button="round outline negative">{errorMessage}</div>}

                {!props.noSubscriptionYet && <div onClick={()=>window.location.pathname = "/"} className="link ">⟵ Back to Memorizing</div>}
            </Stack>
        </Cover>
        <div style={{padding: "5vw"}}>
            {/* <ul data-bullet="circle-check">
                <li>Complete digital Access to all updated By the Book <u>memorization tools</u>:<ul>
                    <li>Basic Mnemonic tracks</li>
                    <li>'Looping' version</li>
                    <li>'Audio' version</li>
                    <li>'Visual' version</li>
                    <li>'Dance' version</li>
                    <li>'Echo' version</li>
                    <li>'Slow/Speed' version</li>
                    <li>'Blooper' version</li>
                    <li>'Karaoke' version</li>
                    <li>'Relax' version</li>
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
                    <li>'Schmo toon' life-application video</li>
                </ul></li>

                <li>Complete digital access to all <u>updated BtB content</u>: (currently including)<ul>
                    <li>James (all 5 chapters)</li>
                    <li>1 John (all 5 chapters)</li>
                    <li>Malachi (all 4 chapters)</li>
                    <li>Matthew (chapter 5-7)</li>
                    <li>Psalm 1</li>
                    <li>Various other passages</li>
                </ul></li>
            </ul> */}
        </div>
    </Split>
}
