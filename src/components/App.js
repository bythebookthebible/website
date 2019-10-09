import React, { Component } from 'react';
import '../css/Text.css';
import '../css/Layout.css';
import Nav from './NavBar'
import Curriculum from '../components/Curriculum'
import Home from '../components/Home'
import OurStory from '../components/OurStory'
import Testimonials from '../components/Testimonials'

export default class App extends Component {
  render() {
    return (
        <div className="App">
            <Nav />
            <div className="construction">This site is currently under construction.</div>

            <div className="Body">
                <div className="anchor" id="OurStory">&nbsp;</div>
                <div className="page"><OurStory /></div>

                <div className="anchor" id="Testimonials">&nbsp;</div>
                <div className="page"><Testimonials /></div>

                <div className="anchor" id="Contact">&nbsp;</div>
                <div className="page">
                    <p className="text-box">
                        Thank you for your interest! If you have any questions or feedback, please contact me at: <a href="mailto:rose@bythebookthebible.com">rose@bythebookthebible.com</a>
                    </p>
                </div>

                <div className="anchor" id="Curriculum">&nbsp;</div>
                <div className="page"><Curriculum /></div>
                
                <div className="anchor" id="Home">&nbsp;</div>
                <div className="page"><Home /></div>
            </div>
        </div>
    );
  }
}