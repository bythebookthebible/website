import React, { Component } from 'react';
import '../css/Text.css';
import '../css/Layout.css';
import {Navbar, Nav, NavDropdown} from 'react-bootstrap'
import logo from '../images/logo.svg';
import Curriculum from '../components/Curriculum'
import Home from '../components/Home'
import OurStory from '../components/OurStory'
import Testimonials from '../components/Testimonials'

var memorizeLink = 'https://memorize.bythebookthebible.com/courses/take/matthew-5-6-7-sermon-on-the-mount'
var signInLink = 'https://memorize.bythebookthebible.com/users/sign_in'
var buyLink = 'https://memorize.bythebookthebible.com'
var internLink = 'https://memorize.bythebookthebible.com/courses/summer-2020-internship'

var email = 'rose@bythebookthebible.com'
var address = '15600 NE 8th Street Ste B1 #428 Bellevue, Wa 98008'
var facebook = 'bythebookthebible'

var pages = {
    "#": <Home/>,
    "#OurStory": <OurStory />,
    "#Testimonials": <Testimonials/>,
    "#Features": <Curriculum />
};

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {page: window.location.hash in pages ? window.location.hash : "#"};
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    handlePageChange(e) {
        console.log(e.target)
        if (!e.target.hasAttribute("href")) {
            var p = e.target.parentNode.getAttribute("href"); // e.target is the inner DOM object
        } else {
            var p = e.target.getAttribute("href"); // e.target is the inner DOM object
        }

        if (!(p in pages)) {
            p = "#";
            window.location.hash = p;
        }
        this.setState({page: p})
    }

    render() {
        return (
            <div className="App">
                {/* <Nav handlePageChange={this.handlePageChange}/> */}
                <Navbar collapseOnSelect expand="md" onClick={this.handlePageChange}>
                    <Navbar.Brand href="#"><img src={logo} height="35rem"/><div>By&nbsp;the&nbsp;Book</div></Navbar.Brand>
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="mr-auto" >
                            <Nav.Link href="#Features">Features</Nav.Link>
                            <Nav.Link href="#Testimonials">Testimonials</Nav.Link>
                            <Nav.Link href="#OurStory">Our&nbsp;Story</Nav.Link>
                            <Nav.Link href={internLink}>Internship</Nav.Link>
                            <Nav.Link href={buyLink}>Sign&nbsp;Up</Nav.Link>
                        </Nav>
                        <Nav.Link className="button" href={memorizeLink}>Login</Nav.Link>
                    </Navbar.Collapse>
                </Navbar>

                {/* <div className="construction">This site is currently under construction.</div> */}

                <div className="Body">
                    <div className="page">
                        {pages[this.state.page]}
                    </div>
                </div>
                
                <div className="Footer">
                    <div>Facebook: <a href={"https://www.facebook.com/" + facebook}>{facebook}</a></div>
                    <div>Email: <a href={"mailto:" + email}>{email}</a></div>
                    <div>Address: {address}</div>
                </div>
            </div>
        );
    }
}