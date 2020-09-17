import React, { useState, useEffect, useRef } from 'react'
import {Button, Spinner, Modal} from 'react-bootstrap'

import { friendlyScriptureRef } from '../util'
import {firebase} from '../firebase'
import deepEqual from 'deep-equal';

var getUsers = firebase.functions().httpsCallable('getUsers');
var setUser = firebase.functions().httpsCallable('setUser');

export default function ManageUsers(props) {
    let [users, setUsers] = useState(null)
    // console.log(users)

    useEffect(() => {
        getUsers()
            .then(res => {
                console.log(res.data)
                setUsers(res.data)
            })
            .catch(e => console.error(e))
    }, [props.user])

    return <div className='container-xl form'>
        <table className='mx-auto my-3' style={{fontSize:'1rem'}}><tbody>
            <tr>
                <th></th>
                <th>Email</th>
                <th>Name</th>
                <th>Memory Power</th>
                <th>Expiration Date</th>
                <th className='rotate'><div><span>Permanent Access</span></div></th>
                <th className='rotate'><div><span>Admin</span></div></th>
                <th>uid</th>
                <th>stripe uid</th>
            </tr>
            {!users ? <Spinner animation="border"/> : users.map(user => <UserRow key={user.uid} user={user} onChange={newUser=>{
                if(newUser.delete) {
                    setUsers(users.filter(u=>u.uid != user.uid))
                } else {
                    console.log('changing', users, users.map(u=>u.uid===newUser.uid ? newUser : u))
                    setUsers(users.map(u=>u.uid===newUser.uid ? newUser : u))
                }
            }} />)}
        </tbody></table>
    </div>
}

function UserRow(props) {
    let user = props.user
    let claims = user.customClaims
    let [changed, setChanged] = useState(false)

    let defaultDateStr = new Date(claims.expirationDate).toISOString().split('T')[0]
    let datePhase = claims.expirationDate - new Date(defaultDateStr).valueOf()

    let powerRef = useRef()
    let stripeRef = useRef()
    let expirationRef = useRef()
    let adminRef = useRef()
    let permanentAccessRef = useRef()

    let getUpdated = ()=>{
        let customClaims = {
                ...user.customClaims,
                stripeId: stripeRef.current.value || user.customClaims.stripeId,
                expirationDate: datePhase + new Date(expirationRef.current.value).valueOf(),
            }
        if(adminRef.current.checked) customClaims.admin = true
        if(permanentAccessRef.current.checked) customClaims.permanentAccess = true

        let newUser = {
            ...user, 
            customClaims: customClaims
        }

        if(powerRef.current) newUser.userData = {...newUser.userData, power: powerRef.current}

        console.log(user, newUser)
        return newUser
    }

    let checkIfChanged = ()=>{
        if(changed == deepEqual(getUpdated(), user))
            setChanged(!changed)
    }

    return <tr>
        <td className='p-2' style={{fontSize:'1.5rem'}} onClick={()=>{
            if(window.confirm(`Are you sure you want to delete "${user.displayName}" <${user.email}>? This action cannot be undone.`)) {
                let deleteUser = {uid:user.uid, delete:true}
                props.onChange(deleteUser)
                setUser(deleteUser)
            }
        }}>&times;</td>

        <td style={{maxWidth:'200px'}} ><label>{user.email}</label></td>
        <td style={{maxWidth:'200px'}} ><label>{user.displayName}</label></td>
        <td><UpdateMemoryPower powerRef={powerRef} user={user} onChange={checkIfChanged} /></td>

        <td><input type='date' ref={expirationRef} onBlur={checkIfChanged} 
            defaultValue={new Date(claims.expirationDate).toISOString().split('T')[0]} /></td>

        <td><input type='checkbox' ref={permanentAccessRef} defaultChecked={claims.permanentAccess} onChange={checkIfChanged} /></td>

        <td><input type='checkbox' ref={adminRef} defaultChecked={claims.admin} onChange={checkIfChanged} /></td>

        <td style={{maxWidth:'50px'}} ><label>{user.uid}</label></td>
        <td><input type='text' size={5} ref={stripeRef} onBlur={checkIfChanged}
            placeholder={claims.stripeId ? claims.stripeId.substr(0,7)+'...' : ''} /></td>

        <td>
            {changed && <Button size='sm' onMouseUp={checkIfChanged} onMouseDown={e => {
                let newUser = getUpdated()
                console.log(newUser)
                setUser(newUser)
                props.onChange(newUser)
            }}>Update</Button>}
        </td>
    </tr>
}

function UpdateMemoryPower(props) {
    let initialPower = props.user.userData && props.user.userData.power
    let [power, setPower] = useState(initialPower)
    let [show, setShow] = useState(false)
    
    // default power value
    useEffect(()=>{
        props.powerRef.current = power
    }, [power])

    let cancel = ()=>{
        setPower(initialPower)
        setShow(false)
        props.onChange()
    }
    let change = ()=>{
        setShow(false)
        props.onChange()
    }

    return <>
    <Button size='sm' onClick={()=>setShow(true)} disabled={!power}>{power ? 'Edit Power' : 'No Power'}</Button>
    {power && <Modal onHide={change} show={show} >
        <Modal.Header>
            <Modal.Title><h2 className='m2'>Memory Power for<br />{props.user.displayName}</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <table><tbody>
                <tr>
                    <th>Scripture</th>
                    <th>Power</th>
                    <th>Status</th>
                </tr>
                {Object.keys(power).sort().map(module=><tr>
                    <td>{friendlyScriptureRef(module)}</td>
                    <td>{power[module].power.toFixed(2)}</td>
                    <td>
                        <select defaultValue={power[module].status} onChange={e=>{
                            let newPower = {...power}
                            newPower[module] = {...power[module], status:e.target.value}
                            setPower(newPower)
                        }}>
                            <option value={'learning'}>Learning</option>
                            <option value={'memorized-pending'}>Memorized</option>
                            <option value={'applied-pending'}>Applied</option>
                        </select>
                    </td>
                </tr>)}
            </tbody></table>
            <Button className='mr-2' onClick={cancel}>Cancel</Button>
            <Button onClick={change}>Ok</Button>
        </Modal.Body>
    </Modal>}
    </>
}