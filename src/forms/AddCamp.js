import React, { Component } from 'react';
import {Row, Col} from 'react-bootstrap'
import $ from "jquery";

// import firebase from '../firebase.js';
var firebase = require('firebase');

var db = firebase.firestore();

var email = 'rose@bythebookthebible.com'

var addCamp = firebase.functions().httpsCallable('addCamp');


export default class AddCamp extends Component {
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
                        <h1>Add a camp in your area!</h1>
                        <p>If you would like to have a camp in your area, please fill out the form below to let us know! If there are 20 or more kids interested, and a venue is available, then we would be delighted to come out and put on this camp for you and your community!</p>
                        <p>Please do not hesitate to contact us - reach out if you have any questions, ideas, or comments...We are here to serve you and spread God's word where ever He leads.</p>
​                        <p>Email me at: <a href={'mailto:' + email}>{email}</a></p>

                        <form onSubmit={function(event) {
                                event.preventDefault();
                                var data = {
                                    fname: $('#fname').val(), 
                                    lname: $('#lname').val(), 
                                    email: $('#email').val(), 
                                    phone: $('#phone').val(), 
                                    location: $('#location').val(), 
                                    startDate: $('#startDate').val(), 
                                    venue: $('#venue').val(), 
                                    notes: $('#notes').val()};
                                console.log(data);
                                addCamp(data).finally(function() {window.location = '/camp';});
                                // window.location = '/camp';
                            }}>
                            <Col>
                                <input id='fname' type='text' placeholder='First Name'/>
                                <input id='lname' type='text' placeholder='Last Name'/><br/>
                                <input id='email' type='email' placeholder='Email'/>
                                <input id='phone' type='tel' placeholder='Phone'/><br/>
                                <input id='location' type='text' placeholder='Where? (City, Sate)'/><br/>
                                <input id='startDate' type='date' placeholder='When? (mm/dd/yy)'/><br/>
                                <textarea id='venue' rows={5} cols={45} placeholder='Do you have a venue in mind? Please share details.'/><br/>
                                <textarea id='notes' rows={5} cols={45} placeholder="Anything else you'd like to say?"/><br/>
                                <input type="submit" />
                            </Col>
                            <p>Again feel free to contact us - do not hesitate to let us know if any questions, or ideas - We are dedicated to serve you and and your community by spread God's word where He leads.</p>
                            <p>Email me at: <a href={'mailto:' + email}>{email}</a></p>
                        </form>
                    </Col>
                    <Col xs="12" md="6">
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
