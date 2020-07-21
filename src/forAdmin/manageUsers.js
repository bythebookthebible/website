import React, { Component, useState, useEffect, useRef } from 'react'
import {Button, Spinner} from 'react-bootstrap'

import { useFirestore } from '../hooks'
import {firebase, db, storage} from '../firebase'

var getUsers = firebase.functions().httpsCallable('getUsers');
var setUser = firebase.functions().httpsCallable('setUser');

export default function ManageUsers(props) {
    let [users, setUsers] = useState(null)
    // console.log(users)

    useEffect(() => {
        let cancel = false
        if(props.user) {
            getUsers()
                .then(_users => {
                    if(!cancel) setUsers(_users.data.users)
                })
                .catch(e => console.error(e))
        }
        return () => cancel = true
    }, [props.user])

    return <div className='container-xl'>
        <table className='mx-auto my-3' style={{fontSize:'1rem'}}><tbody>
            <tr>
                <th></th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Expiration Date</th>
                <th>Permanent<br/>Access</th>
                <th>Admin</th>
                <th>Delete</th>
            </tr>
            {!users ? <Spinner animation="border"/> : users.map(user => <UserRow user={user} />)}
        </tbody></table>
    </div>
}

function UserRow(props) {
    let user = props.user
    let claims = user.customClaims

    let expirationRef = useRef()
    let adminRef = useRef()
    let permanentAccessRef = useRef()

    return <tr>
        <td><Button size='sm' onClick={e => {
            let newUser = {
                uid: user.uid,
                customClaims: {
                    admin: adminRef.current.checked,
                    permanentAccess: permanentAccessRef.current.checked,
                    expirationDate: new Date(expirationRef.current.value).valueOf(),
                }
            }
            console.log(newUser)
            setUser(newUser)
        }}>Update</Button></td>
        <td><label>{user.email}</label></td>
        <td><label>{user.displayName}</label></td>
        <td><label><input type='date' ref={expirationRef} defaultValue={new Date(claims.expirationDate).toISOString().split('T')[0]} /></label></td>
        <td><label><input type='checkbox' ref={permanentAccessRef} defaultChecked={claims.permanentAccess} /></label></td>
        <td><label><input type='checkbox' ref={adminRef} defaultChecked={claims.admin} /></label></td>
        <td className='p-2' style={{fontSize:'1.5rem'}}>&times;</td>
    </tr>
}