import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
import { getFirebase, actionTypes as rrfActionTypes } from 'react-redux-firebase'
import { auth } from '../firebase'
import { constants as rfConstants } from 'redux-firestore'
import {persistStore, persistReducer} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import rootReducer from './createRootReducer'

// const persistedReducer = persistReducer({
//   key: 'btbtb/firebase',
//   whitelist: ['firestore'],
//   throttle: 1000,
//   stateReconciler: autoMergeLevel2,
//   version: -1,
//   storage,
// }, rootReducer)

const middleware = [
  ...getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [
        // just ignore every redux-firebase and react-redux-firebase action type
        ...Object.keys(rfConstants.actionTypes).map(
          type => `${rfConstants.actionsPrefix}/${type}`
        ),
        ...Object.keys(rrfActionTypes).map(
          type => `@@reactReduxFirebase/${type}`
        )
      ],
      ignoredPaths: ['firebase', 'firestore']
    },
    thunk: {
      extraArgument: getFirebase
    }
  })
]

export const store = configureStore({
  reducer: rootReducer(),
  middleware
})

export const persistor = persistStore(store)

// hot reloading
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./createRootReducer', () => {
    const newRootReducer = require('./createRootReducer').default()
    // const newPersistedReducer = persistReducer({key: 'btbtb/firebase', storage}, newRootReducer)
    store.replaceReducer(newRootReducer)
  })
}

// replace persistor location on auth uid change
let uid = auth.currentUser && auth.currentUser.uid
auth.onAuthStateChanged(() => {
  let newUid = auth.currentUser && auth.currentUser.uid
  if(uid !== newUid) {
    uid = newUid
    const newRootReducer = require('./createRootReducer').default(uid)
    store.replaceReducer(newRootReducer)
  }
})