import React, {useState, useEffect} from 'react'
const firebase = require('firebase');

export function useAuth(useClaims) {
    let [user, setUser] = useState(null)
    let [claims, setClaims] = useState(null)
    if(useClaims === undefined) useClaims = false

    firebase.auth().onAuthStateChanged(async (u) => {
        if(useClaims && u != user) {
            let newClaims = u && (await u.getIdTokenResult(true)).claims
            setClaims(newClaims)
        }
        setUser(u)
    })
    // console.debug(user, claims)

    return useClaims ? [user, claims] : user
}
