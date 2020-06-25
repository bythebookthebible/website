import React, { Component } from 'react';
import {Row, Col} from 'react-bootstrap'
import $ from "jquery";

// import firebase from '../firebase.js';
var firebase = require('firebase');

var db = firebase.firestore();

var email = 'rose@bythebookthebible.com'

var addVenue = firebase.functions().httpsCallable('addVenue');


export default class AddVenue extends Component {
    constructor(props) {
        super(props);
        this.state = {user: firebase.auth().currentUser, camps: null};
        this.defaultCamp = (new URLSearchParams(window.location.search)).get('location')

        // firebase.auth().onAuthStateChanged(function(user) {
        //     this.setState({user: user});
        //     if (!user) {
        //         window.location = '/login?to=/camp/addStudent';
        //     }
        // }.bind(this));

        db.collection("summercamps").get().then((querySnapshot) => {
            var camps = querySnapshot.docs.map(function(doc) {
                return doc.data().location;
            });
            this.setState({camps: camps});
        });
    }

    render() {
        return (
            <div className="form">
                <Row>
                    <Col xs="12" md="6">
                        <h1>I have a venue idea!</h1>
                        <p>Thank you for your support! This brings the camp in your area one step closer to happening!</p>
                        <p>The venue doesn't have to be fancy - it can be a house or a church. When you submit this form nothing is official and no one has committed to anything. This will simply turn the location into idea status.</p>
                        <p>We will then keep in contact and provide you with multiple resources and a well-developed proposal packet that you can present to the host to get the ball rolling and see what God does.</p>
                        <p>Please do not hesitate to contact us - reach out if you have any questions, ideas, or comments...We are here to serve you and spread God's word where ever He leads us.</p>
                        <p>Email me at: <a href={'mailto:' + email}>{email}</a></p>

                        <form onSubmit={function(event) {
                                event.preventDefault();
                                var data = {
                                    fname: $('#fname').val(), 
                                    lname: $('#lname').val(), 
                                    email: $('#email').val(), 
                                    phone: $('#phone').val(), 
                                    location: $('#location').val(), 
                                    venueType: $('#venueType').val(), 
                                    scheduling: $('#scheduling').val(), 
                                    notes: $('#notes').val()};
                                addVenue(data).finally(function() {window.location = '/camp/thankyou';});
                                // window.location = '/camp/thankyou';
                            }}>
                            <Col>
                                <input id='fname' type='text' placeholder='First Name'/>
                                <input id='lname' type='text' placeholder='Last Name'/><br/>
                                <input id='email' type='email' placeholder='Email'/>
                                <input id='phone' type='tel' placeholder='Phone'/><br/>
                                <select id='location'>
                                    {
                                        this.state.camps ? 
                                            this.state.camps.map(function(c) {return <option value={c} key={c===this.defaultCamp ? '_' : c}>{c}</option>}.bind(this)) :
                                            <option value={this.defaultCamp} key='_'>{this.defaultCamp}</option>
                                    }
                                </select>
                                <input id='venueType' type='text' placeholder='What kind of venue (house, church)'/><br/>
                                <textarea id='scheduling' rows={3} cols={45} placeholder='Do you know of any scheduling restrictions or have any preferred weeks?'/><br/>
                                <textarea id='notes' rows={5} cols={45} placeholder="Anything else you'd like to say?"/><br/>
                                <input type="submit" />
                            </Col>
                            <p>Again feel free to contact us - do not hesitate to let us know if any questions, or ideas - We are dedicated to serve you and and your community by spreading God's word where He leads.</p>
                            <p>Email me at: <a href={'mailto:' + email}>{email}</a></p>
                        </form>
                    </Col>
                    <Col xs="12" md="6">
                        <h1>Ideal Venue Qualifications:</h1>
                        <p><strong>1 medium sized room</strong>that can fit around 30 people for us to have a big group time in (it’s okay if its snug)</p>
                        <p><strong>5 indoor rooms</strong>to play games, do crafts, and enjoy a theater show. These ideally will fit 15 or so people and can be a classroom or even a larger spare bedroom.</p>
                        <p><strong>Outdoor space</strong>for kids to play in. This can really be any place where kids can play, we will have some structured activities, treasure hunts, and other such outdoors activities.</p>
                        <p>Ideally we would have access to a <strong>kitchen</strong> where we could prepare daily snacks for campers.</p>
                        <p>We will deck out the whole place with 1 Corinthians 13 themed materials and will have appropriate boundaries, fences, guidelines. We want serve you and respect your space.</p>

                        <h1>General Camp Details:</h1>
                        <p>Camp details can easily change depending on what is best for your community, but here is the template we generally plan from:</p>
                        <p><strong>Goal:</strong>Create a fun environment where kids memorize 1 Corinthians chapter 13 in 5 days and learn what it means!</p>
                        <p><strong>Grade range:</strong>This year we are hoping to have a grade range of K-3.</p>
                        <p><strong>Activities:</strong>We will provide all decorations, and camp activities. These include singing, music, harp, dancing, crafts, coloring pages, stories, theater, games, and outdoor activities to name a few. We also will provide a fun music video that helps kids easily memorize the chapter.</p>
                        <p><strong>Cost:</strong>This will vary depending on the camp - if it is necessary for us to charge a camp fee, there will be full scholarships and financial aid readily available.</p>
                        <p><strong>People:</strong>If this camp gets 20+ kids and a venue, we will send out a team to run it. Depending on the number of campers, we ask for volunteers from your community - these can be older siblings or friends.</p>
                        <p><strong>Moving forward:</strong>As the camp becomes more probable, we will start to sort out more details, such as logistics, liability, transportation etc. But for now let’s get the idea rolling and see what God will do!​​</p>
                      </Col>
                </Row>
            </div>
        )
    }
}
