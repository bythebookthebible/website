import React, { Component } from 'react';
import {Row, Col} from 'react-bootstrap'
import $ from "jquery";

import firebase from '../firebase.js';
// var firebase = require('firebase');

var db = firebase.firestore();

var email = 'rose@bythebookthebible.com'

var addStudent = firebase.functions().httpsCallable('addStudent');


export default class AddStudent extends Component {
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
                        <h1>Have a child interested in camp?</h1>
                        <p>Thank you for your interest! This brings the camp in your area one step closer to happening! If we get a venue and 20 kids interested in coming, then we will be delighted to put on a camp in your area!</p>
                        <form onSubmit={function(event) {
                                event.preventDefault();
                                var data = {
                                    fname: $('#fname').val(), 
                                    lname: $('#lname').val(), 
                                    email: $('#email').val(), 
                                    phone: $('#phone').val(), 
                                    location: $('#location').val(), 
                                    numStudents: $('#numStudents').val(), 
                                    notes: $('#notes').val()};
                                console.log(data);
                                addStudent(data).finally(function() {window.location = '/camp';});
                                // window.location = '/camp';
                            }}>
                            <Col>
                                <input id='fname' type='text' placeholder='First Name'/>
                                <input id='lname' type='text' placeholder='Last Name'/><br/>
                                <input id='email' type='email' placeholder='Email'/>
                                <input id='phone' type='tel' placeholder='Phone'/><br/>
                                <select id='location'>
                                    {
                                        this.state.camps ? 
                                            this.state.camps.map(function(c) {return <option value={c} key={c==this.defaultCamp ? '_' : c}>{c}</option>}.bind(this)) :
                                            <option value={this.defaultCamp} key='_'>{this.defaultCamp}</option>
                                    }
                                </select>
                                <input id='numStudents' type='number' placeholder='How many children?'/><br/>
                                <textarea id='notes' rows={5} cols={45} placeholder='Please share the name, age, gender and any alergies or medical concerns we should be aware of for the child(ren) potentially participating.'/><br/>
                                <input type="submit" />
                            </Col>
                            <p>Please do not hesitate to contact us - reach out if you have any questions, ideas, or comments...We are here to serve you and spread God's word where ever He leads us.</p>
                            <p>Email me at: <a href={'mailto:' + email}>{email}</a></p>
                            <p>We will email letting you know for sure if the camp is on or not.</p>
                        </form>
                    </Col>
                    <Col xs="12" md="6">
                        <h1>General Camp Details:</h1>
                        <p>Camp details may change depending on what is best for your community, but here is the template we plan from:</p>​
                        <p><strong>Goal:</strong> Have kids memorize 1 Corinthians chapter 13 in 5 days and learn what it means!</p>
                        <p><strong>Grade range:</strong> This year our target age range is Kindergarten through third grade.</p>
                        <p><strong>Location:</strong> Not confirmed yet - likely a house or church in your area.</p>
                        <p><strong>Activities:</strong> We will have singing, music, dancing, crafts, coloring pages, stories, theater, games, and outdoor activities that all reinforce concepts or memory work on 1 Corinthians chapter 13. We will also provide a fun music video that helps kids easily memorize the chapter.</p>
                        <p><strong>Cost:</strong> undecided - if it turns out to be necessary for us to charge a camp fee, there will be full scholarships and financial aid readily available.</p>
                        <p><strong>People:</strong> If it be God’s will that this camp gets 20+ kids and a venue, we will send out a team to run it! Depending on the number of campers, we may ask for volunteers from the community - these can be older siblings or friends.</p>
                        <p><strong>Moving forward:</strong> You can always check back and see status updates on how this camp is doing. As the camp becomes more probable, we will keep you posted on more details. We will let you know ASAP once this camp is confirmed. But for now let’s get the idea rolling and see what God will do!</p>
​                    </Col>
                </Row>
            </div>
        )
    }
}
