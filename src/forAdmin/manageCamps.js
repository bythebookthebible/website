import React, { Component, useState, useEffect, useRef } from 'react'

import { useFirestore } from '../hooks'
import {firebase, db, storage} from '../firebase'

export default function ManageCamps(props) {
    let [campData, setCampData] = useState([])

    db.collection("summercamps").get().then(function(querySnapshot) {
        campData = querySnapshot.docs.map(function(doc) {
            return doc.data()
        })
        setCampData(campData)
    })

    return <div className='container form'>
        <div className='construction'>This page is under construction</div>
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
            {console.log(campData)}
            {campData.map(CampTableRow)}
            <tr>
                <th></th>
                <td><button onClick={function(event) {
                    // Add a row to the table. Will update db with button when filled in.
                    campData.push({
                        location: 'New Camp',
                        startDate: {toDate: function() {return new Date()}},
                        numStudents: 0,
                        venueStatus: 'idea',
                    })
                    setCampData(campData)
                }}>Add Camp</button></td>
            </tr>
        </table>
    </div>
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

