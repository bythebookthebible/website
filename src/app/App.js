import React, { Suspense } from "react";
import "../styles/index.scss";
import { Navbar, Nav } from "react-bootstrap";
import {LoadingPage} from '../common/components'
import logo from "../images/logo.png";
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

var mainLink = "https://bythebookthebible.com";

export default (props) => <AuthSwitch>
    <ModeSwitch />
</AuthSwitch>

function ModeSwitch(props) {
  const mode = useSelector(state => state.mode)
  const profile = useSelector(state => state.firebase.profile)
  const dispatch = useDispatch()

  // what to render for each mode, and the name for it's tab / button
  const componentsByMode = {
    [modes.playful]: {name: 'Adventure mode', content: <Playful />},
    [modes.focused]: {name: 'Navigator mode', content: <Focused />},
    // [modes.teacher]: {name: 'Teacher mode', content: <h1>Teacher mode coming soon!</h1>},
  }
  if (profile.isLoaded && profile.token.claims.admin)
    componentsByMode[modes.admin] = {name: 'Admin', content: <Admin />}

  const modeButtons = Object.entries(componentsByMode).filter(([k,v])=>k!=mode)
    .map(([k,v])=>{return {content: v.name, key: v.name, onClick: () => dispatch(setMode(k))}})

  return <>
    <LightNav buttons={modeButtons} />
    <div className={"body colorful-theme"}>
      <Suspense fallback={<LoadingPage />}>
        {componentsByMode[mode] && componentsByMode[mode].content}
      </Suspense>
    </div>
  </>
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
  return <Navbar collapseOnSelect expand="sm" className='lightNav'>
    <Navbar.Brand href={mainLink}><img src={logo} height="40rem"/></Navbar.Brand>
    <Nav>
      <UserNavButton {...props}/>
    </Nav>
  </Navbar>
}
