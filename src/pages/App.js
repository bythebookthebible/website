import React, { Component } from 'react';
import '../css/Text.css';
import '../css/Layout.css';
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
import Login from '../forms/Login'
import Manage from '../pages/Manage'

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
        }.bind(this));
    }

    render() {
        return (
            <Router>
                <div className="App">
                    <Navbar collapseOnSelect expand="md">
                        <Navbar.Brand href="/"><img src={logo} height="35rem"/><div>By the Book</div></Navbar.Brand>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="mr-auto" >
                                <Nav.Link href="/features">Features</Nav.Link>
                                <Nav.Link href="/testimonials">Testimonials</Nav.Link>
                                <Nav.Link href="/ourStory">Our Story</Nav.Link>
                                <Nav.Link href="/camp">Camp</Nav.Link>
                                <Nav.Link href={internLink}>Internship</Nav.Link>
                                <Nav.Link href={buyLink}>Sign Up</Nav.Link>
                            </Nav>
                            <Nav>
                                <a href={memorizeLink} className='button'>Login</a>

                                {
                                    // firebase.auth().currentUser ? 
                                    //     <div className="button" onClick={() => {
                                    //         console.log('Im trying :}')
                                    //         firebase.auth().signOut().then(function(user) {
                                    //                 console.log('Signed out');
                                    //             }).catch(function(e) {
                                    //                 console.log('Signout error: ', e);
                                    //             });
                                    //     }}>Logout</div> :
                                    //     <a className="button" href='/login'>Login</a>
                                }
                                
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>

                    {/* <div className="construction">This site is currently under construction.</div> */}

                    <div className="Body">
                        <div className="page">
                            <Switch>
                                <Route path="/ourStory"><OurStory /></Route>
                                <Route path="/testimonials"><Testimonials /></Route>
                                <Route path="/features"><Curriculum /></Route>
                                <Route path="/camp"><Camp /></Route>
                                {/* <Route path="/login"><Login /></Route>
                                <Route path="/manage"><Manage /></Route> */}
                                <Route path="/"><Home /></Route>
                            </Switch>
                        </div>
                    </div>
                    
                    <div className="Footer">
                        <div>Facebook: <a href={"https://www.facebook.com/" + facebook}>{facebook}</a></div>
                        <div>Email: <a href={"mailto:" + email}>{email}</a></div>
                        <div>Address: {address}</div>
                    </div>
                </div>
            </Router>
        );
    }

}