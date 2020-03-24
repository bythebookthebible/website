import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import {Row, Col} from 'react-bootstrap'
import {
  Switch,
  Route,
  useRouteMatch,
  useParams
} from "react-router-dom";

import topImg  from '../images/R+C.svg';

var firebase = require('firebase');
var db = firebase.firestore();

export default class Manage extends Component {
    constructor(props) {
        super(props);
        // REDIRECT TO MAIN PAGE IF NOT ADMIN
        this.state = {user: firebase.auth().currentUser};
        firebase.auth().onAuthStateChanged(function(user) {
            this.setState({user: user});
            if (!user) {
                window.location = '/login?to=/manage';
            }
        }.bind(this));
    }
    render() {
        return (
            <div className="Manage">
                <Switch>
                    <Route path={'/manage/manageUsers'}><h1>Manage Users</h1></Route>
                    <Route path={'/manage/manageVideos'}><h1>Manage Videos</h1></Route>
                    <Route path={'/manage/manageCamps'}><ManageCamps /></Route>
                    <Route path={'/manage'}><ManageMenu /></Route>
                </Switch>
            </div>
        )
    }
}

var ManageMenu = function(props) {
    return (
        <div className='ManageMenu'>
            <Col>
                <Row><img src={topImg} style={{width:'100%', maxWidth:'250px'}} /></Row>
                <Row><a className='button' href='/manage/manageVideos'>Manage Videos</a></Row>
                <Row><a className='button' href='/manage/manageCamps'>Manage Camps</a></Row>
                <Row><a className='button' href='/manage/manageUsers'>Manage Users</a></Row>
            </Col>
        </div>
    )
}

class ManageCamps extends Component {
    constructor(props) {
        super(props);
        this.state = {campData: []};

        db.collection("summercamps").get().then(function(querySnapshot) {
            var campData = querySnapshot.docs.map(function(doc) {
                return doc.data();
            });
            this.setState({campData: campData});
        }.bind(this));
    }

    render() {
        return (
            <div className='ManageCamps form'>
                <table>
                    <tr>
                        <th></th>
                        <th>Location</th>
                        <th>Start Date</th>
                        <th>Student Count</th>
                        <th>Venue Status</th>
                        <th>Students List</th>
                        <th>Venues List</th>
                    </tr>
                    {console.log(this.state.campData)}
                    {this.state.campData.map(CampTableRow)}
                    <tr>
                        <th></th>
                        <td><button onClick={function(event) {
                            // Add a row to the table. Will update db with button when filled in.
                            this.state.campData.push({
                                location: 'New Camp',
                                startDate: {toDate: function() {return new Date();}},
                                numStudents: 0,
                                venueStatus: 'idea',
                            });
                            this.setState({campData: this.state.campData});
                        }.bind(this)}>Add Camp</button></td>
                    </tr>
                </table>
            </div>
        )
    }
}

var CampTableRow = function(props) {
    return (
        <tr key={props.location}>
            <td><button onClick={function(event) {
                // update db for this camp
            }}>Update</button></td>
            <td><input type='text' id='location' size={16} defaultValue={props.location} /></td>
            <td><input type='date' id='startDate' size={16} defaultValue={props.startDate.toDate().toISOString().split('T')[0]} /></td>
            <td>{props.numStudents}</td>
            <td><input type='text' id='venueStatus' size={8} defaultValue={props.venueStatus} /></td>
            <td>Students List</td>
            <td>Venues List</td>
        </tr>
    )
}
