import React, { Component, useState, useEffect, useRef } from 'react'
import {Row, Col, ProgressBar, Spinner, Button} from 'react-bootstrap'
import $ from 'jquery'
import {
  Switch,
  Route,
  useRouteMatch,
  useParams
} from "react-router-dom"

import topImg  from '../images/R+C.svg'
import {Login} from '../forms/Login'
import { useFirestore } from '../hooks'
import ManageCamps from './manageCamps'
import ManageUsers from './manageUsers'
import ManageVideos from './manageResources'

import {firebase, db, storage} from '../firebase'
import './manage.scss'

export function Manage(props) {
    if (props.user && !props.user.claims.admin) {
        window.location = '/'
    }

    if(!props.user) {
        return <div className="Manage text-center">
            <br/>
            Please Login.
            <br/><br/>
            <Login.LoginButton />
        </div>
    } else {
        return <div className="Manage">
            {<Switch>
                <Route path={'/manage/manageUsers'}><ManageUsers {...props} /></Route>
                <Route path={'/manage/manageVideos'}><ManageVideos {...props} /></Route>
                <Route path={'/manage/manageCamps'}><ManageCamps {...props} /></Route>
                <Route path={'/manage'}><ManageMenu {...props} /></Route>
            </Switch>}
        </div>
    }

}

function ManageMenu(props) {
    return (
        <div className='ManageMenu container-xl'>
            <Col>
                <Row><img src={topImg} style={{width:'100%', maxWidth:'250px'}} /></Row>
                <Row><a className='btn-round btn btn-primary m-3' href='/manage/manageVideos'>Manage Videos</a></Row>
                <Row><a className='btn-round btn btn-primary m-3' href='/manage/manageCamps'>Manage Camps</a></Row>
                <Row><a className='btn-round btn btn-primary m-3' href='/manage/manageUsers'>Manage Users</a></Row>
            </Col>
        </div>
    )
}

