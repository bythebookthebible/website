import React from 'react';
import { NavDropdown, NavLink } from 'react-bootstrap'

import { auth, useAuth } from '../firebase'

export function UserWidget(props) {
  let {buttons, ...otherProps} = props
  let user = useAuth()

  buttons = buttons || []
  // add admin button
  if(user?.claims?.admin === true) {
    buttons.push({
      key: "Admin",
      content: "Admin", 
      href: "https://admin.bythebookthebible.com"
    })
  }
  
//   // add user settings button
//   if(user?.claims?.admin === true) {
//     buttons.push({
//       key: "Settings",
//       content: "Settings", 
//       href: "/settings"
//     })
//   }
  
  // add logout button
  if(user) {
    buttons.push({
      key: "Logout",
      content: "Logout", 
      onClick: () => {
        auth.signOut()
        .catch(function(e) { console.log('Signout error: ', e) });
      }
    })
  }

  if(!user) return null
  else return <NavDropdown title={<i className="fas fa-user" 
    style={{fontSize: "1.5rem", padding: 0}} />}
    as={"i"}>

    {buttons && buttons.map(b => 
      <NavDropdown.Item {...otherProps} onClick={b.onClick} href={b.href} key={b.key} >
        {b.content}
      </NavDropdown.Item>
    )}
  </NavDropdown>
}

export function UserSettings(props) {
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