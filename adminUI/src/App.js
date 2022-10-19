import React, { useState } from 'react';
import { useAuth } from 'bythebook-shared/dist/firebase';
import { AuthSwitch, UserWidget } from 'bythebook-shared/dist/components';
import { Row, Col } from 'react-bootstrap'
import ManageUsers from './manageUsers'
import ManageVideos from './manageResources'
import topImg  from './R+C.svg'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from "react-router-dom";
import './App.scss';

// const Admin = React.lazy(()=>import('../forAdmin/Admin'))

function App() {
  return <AuthSwitch><Router>
    <header className='nav'>
      <UserWidget />
      <Link to="/">
        <i className="fas fa-reply fa-flip-vertical" 
        style={{fontSize:'1.5rem', color:'var(--primary)'}}
        />
      </Link>
    </header>

    <Admin/>

  </Router></AuthSwitch>
}

export default App;

function Admin(props) {
  const user = useAuth()

  // non-admin fallback
  if(!user) return "Loading" 
  if(!user.profile) return "Loading"
  if(!user.claims?.admin) {
    console.log("not admin", user)
    // setTimeout( () => window.location.replace("https://schmudgin.bythebookthebible.com"), 3000)
    return <div className='text-center p-5'>
      <h3>
        You need to be an admin to access this page.<br />
        You are logged in as {user.email}<br />
        Redirecting to <a href='bythebookthebible.com'>bythebookthebible.com</a> in 3 sec.
      </h3>
    </div> 
  }


  return <Routes>
    <Route exact path="/" element={<ManageMenu />} />
    <Route exact path="/users" element={<ManageUsers />} />
    <Route exact path="/videos" element={<ManageVideos />} />
    <Route element={<h2>Sorry, page not found</h2>} />
  </Routes>
}

function ManageMenu(props) {
  return (
    <div className='ManageMenu container-xl'>
      <Col>
        {/* <Row><img src={topImg} style={{width:'100%', maxWidth:'250px'}} /></Row> */}
        <Row><Link to="/videos" className='btn-round btn btn-primary m-3' style={{maxWidth:'150px'}} >Manage Videos</Link></Row>
        <Row><Link to="/users" className='btn-round btn btn-primary m-3' style={{maxWidth:'150px'}} >Manage Users</Link></Row>
      </Col>
    </div>
  )
}
