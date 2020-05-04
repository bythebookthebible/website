import React, { Component, useEffect, useState} from 'react';
import {useAuth} from '../hooks.js'
import {Login} from '../forms/Login'
import {Navbar, Nav, NavDropdown, NavLink} from 'react-bootstrap'
import {Row, Col} from 'react-bootstrap'
import {loadStripe} from '@stripe/stripe-js'

var firebase = require('firebase');

const stripePromise = loadStripe('pk_test_9tSyLuCY9rI4tFCjQ8MPpUxg00vLcOqtaT');

// TESTING PLAN VALUES
const plans = {
    'basic':'plan_H8svWXaTyTFxtI',
    '6month':'plan_H8syj9jb8d6P0o',
    'family':'plan_H8sxFioNADFL4p',
    'super':'plan_H8szUndIpfJBm9',
}


export function UserNavButton(props) {
    let [user, claims] = useAuth(true)

    if(!user) {
        return <Login.LoginButton {...props} />
    }
    return [
        <NavDropdown title={user.displayName} as={NavLink}>
            {claims.admin && <NavDropdown.Item href='/manage' >Admin</NavDropdown.Item>}
            <NavDropdown.Item href='/account' >My Account</NavDropdown.Item>
            <NavDropdown.Item {...props} onClick={() => {
                firebase.auth().signOut().then(function(user) {
                        console.log('Signed out');
                    }).catch(function(e) {
                        console.log('Signout error: ', e);
                    });
            }}>Logout</NavDropdown.Item>
        </NavDropdown>,
    ]
}

export function AccountSettings(props) {
    let [user, claims] = useAuth(true)
    console.log(user,claims)

    return user && <table className='container form'><tbody>

        <tr><label>--COMING SOON--</label></tr>

        <tr><label>Full Name</label></tr>
        <tr><input type='text' defaultValue={user.displayName}/></tr>

        <tr><label>Email</label></tr>
        <tr><input type='email' defaultValue={user.email}/></tr>

        <tr><button readOnly={true} onClick={async () => {
            // const stripe = await stripePromise;

        }}>Submit Changes</button></tr>

        <tr><label>Subscription Plan</label></tr>

        
        {/* change password */}
        {/* subscription: subscribe / change / cancel */}
    </tbody></table>
}