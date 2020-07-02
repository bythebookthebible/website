import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import {Row, Col, Spinner} from 'react-bootstrap'
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


var firebase = require('firebase');
var db = firebase.firestore();

var venueProgress = {
    needed: venueNeeded, 
    idea: venueIdea, 
    pending: venuePending, 
    confirmed: venueConfirmed
}

var venueProgressOrder = ['needed', 'idea', 'pending', 'confirmed'];

var campVideo = 'https://firebasestorage.googleapis.com/v0/b/bythebookthebible.appspot.com/o/public%2FcampPromo.mp4?alt=media'
var email = 'rose@bythebookthebible.com'

export default function Camp() {
    return <div>
        <Switch>
            <Route path={'/camp/addStudent'}><AddStudent /></Route>
            <Route path={'/camp/addVenue'}><AddVenue /></Route>
            <Route path={'/camp/addCamp'}><AddCamp /></Route>
            <Route path={'/camp/thankyou'}><Thankyou /></Route>
            <Route path={'/camp'}><CampListPage /></Route>
        </Switch>
    </div>
}

class CampListPage extends Component {
    constructor(props) {
        super(props);
        this.state = {campData: [null]};

        db.collection("summercamps").orderBy('numStudents', 'desc').get().then((querySnapshot) => {
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
            <div className="Camp container-xl">
                <Row className='yellowbg'>
                    <Col md={{order:2}}>
                        <h1>Let’s not let this virus steal our Summer dreams!</h1>
                        <p>Since we are all cooped up for a while, let's start dreaming of summer - then if things clear up and we have enough people interested, we can still be ready for a Memory Camp!</p>
                        <p>Right now we’re just collecting a list of people who would potentially be interested in camp if the virus clears in time. If that describes you, let us know by cicking below!</p>
                        <p>More info? email me at: <a href={"mailto:" + email}>{email}</a></p>
                    </Col>
                    <Col md={{order:1}}>
                        <ReactPlayer url={campVideo} width="100%" height="auto" controls />
                        <p>What By the Book would need from your community:</p>
                        <ul>
                            <li>20 children</li>
                            <li>A venue</li>
                            <li>A love for God's Word!</li>
                        </ul>
                        <a className='button btn-primary' href={'camp/addCamp'}>request camp near you</a>
                    </Col>
                </Row>
                <h1>Here's the proposed camps<br/>and their progress so far...</h1>
                {/* <CampBox location='Monroe, WA' date='8/27/20' students={0} venue='pending' /> */}
                <div>
                    {this.state.campData.map(CampBox)}
                </div>
                <h1>Don't see a camp in your area?</h1>
                <a className='button btn-primary' href={'camp/addCamp'}>request camp near you</a>
            </div>
        )
    }
}

const CampBox = (props) => {
    try {
        return (
            <div className='camp-box'>
                <h1>{props.location} Camp</h1>
                <p>Proposed week: {props.startDate.toDate().toDateString()}</p>
                <Row>
                    <Col sm={6} xs={12}>
                        <h2>Camper Status:</h2>
                        <div className='giant'>{props.numStudents}/20</div>
                        <a className='button btn-primary' href={'camp/addStudent?location=' + props.location}>I have a camper!</a>
                    </Col>
                    <Col sm={6} xs={12}>
                        <h2>Venue Status:</h2>
                        <img src={venueProgress[props.venueStatus]} style={{width:'100%'}}></img>
                        <a className='button btn-primary' href={'camp/addVenue?location=' + props.location}>I have a venue idea!</a>
                    </Col>
                </Row>
            </div>
        );
    } catch(err) {
        // console.log(err);
        // console.log(props);
        return <Row><Col className="text-center"><Spinner animation="border" role="status" size="md" /><p>Loading Camps...</p></Col></Row>
    }
}

const Thankyou = (props) => {
    setTimeout(function() {
        window.location = '/camp'
    }, 6000);
    return (
        <div style={{maxWidth:'500px', margin:'50px auto'}}>
            Thankyou for your interest.<br/>
            We will keep you updated about the status of the camp.<br/>
            The website should update within a few minutes.<br/>
            You will redirect in a second.
        </div>
    )
}