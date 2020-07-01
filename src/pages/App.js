import React, { Component } from 'react';
import '../styles/index.scss';
import {Navbar, Nav, NavDropdown} from 'react-bootstrap'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import firebase from '../firebase.js';

import logo from '../images/logo.svg';

import Curriculum from '../pages/Curriculum'
import Home from '../pages/Home'
import Camp from '../pages/Camp'
import OurStory from '../pages/OurStory'
import Testimonials from '../pages/Testimonials'
import Memorize from '../pages/Memorize'
import {Login} from '../forms/Login'
import {AccountSettings, UserNavButton} from '../pages/User'
import {Manage} from '../pages/Manage'
import Subscribe from '../forms/Subscribe'
import { withAuth } from '../hooks';

var memorizeLink = 'https://memorize.bythebookthebible.com/courses/take/matthew-5-6-7-sermon-on-the-mount'
var signInLink = 'https://memorize.bythebookthebible.com/users/sign_in'
var buyLink = 'https://memorize.bythebookthebible.com'
var internLink = 'https://memorize.bythebookthebible.com/courses/summer-2020-internship'

var email = 'rose@bythebookthebible.com'
var address = '15600 NE 8th Street Ste B1 #428, Bellevue, Wa 98008'
var facebook = 'bythebookthebible'

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {user: firebase.auth().currentUser};

        firebase.auth().onAuthStateChanged(function(user) {
            this.setState({user: user});
            // user.getIdTokenResult(true).then((token) => {
            //     console.log(token)
            // })
        }.bind(this));
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
                        <Page path="/memorize" theme="colorful-theme" nav={<LightNav />} footer={null} ><Memorize /></Page>
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
        <h1>Error 404, Page Not found.</h1>
        <p>Go to <a href='/'>home page</a></p>
    </div>
}

var Page = withAuth(
    props=> {
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
)

function Footer(props) {
    return <div className="Footer">
        <div>Facebook: <a href={"https://www.facebook.com/" + facebook}>{facebook}</a></div>
        <div>Email: <a href={"mailto:" + email}>{email}</a></div>
        <div>Address: {address}</div>
    </div>
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
    return <Navbar collapseOnSelect expand="md" >
        <Navbar.Brand href="/"><img src={logo} height="20rem" /></Navbar.Brand>
        <Nav className="ml-auto">
            {/* <a href={memorizeLink} className='button'>Thinkific Login</a> */}
            <UserNavButton {...props}/>
        </Nav>
    </Navbar>
}