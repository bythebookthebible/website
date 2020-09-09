import React from 'react';
import {NavDropdown, NavLink} from 'react-bootstrap'

import { firebase } from '../firebase'
import { useSelector } from 'react-redux';

export function UserNavButton(props) {
    let {buttons, ...otherProps} = props

    let auth = useSelector(state => state.firebase.auth)

    // !auth.isLoaded check should not be needed. If not logged in, should be on the login page
    if(auth.isEmpty) return null

    return <NavDropdown title={auth.displayName} as={NavLink}>
        {/* <NavDropdown.Item href='/account' >My Account</NavDropdown.Item> */}
        {buttons && buttons.map(b => <NavDropdown.Item {...otherProps} onClick={b.onClick} key={b.key} >
            {b.content}
        </NavDropdown.Item>)}

        <NavDropdown.Item {...otherProps} onClick={() => {
            firebase.auth().signOut().catch(function(e) {
                    console.log('Signout error: ', e);
                });
        }}>Logout</NavDropdown.Item>
    </NavDropdown>
}

export function AccountSettings(props) {
    let user = props.user
    console.log(user,user.claims)

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