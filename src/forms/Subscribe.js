import React, { Component, useState} from 'react'
import {loadStripe} from '@stripe/stripe-js'
import $ from "jquery"

const firebase = require('firebase');

const createSession = firebase.functions().httpsCallable('createCheckoutSession');
const stripePromise = loadStripe('pk_test_9tSyLuCY9rI4tFCjQ8MPpUxg00vLcOqtaT');

// TESTING PLAN VALUES
const plans = {
    'basic':'plan_H8svWXaTyTFxtI',
    '6month':'plan_H8syj9jb8d6P0o',
    'family':'plan_H8sxFioNADFL4p',
    'super':'plan_H8szUndIpfJBm9',
}

export default function Subscribe(props) {
    let user = props.user
    console.log(user)

    let userInfo = user ?
        [
            <label>{user.displayName}</label>,<br />,
            <label>{user.email}</label>,<br />,
        ] :
        [
            <input type='text' placeholder='Full Name' />,<br/>,
            <input type='email' placeholder='email' />,<br/>,
            <input type='password' placeholder='password' />,<br/>,
            <a href='/login?to=/subscribe'>or login</a>,<br/>,
        ]

    return (
        <div className="form">
            <input type='radio' name='plan' value='basic' defaultChecked/>
            <label>$4.99 / month Basic Plan</label><br/>
            <input type='radio' name='plan' value='6month'/>
            <label>$24.99 6 Months</label><br/>
            <input type='radio' name='plan' value='family'/>
            <label>$8.99 / month Family Supporter</label><br/>
            <input type='radio' name='plan' value='super'/>
            <label>$19.99 / month Super Supporter</label><br/>

            {userInfo}

            <button onClick={async () => {
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
            }}>Buy Now</button>
        </div>
    )
}