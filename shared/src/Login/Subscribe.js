import React from 'react'
import {loadStripe} from '@stripe/stripe-js'
import $ from "jquery"
import { Card } from 'react-bootstrap';
import { AbsoluteCentered } from '../components';
import { getFunctions, httpsCallable } from "firebase/functions";

var createSession = httpsCallable(getFunctions(), 'createCheckoutSession');

// Config data is imported from .env files, to allow for development to use a testing server
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY)
const plans = JSON.parse(process.env.REACT_APP_STRIPE_PLANS)

export default function Subscribe(props) {
    return <AbsoluteCentered>
        <SubscribeForm />
    </AbsoluteCentered>
}

function SubscribeForm(props) {
    let user = props.user
    console.log(user)

    return <Card {...props} className={'small-card mx-auto mt-5 text-center '+(props.className||'')} >
        <Card.Header>
            <Card.Title as='h2' className='mt-2'>Memory Adventure</Card.Title>
        </Card.Header>
        <Card.Body as='form' onSubmit={e=>{e.preventDefault()}} >
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
            $<input type='number' name='amount' defaultValue="5" />

            <Card.Text>
                <button className='btn btn-round btn-primary' onClick={async () => {
                    // Create account if needed
                    console.log($())
                    console.log($('input[name="plan"]:checked').val())
                    console.log({
                        items: [{plan: plans[$('input[name="plan"]:checked').val()]}]
                    })
                    const sessionId = await createSession({
                        items: [{plan: plans[$('input[name="plan"]:checked').val()]}]
                    })
                    console.debug(session)
                    // When the customer clicks on the button, redirect them to Checkout.
                    const stripe = await stripePromise;
                    const error = await stripe.redirectToCheckout({sessionId});
                    console.error(error.message)
                }}>Partner with us!</button>
            </Card.Text>
        </Card.Body>
    </Card>
}