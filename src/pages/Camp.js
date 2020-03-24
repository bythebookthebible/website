import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import {Row, Col} from 'react-bootstrap'
import {
  Switch,
  Route,
  useRouteMatch,
  useParams
} from "react-router-dom";

import AddStudent from '../forms/AddStudent.js'
import AddVenue from '../forms/AddVenue.js'
import AddCamp from '../forms/AddCamp.js'

import venueNeeded  from '../images/camp/venueNeeded.png';
import venueIdea  from '../images/camp/venueIdea.png';
import venuePending  from '../images/camp/venuePending.png';
import venueConfirmed  from '../images/camp/venueConfirmed.png';

import campVideo from '../videos/campPromo.mp4'

var firebase = require('firebase');
var db = firebase.firestore();

var venueProgress = {
    needed: venueNeeded, 
    idea: venueIdea, 
    pending: venuePending, 
    confirmed: venueConfirmed
}

// var campVideo = '../videos/campPromo.mp4'
var email = 'rose@bythebookthebible.com'

export default class Camp extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route path={'/camp/addStudent'}><AddStudent /></Route>
                    <Route path={'/camp/addVenue'}><AddVenue /></Route>
                    <Route path={'/camp/addCamp'}><AddCamp /></Route>
                    <Route path={'/camp'}><CampListPage /></Route>
                </Switch>
            </div>
        )
    }
}

class CampListPage extends Component {
    constructor(props) {
        super(props);
        this.state = {campData: [null]};

        db.collection("summercamps").get().then((querySnapshot) => {
            var campData = querySnapshot.docs.map(function(doc) {
                var d = doc.data();
                d.key = d.location;
                return d;
            });
            this.setState({campData: campData});
        });
    }

    render() {
        return (
            <div className="Camp">
                <Row className='yellowbg'>
                    <Col>
                        <h1>Let’s not let this virus steal our Summer dreams!</h1>
                        <p>Since we are all cooped up for a while, lets start dreaming of summer - then if things clear up and we have enough people interested, we can still be ready for a Memory Camp!</p>
                        <p>Right now we’re just collecting a list of people who would potentially be interested in camp if the virus clears in time. If that describes you, let us know by cicking below!</p>
                        <p>More info? email me at: <a href={"mailto:" + email}>{email}</a></p>
                    </Col>
                    <Col>
                        <ReactPlayer url={campVideo} className="video" controls />
                        <p>What By the Book would need from your community:</p>
                        <ul>
                            <li>20 children</li>
                            <li>A venue</li>
                            <li>A love for God's Word!</li>
                        </ul>
                        <a className='button' href={'camp/addCamp'}>request camp near you</a>
                    </Col>
                </Row>
                <h1>Here's the proposed camps<br/>and their progress so far...</h1>
                {/* <CampBox location='Monroe, WA' date='8/27/20' students={0} venue='pending' /> */}
                <div>
                    {this.state.campData.map(CampBox)}
                </div>
                <h1>Don't see a camp in your area?</h1>
                <a className='button' href={'camp/addCamp'}>request camp near you</a>
            </div>
        )
    }
}

const CampBox = (props) => {
    try {
        console.log(props);
        return (
            <div className='camp-box'>
                <h1>{props.location} Camp</h1>
                <p>Proposed week: {props.startDate.toDate().toDateString()}</p>
                <Row>
                    <Col sm={6} xs={12}>
                        <h2>Camper Status:</h2>
                        <div className='giant'>{props.numStudents}/20</div>
                        <a className='button' href={'camp/addStudent?location=' + props.location}>I have a camper!</a>
                    </Col>
                    <Col sm={6} xs={12}>
                        <h2>Venue Status:</h2>
                        <img src={venueProgress[props.venueStatus]} style={{width:'100%'}}></img>
                        <a className='button' href={'camp/addVenue?location=' + props.location}>I have a venue idea!</a>
                    </Col>
                </Row>
            </div>
        );
    } catch(err) {
        console.log(err);
        console.log(props);
        return '[loading camps...]';
    }
}