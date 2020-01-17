import React, { Component } from 'react';
import '../css/NavBar.css';
import logo from '../images/logo.svg';
// import main_logo from '../images/mainLogo.svg';
// import nav_girls from '../images/R+C.svg';

// import home from '../images/nav/home.svg';
// import ourStory from '../images/nav/ourStory.svg';
// import testimonials from '../images/nav/testimonials.svg';
// import contact from '../images/nav/contact.svg';
// import curriculum from '../images/nav/curriculum.svg';
// import internship from '../images/nav/internship.svg';
// import buy from '../images/nav/buy.svg';

var memorizeLink = 'https://memorize.bythebookthebible.com/courses/take/matthew-5-6-7-sermon-on-the-mount'
var signInLink = 'https://memorize.bythebookthebible.com/users/sign_in'
var buyLink = 'https://memorize.bythebookthebible.com'
var internLink = 'https://memorize.bythebookthebible.com/courses/summer-2020-internship'

export default class NavBar extends Component {
    render() {
        return (
        <div>
            {/* <div className="ExtraNav">
                <a href={memorizeLink} className="button bounce-once">Login</a>
            </div>
            <div className="NavBar" onClick={this.props.handlePageChange}>
                <div className="navItem nav-left-logo" ><a href="#"><div style={{backgroundImage: "url(" + main_logo + ")"}}></div></a></div>
                <div className="navItem"><a href="#"><div className="bounce" style={{backgroundImage: "url(" + home + ")"}}></div></a></div>
                <div className="navItem"><a href="#OurStory"><div className="bounce" style={{backgroundImage: "url(" + ourStory + ")"}}></div></a></div>
                <div className="navItem"><a href="#Testimonials"><div className="bounce" style={{backgroundImage: "url(" + testimonials + ")"}}></div></a></div>
                <div className="navItem"><a href="#Contact"><div className="bounce" style={{backgroundImage: "url(" + contact + ")"}}></div></a></div>
                <div className="navItem"><a href="#Curriculum"><div className="bounce" style={{backgroundImage: "url(" + curriculum + ")"}}></div></a></div>
                <div className="navItem"><a href={buyLink}><div className="bounce" style={{backgroundImage: "url(" + buy + ")"}}></div></a></div>
                <div className="navItem"><a href={internLink}><div className="bounce" style={{backgroundImage: "url(" + internship + ")"}}></div></a></div>
                <div className="navItem nav-right-logo"><div style={{backgroundImage: "url(" + nav_girls + ")"}}></div></div>
            </div> */}

            <div className="NavBar" onClick={this.props.handlePageChange}>
                <a className="navItem" href="#"><img src={logo} /><div>By&nbsp;the&nbsp;Book</div></a>
                <a className="navItem" href="#Features">Features</a>
                <a className="navItem" href="#Testimonials">Testimonials</a>
                <a className="navItem" href="#OurStory">Our&nbsp;Story</a>
                <a className="navItem" href={internLink}>Internship</a>
                <a className="navItem" href={buyLink}>Sign&nbsp;Up</a>
                <a className="button navRight" href={memorizeLink}>Login</a>
            </div>
        </div>
        )
    }
}
