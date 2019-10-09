import React, { Component } from 'react';
import '../css/Text.css';
import '../css/Layout.css';
import Nav from './NavBar'
import Curriculum from '../components/Curriculum'
import Home from '../components/Home'
import OurStory from '../components/OurStory'
import Testimonials from '../components/Testimonials'

var pages = {
    "#": <Home/>,
    "#OurStory": <OurStory />,
    "#Testimonials": <Testimonials/>,
    "#Contact": <p className="text-box">
                            Thank you for your interest! If you have any questions or feedback, please contact me at: <a href="mailto:rose@bythebookthebible.com">rose@bythebookthebible.com</a>
                        </p>,
    "#Curriculum": <Curriculum />
};

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {page: window.location.hash in pages ? window.location.hash : "#"};
        this.handlePageChange = this.handlePageChange.bind(this);
    }

    handlePageChange(e) {
        var p = e.target.parentNode.getAttribute("href"); // e.target is the inner DOM object
        this.setState({page: p})
    }

    render() {
        return (
            <div className="App">
                <Nav handlePageChange={this.handlePageChange}/>
                <div className="construction">This site is currently under construction.</div>

                <div className="Body">
                    <div className="page">
                        {pages[this.state.page]}
                    </div>
                </div>
            </div>
        );
    }
}