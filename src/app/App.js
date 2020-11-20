import React, { Suspense, useRef, useEffect, useState, useCallback } from "react";
import "./index.scss";
import "./app.scss";
import { Navbar, Nav } from "react-bootstrap";
import {LoadingPage} from '../common/components'
import { UserNavButton } from "../common/User";

import { useSelector, useDispatch } from "react-redux";
import { modes, setMode } from "./createRootReducer";
import { useMemoryResources } from "../common/hooks";

import Login from "../common/Login";
import Subscribe from "./Subscribe";
// import Admin from "../forAdmin/Admin";
// import Focused from '../focusedMode/Focused'
// import Playful from "../playfulMode/Playful";

const Playful = React.lazy(()=>import('../playfulMode/Playful'))
const Focused = React.lazy(()=>import('../focusedMode/Focused'))
const Admin = React.lazy(()=>import('../forAdmin/Admin'))

export default function App(props) {
  let setNavButtons = useRef(()=>null)

  return <>
    <LightNav {...{setNavButtons}} />
    <AuthSwitch>
      <ModeSwitch {...{setNavButtons}} />
    </AuthSwitch>
  </>
}

function ModeSwitch(props) {
  const mode = useSelector(state => state.mode)
  const profile = useSelector(state => state.firebase.profile)
  const dispatch = useDispatch()

  // what to render for each mode, and the name for it's tab / button
  const componentsByMode = {
    [modes.playful]: {name: 'Adventure mode', content: <Playful setNavButtons={props.setNavButtons} />},
    [modes.focused]: {name: 'Navigator mode', content: <Focused />},
    // [modes.teacher]: {name: 'Teacher mode', content: <h1>Teacher mode coming soon!</h1>},
  }
  if (profile.isLoaded && profile.token.claims.admin)
    componentsByMode[modes.admin] = {name: 'Admin', content: <Admin />}

  // add buttons to navigate between modes while mode switch is in scope
  let userButtons = Object.entries(componentsByMode)
    .filter(([k,v])=>k!=mode)
    .map(([k,v])=>{return {content: v.name, key: v.name, onClick: () => dispatch(setMode(k))}})
  
  useEffect(() => {
    let setNavButtons = props.setNavButtons.current
    setNavButtons({owner:'ModeSwitch', userButtons})
    return () => {
      setNavButtons({owner:'ModeSwitch', userButtons:[]})
    }
  }, [userButtons])

  return <div className={"body colorful-theme"}>
    <Suspense fallback={<LoadingPage />}>
      {componentsByMode[mode] && componentsByMode[mode].content}
    </Suspense>
  </div>
}

function AuthSwitch(props) {
  // const rehydrated = useSelector(state => state._persist.rehydrated)
  const auth = useSelector(state => state.firebase.auth)
  const profile = useSelector(state => state.firebase.profile)

  // login / loading / error cases
  // if(!rehydrated) return <LoadingPage /> // loading last state
  if(!auth.isLoaded) return <LoadingPage /> // loading auth
  if(auth.isEmpty) return <Login /> // not logged in
  if(!profile.isLoaded) return <LoadingPage /> // loading profile (and claims)
  if(profile.isEmpty) {
    console.error('empty profile / no claims') // logged in but no profile (should not happen)
    return <ErrorMsg />
  }

  const claims = profile.token.claims
  if(claims.admin || claims.permanentAccess || claims.expirationDate - Date.now() > 0) {
    return props.children // logged in successfully
  }

  // should subscribe
  return <Subscribe />
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
