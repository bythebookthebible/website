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
            <Card.Title as='h2' className='mt-2'>Congratulations!</Card.Title>
            <Card.Text>
                You have been memorizing so much scripture in the last 30 days!
            </Card.Text>
        </Card.Header>
        <Card.Body as='form' onSubmit={e=>{e.preventDefault()}} >
            <Card.Text className='text-left mt-4'>
                <input type='radio' name='plan' value='basic' defaultChecked/>
                <label>$4.99 / month Basic Plan</label><br/>
                <input type='radio' name='plan' value='6month'/>
                <label>$24.99 / 6 Months</label><br/>
                <input type='radio' name='plan' value='family'/>
                <label>$8.99 / month Family Supporter</label><br/>
                <input type='radio' name='plan' value='super'/>
                <label>$19.99 / month Super Supporter</label><br/>
            </Card.Text>
            {/* <Card.Text>
                <label>{user.displayName}</label><br />
                <label>{user.email}</label><br />
            </Card.Text> */}
            <Card.Text>
                <button className='btn btn-round btn-primary' onClick={async () => {
                    // Create account if needed
                    console.log($())
                    console.log($('input[name="plan"]:checked').val())
                    console.log({
                        items: [{plan: plans[$('input[name="plan"]:checked').val()]}]
                    })
                    const session = await createSession({
                        items: [{plan: plans[$('input[name="plan"]:checked').val()]}]
                    })
                    console.debug(session)
                    // When the customer clicks on the button, redirect them to Checkout.
                    const stripe = await stripePromise;
                    const error = await stripe.redirectToCheckout({sessionId: session.data.id});
                    console.error(error.message)
                }}>Continue Memorizing</button>
            </Card.Text>
            <Card.Text>
                <b>
                    If you just created your account, you have a 30 day free trial. Refresh and you are good to Go!
                </b>
            </Card.Text>
        </Card.Body>
    </Card>
}