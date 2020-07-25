import React, { Component, useState, useEffect, useRef } from "react";
import "../styles/index.scss";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { firebase, db } from "../firebase.js";

import logo from "../images/logo.svg";
import finishSignup from "../images/FinishSignup.svg";

import Curriculum from "../pages/Curriculum";
import Home from "../pages/Home";
import Camp from "../pages/Camp";
import OurStory from "../pages/OurStory";
import Testimonials from "../pages/Testimonials";
import { Login } from "../forms/Login";
import { AccountSettings, UserNavButton } from "../pages/User";
import { Manage } from "../forAdmin/Manage";
import Subscribe from "../forms/Subscribe";
import KidModeApp from "../forKids/kidModeApp";
import AdultModeApp from "../pages/Memorize";
// import AdultModeApp from "../forAdults/adultModeApp";
import { withAuth } from '../hooks';

var memorizeLink =
  "https://memorize.bythebookthebible.com/courses/take/matthew-5-6-7-sermon-on-the-mount";
var signInLink = "https://memorize.bythebookthebible.com/users/sign_in";
var buyLink = "https://memorize.bythebookthebible.com";
var internLink =
  "https://memorize.bythebookthebible.com/courses/summer-2020-internship";

var email = "rose@bythebookthebible.com";
var address = "15600 NE 8th Street Ste B1 #428, Bellevue, Wa 98008";
var facebook = "bythebookthebible";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { user: firebase.auth().currentUser };

    firebase.auth().onAuthStateChanged(
      function (user) {
        this.setState({ user: user });
        // user.getIdTokenResult(true).then((token) => {
        //     console.log(token)
        // })
      }.bind(this)
    );
  }

  render() {
    return (
      <Router>
        <div className="App">
          {/* <div className="construction">This site is currently under construction.</div> */}

          <Switch>
            <Page path="/ourStory" ><OurStory /></Page>
            <Page path="/testimonials" ><Testimonials /></Page>
            <Page path="/features" ><Curriculum /></Page>
            <Page path="/camp" ><Camp /></Page>
            <Page path="/manage" ><Manage /></Page>
            <Page path="/subscribe" ><Subscribe /></Page>
            <Page path="/account" ><AccountSettings /></Page>
            <Page path="/termsOfService" ><Login.TermsOfService /></Page>
            <Page path="/privacy" ><Login.PrivacyPolicy /></Page>
            <MemorizeApp path="/memorize"></MemorizeApp>
            {/* <Page path="/memorize" theme="colorful-theme" nav={<LightNav />} footer={null} ><Memorize /></Page>
            <Page path="/kidMemorize"><KidModeApp /></Page>
            <Page path="/adultMemorize"><AdultModeApp /></Page> */}
            <Page exact path="/" ><Home /></Page>
            <Page path="" ><NotFound /></Page>
          </Switch>
        </div>
      </Router>
    );
  }
}

function NotFound(props) {
  return <div className='text-center p-5'>
    <h1>Page Not Found.</h1>
    <img src='https://www.biblestudytools.com/Content/Images/file-not-found.jpg' className='mw-100' />
    <p>We're sorry, but the page you are looking for has been moved or is currently unavailable.</p>
    <p>Go to <a href='/'>home page</a></p>
  </div>
}

var Page = props=> {
  let {nav, footer, theme, path, children, ...passThru} = props
  nav = nav === undefined ? <FullNav /> : nav
  footer = footer === undefined ? <Footer /> : footer
  theme = theme === undefined ? "plain-theme" : theme

  return <Route path={path} {...passThru}>
    {nav && React.cloneElement(nav, passThru)}
    <div className={"body " + theme}>
      {children && React.cloneElement(children, passThru)}
    </div>
    {footer && React.cloneElement(footer, passThru)}
  </Route>
}

const AppModes = {
  kids:'Kid Mode',
  adults:'Adult Mode',
  // teachers:'Teacher Mode',
}
const DefaultMode = AppModes.kids

var MemorizeApp = withAuth(MemorizeAppBody)

function MemorizeAppBody(props) {
  let [mode, setMode] = useState('')
  let user = props.user
  console.log('mode', mode, user)

  // load mode from last time
  useEffect(()=>{
    if(user && user.uid) {
      async function getResources() {
        let snapshot = await db.doc(`userData/${user.uid}/`).get()
        let data = {mode: DefaultMode, ...snapshot.data()}
        console.log('new mode', data.mode)

        setMode(data.mode)
      }
      getResources()
    }
  }, [user && user.uid])

  // set mode when changed
  useEffect(()=>{
    if(user && user.uid)
      db.doc(`userData/${user.uid}/`).set({mode: mode}, {merge: true})
  }, [mode])
  
  // choose app by mode
  let app = <h1></h1>
  switch(mode) {
    case AppModes.kids: app = <KidModeApp {...props} />; break
    case AppModes.kids: app = <AdultModeApp {...props} />; break
  }
  
  // insert buttons to change mode
  let modeButtons = user && Object.values(AppModes).filter(m=>m!=mode).map(m=>{return {content: m, onClick: () => setMode(m)}})
  return <Page path={props.path} theme="colorful-theme" nav={<LightNav buttons={modeButtons} {...props}/>} footer={null} >
    <Login.AuthSwitch {...props}
      tests={[
        {
          test:user=>!(user.claims.expirationDate - Date.now() > 0 || user.claims.permanentAccess || user.claims.admin),
          // value:<Subscribe />,
          value:<div style={{textAlign:'center'}} >
            <img src={finishSignup} style={{maxWidth:'600px', backgroundColor:'white'}} />
            <div style={{marginTop:'-80px'}}><Login.LogInOutButton {...props} /></div>
          </div>,
        },
      ]}
      default={app}
    />
  </Page>
}

function Footer(props) {
  return (
    <div className="Footer">
      <div>
        Facebook:{" "}
        <a href={"https://www.facebook.com/" + facebook}>{facebook}</a>
      </div>
      <div>
        Email: <a href={"mailto:" + email}>{email}</a>
      </div>
      <div>Address: {address}</div>
    </div>
  );
}

function FullNav(props) {
  return <Navbar collapseOnSelect expand="md">
    <Navbar.Brand href="/"><img src={logo} height="30rem"/><div>By the Book</div></Navbar.Brand>
    <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
    <Navbar.Collapse  id="responsive-navbar-nav">
      <Nav className="mr-auto">
        <Nav.Link href="/memorize">Memorize (Beta)</Nav.Link>
        <Nav.Link href="/camp">Camp</Nav.Link>
        <Nav.Link href="/features">Features</Nav.Link>
        <Nav.Link href="/testimonials">Testimonials</Nav.Link>
        <Nav.Link href="/ourStory">Our&nbsp;Story</Nav.Link>
        <Nav.Link href={internLink}>Internship</Nav.Link>
      </Nav>
      <Nav>
        <Nav.Link href={signInLink} className="btn btn-round btn-primary mx-auto">Thinkific Login</Nav.Link>
        {/* <UserNavButton className="btn btn-round btn-primary mx-auto" {...props}/> */}
      </Nav>
    </Navbar.Collapse>
  </Navbar>
}

function LightNav(props) {
  // return <div className='lightNav'>
  //   <a href='/'><img src={logo} height="20rem"/></a>
  //   <UserNavButton {...props}/>
  // </div>

  return <Navbar collapseOnSelect expand="sm" className='lightNav'>
    <Navbar.Brand href="/"><img src={logo} height="20rem" /></Navbar.Brand>
    <Nav>
      <UserNavButton {...props}/>
    </Nav>
  </Navbar>
}
