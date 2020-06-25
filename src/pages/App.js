import React, { Component } from "react";
import "../styles/index.scss";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { firebase } from "../firebase.js";

import logo from "../images/logo.svg";
import map from "../images/maps/TestMap.svg";

import Curriculum from "../pages/Curriculum";
import Home from "../pages/Home";
import Camp from "../pages/Camp";
import OurStory from "../pages/OurStory";
import Testimonials from "../pages/Testimonials";
import Memorize from "../pages/Memorize";
import { Login } from "../forms/Login";
import { AccountSettings, UserNavButton } from "../pages/User";
import { Manage } from "../pages/Manage";
import Subscribe from "../forms/Subscribe";
import KidModeApp from "../forKids/kidModeApp";
import ActivityView from "../forKids/activityView";
import Activity from "../forKids/activity";

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
            <Page path="/ourStory">
              <OurStory />
            </Page>
            <Page path="/testimonials">
              <Testimonials />
            </Page>
            <Page path="/features">
              <Curriculum />
            </Page>
            <Page path="/camp">
              <Camp />
            </Page>
            <Page path="/manage">
              <Manage />
            </Page>
            <Page path="/subscribe">
              <Subscribe />
            </Page>
            <Page path="/account">
              <AccountSettings />
            </Page>
            <Page path="/termsOfService">
              <Login.TermsOfService />
            </Page>
            <Page path="/privacy">
              <Login.PrivacyPolicy />
            </Page>
            <Page path="/home">
              <Home />
            </Page>
            <Page path="/kidMemorize">
              <KidModeApp />
            </Page>
            <Page path="/acti">
              <Activity kind="Music Video" key="39-007-00001-6" />
            </Page>
            <Page
              path="/"
              theme="colorful-theme"
              nav={<LightNav />}
              footer={null}
            >
              <Memorize />
            </Page>
          </Switch>
        </div>
      </Router>
    );
  }
}

function Page(props) {
  let defaultNav = <FullNav />;
  let defaultFooter = <Footer />;
  let defaultTheme = "plain-theme";

  return (
    <Route path={props.path}>
      {props.nav === undefined ? defaultNav : props.nav}
      <div className={"body " + (props.theme || defaultTheme)}>
        {props.children}
      </div>
      {props.footer === undefined ? defaultFooter : props.footer}
    </Route>
  );
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
  return (
    <Navbar collapseOnSelect expand="md">
      <Navbar.Brand href="/home">
        <img src={logo} height="30rem" />
        <div>By the Book</div>
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="/">Memorize</Nav.Link>
          <Nav.Link href="/camp">Camp</Nav.Link>
          <Nav.Link href="/features">Features</Nav.Link>
          <Nav.Link href="/testimonials">Testimonials</Nav.Link>
          <Nav.Link href="/ourStory">Our&nbsp;Story</Nav.Link>
          <Nav.Link href={internLink}>Internship</Nav.Link>
        </Nav>
        <Nav>
          <UserNavButton className="btn btn-round btn-primary mx-auto" />
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

function LightNav(props) {
  return (
    <Navbar collapseOnSelect expand="md">
      <Navbar.Brand href="/home">
        <img src={logo} height="20rem" />
      </Navbar.Brand>
      <Nav className="ml-auto">
        {/* <a href={memorizeLink} className='button'>Thinkific Login</a> */}
        <UserNavButton />
      </Nav>
    </Navbar>
  );
}
