import React, { Suspense, useRef, useEffect, useState, useCallback } from "react";
import "./index.scss";
import "./app.scss";
import { Navbar, Nav } from "react-bootstrap";
import {LoadingPage} from '../common/components'
import { UserNavButton } from "../common/User";

import { useSelector } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";

import LoginSignup from '../common/LoginSignup';
import Subscribe from "./Subscribe";

const Playful = React.lazy(()=>import('../playfulMode/Playful'))

export default function App(props) {
  let setNavButtons = useRef(()=>null)

  // Add admin item to menu if applicable
  const profile = useSelector(state => state.firebase.profile)
  useEffect(() => {
    let setButtons = setNavButtons && setNavButtons.current
    if (setButtons && profile.isLoaded && profile.token && profile.token.claims.admin) {
      let userButtons = {content: 'Admin', key: 'Admin', onClick: () => window.location.assign('https://admin.bythebookthebible.com')}
      setButtons({owner:'App', userButtons})
    }
    
    return () => {
      setButtons && setButtons({owner:'App', userButtons:[]})
    }
  }, [setNavButtons.current && profile.isLoaded && profile.token && profile.token.claims.admin])

  return <Router>
    <LightNav {...{setNavButtons}} />
    <AuthSwitch>
      <Suspense fallback={<LoadingPage title="Loading Content..."/>}>
        <Playful setNavButtons={setNavButtons} />
      </Suspense>
    </AuthSwitch>
  </Router>
}

function AuthSwitch(props) {
  // const rehydrated = useSelector(state => state._persist.rehydrated)
  const auth = useSelector(state => state.firebase.auth)
  const profile = useSelector(state => state.firebase.profile)

  // login / loading / error cases
  // if(!rehydrated) return <LoadingPage /> // loading last state
  if(!auth.isLoaded) return <LoadingPage title="Loading Profile..."/> // loading auth
  if(auth.isEmpty) return <LoginSignup /> // not logged in
  if(!profile.isLoaded) return <LoadingPage title="Loading Profile..."/> // loading profile (and claims)
  if(profile.isEmpty) {
    console.error('Invalid state empty profile: logged in but no profile (should not happen)') // logged in but no profile (should not happen)
    return <ErrorMsg />
  }

  const claims = profile.token.claims
  if(!claims.expirationDate) {
    // account is not initialized yet on the back end
    // let firebase initialize (wait or trigger)
    return <LoadingPage title="Preparing Account..."/>
  }
  if(claims.admin || claims.permanentAccess || claims.expirationDate - Date.now() > 0) {
    return props.children // logged in successfully
  }

  // check stripe status:
  // if there is no subscription (and we already checked the trial is expired)
  return <Subscribe />
  // if there is a subscription that has been canceled or has an error or something, prompt accordingly
}

const ErrorMsg = props => <div className='text-center p-5'>
  <img src='https://www.biblestudytools.com/Content/Images/file-not-found.jpg' className='mw-100' />
  <h3>
    Oops, we broke something...<br />
    Try <a href='/'>refreshing the page</a>
    or email <a href='mailto:rose@bythebookthebible.com'>rose@bythebookthebible.com</a>
  </h3>
</div>

const LightNav = props => {
  // need a ref to allow multiple updates in one cycle,
  // and a state to ensure rerendering
  let [buttons, setButtons] = useState({})
  let buttonsByOwner = useRef({})

  // set button tracking factory
  let setNavButtons = useCallback(b => {
    buttonsByOwner.current = {...buttonsByOwner.current, [b.owner]:{user:b.userButtons, nav:b.navButtons}}
    console.log(b, buttonsByOwner.current)
    setButtons(buttonsByOwner.current)
  }, [])

  if(props.setNavButtons)
    props.setNavButtons.current = setNavButtons

  // get both sets of buttons for top-level nav buttons, and dropdown items under the user button
  let {userButtons, navButtons} = Object.values(buttons).reduce((cum, cur) => {
    cum.userButtons = cum.userButtons.concat(cur.user || [])
    cum.navButtons = cum.navButtons.concat(cur.nav || [])
    return cum
  }, {userButtons:[], navButtons:[]})
  
  return <Navbar collapseOnSelect className='lightNav'>

    <Nav>      
      {navButtons.map(b => 
        <Nav.Item onClick={b.onClick} key={b.key} >
            {b.content}
        </Nav.Item>
      )}

      <UserNavButton buttons={userButtons} />
    </Nav>
  </Navbar>
}
