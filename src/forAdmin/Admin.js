import React from 'react'

import ManageUsers from './manageUsers'
import ManageVideos from './manageResources'
import { useSelector, useDispatch } from 'react-redux';

import { modes, setMode } from "../app/createRootReducer";
import { adminViews, setView } from './adminReducer'

import {Row, Col} from 'react-bootstrap'
import topImg  from '../images/R+C.svg'

import './admin.scss'

export default function Admin(props) {
  const view = useSelector(state => state.admin.view)
  const profile = useSelector(state => state.firebase.profile)
  const dispatch = useDispatch()

  if (profile.isLoaded && !profile.token.claims.admin) {
    dispatch(setMode(modes.playful))
  }

  const componentsByView = {
    [adminViews.adminRoot]: <ManageMenu />,
    [adminViews.manageUsers]: <AdminContainer><ManageUsers /></AdminContainer>,
    [adminViews.manageResources]: <AdminContainer><ManageVideos /></AdminContainer>,
  }

  return componentsByView[view]
}

function AdminContainer(props) {
  const dispatch = useDispatch()

  return <div className='container-xl' style={{marginTop:'5rem'}}>
    <i class="fas fa-reply fa-flip-vertical" 
      style={{position:'absolute', top:'3rem', left:'1.5rem', fontSize:'2.4rem', color:'var(--primary)', lineHeight:'.8'}}
      onClick={() => dispatch(setView(adminViews.adminRoot))} />
    {props.children}
  </div>
}

function ManageMenu(props) {
  const dispatch = useDispatch()

  return (
    <div className='ManageMenu container-xl'>
      <Col>
        <Row><img src={topImg} style={{width:'100%', maxWidth:'250px'}} /></Row>
        <Row><a className='btn-round btn btn-primary m-3' 
          onClick={()=>dispatch(setView(adminViews.manageResources))}>Manage Videos</a></Row>
        <Row><a className='btn-round btn btn-primary m-3'
          onClick={()=>dispatch(setView(adminViews.manageUsers))}>Manage Users</a></Row>
      </Col>
    </div>
  )
}

