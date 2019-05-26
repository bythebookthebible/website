import React, { Component } from 'react';
import '../css/NavBar.css';
import main_logo from '../images/mainLogo.svg';
import nav_girls from '../images/R+C.svg';

import home from '../images/nav/home.svg';
import ourStory from '../images/nav/ourStory.svg';
import testimonials from '../images/nav/testimonials.svg';
import contact from '../images/nav/contact.svg';
import curriculum from '../images/nav/curriculum.svg';

export default class NavBar extends Component {
    render() {
        return (
		<div className="NavBar" >
			<div className="navItem nav-left-logo"><div style={{backgroundImage: "url(" + main_logo + ")"}}></div></div>
			<div className="navItem"><a href="#Home"><div className="bounce" style={{backgroundImage: "url(" + home + ")"}}></div></a></div>
			<div className="navItem"><a href="#OurStory"><div className="bounce" style={{backgroundImage: "url(" + ourStory + ")"}}></div></a></div>
	
			<div className="navItem"><a href="#Testimonials"><div className="bounce" style={{backgroundImage: "url(" + testimonials + ")"}}></div></a></div>
			{/* <div className="navItem"><a href="#Testimonials"><svg className="bounce"><use xlinkHref={testimonials + "#Layer_1"}/></svg></a></div> */}

			<div className="navItem"><a href="#Contact"><div className="bounce" style={{backgroundImage: "url(" + contact + ")"}}></div></a></div>
			<div className="navItem"><a href="#Curriculum"><div className="bounce" style={{backgroundImage: "url(" + curriculum + ")"}}></div></a></div>
			<div className="navItem nav-right-logo"><div style={{backgroundImage: "url(" + nav_girls + ")"}}></div></div>
		</div>
        )
    }
}
