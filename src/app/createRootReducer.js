import { createReducer, combineReducers, createAction } from '@reduxjs/toolkit'

import { auth } from '../firebase'
import { firebaseReducer } from 'react-redux-firebase'
import { firestoreReducer } from 'redux-firestore'
import adminReducer from '../forAdmin/adminReducer'
import focusedReducer from '../focusedMode/focusedReducer'
import playfulReducer from '../playfulMode/playfulReducer'

import {persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import autoMergeLevel2 from 'redux-persist/es/stateReconciler/autoMergeLevel2'

export const modes = {
  playful: 'PLAYFUL_MODE',
  focused: 'FOCUSED_MODE',
  teacher: 'TEACHER_MODE',
  admin: 'ADMIN_MODE',
}

export const setMode = createAction('SET_MODE')
export function addPower(module, power) {
  return (dispatch, getState, getFirebase) => {
    let profile = getState().firebase.profile
    let p = (profile.power && profile.power[module]) || {power:0, status:'learning'}
    console.log(p, power)
    return getFirebase().updateProfile({power:{
      [module]:{
        status:p.status, 
        power:Number(p.power) + Number(power)
      }
    }})
  }
}

export default function createRootReducer(uid = auth.currentUser && auth.currentUser.uid) {
  const rootReducer = combineReducers({
    firebase: firebaseReducer,
    firestore: firestoreReducer,
    mode: createReducer(modes.playful, {
      [setMode]: (state, action) => action.payload
    }),
    // playfulMode:
    // teacherMode:
    admin: adminReducer,
    focused: focusedReducer,
    playful: playfulReducer,
  })

  if(!uid) return rootReducer

  return persistReducer({
    key: `btbtb/${uid}/state`,
    whitelist: ['firebase', 'firestore', 'mode'],
    throttle: 1000,
    stateReconciler: autoMergeLevel2,
    version: -1,
    storage,
  }, rootReducer)
}