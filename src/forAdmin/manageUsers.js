import React, { useState, useEffect, useRef } from 'react'
import {Button, Modal, Spinner} from 'react-bootstrap'
import { Spinner as SwirlSpinner } from '../common/components'

import _ from 'lodash'

import { friendlyScriptureRef } from '../util'
import {firebase} from '../firebase'
import deepEqual from 'deep-equal';
import { useMemoryResources } from '../common/hooks';

var getUsers = firebase.functions().httpsCallable('getUsers');
var setUser = firebase.functions().httpsCallable('setUser');

export default function ManageUsers(props) {
    let [users, setUsers] = useState(null)
    useEffect(() => {
        getUsers()
            .then(res => {
                // console.log(res.data)
                setUsers(res.data.sort(
                    (a,b) => a.displayName.toLowerCase() > b.displayName.toLowerCase() ? 1 : -1
                ))
            })
            .catch(e => console.error(e))
    }, [])

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
            {users && users.map(user => <UserRow key={user.uid} user={user} onChange={newUser=>{
                if(newUser.delete) {
                    setUsers(users.filter(u=>u.uid != user.uid))
                } else {
                    // console.log('changing', users, users.map(u=>u.uid===newUser.uid ? newUser : u))
                    setUsers(users.map(u=>u.uid===newUser.uid ? newUser : u))
                }
            }} />)}
        </tbody></table>
        {!users && <SwirlSpinner style={{width:'40%', marginLeft:'30%'}} />}
    </div>
}

function UserRow(props) {
    let user = _.cloneDeep(props.user)
    user.customClaims = user.customClaims || {expirationDate: null}
    let claims = user.customClaims
    let [changed, setChanged] = useState(false)
    console.log('user', user)

    let defaultDateStr = new Date(claims.expirationDate).toISOString().split('T')[0]
    let datePhase = claims.expirationDate - new Date(defaultDateStr).valueOf()

    let powerRef = useRef()
    let stripeRef = useRef()
    let expirationRef = useRef()
    let adminRef = useRef()
    let permanentAccessRef = useRef()

    let getUpdated = ()=>{
        let newUser = _.cloneDeep(props.user)
        newUser.customClaims = user.customClaims || {}
        
        newUser.customClaims.stripeId = stripeRef.current.value || user.customClaims.stripeId
        newUser.customClaims.expirationDate = datePhase + new Date(expirationRef.current.value).valueOf()

        if(adminRef.current)
            newUser.customClaims.admin = adminRef.current.checked
        if(permanentAccessRef.current)
            newUser.customClaims.permanentAccess = permanentAccessRef.current.checked
        if(powerRef.current)
            newUser.userData = newUser.userData || {}
            newUser.userData.power = powerRef.current

        // console.log(deepEqual(props.user, newUser), props.user, newUser)
        return newUser
    }

    let checkIfChanged = ()=>{
        if(changed == deepEqual(getUpdated(), props.user))
            setChanged(!changed)
    }

    return <tr>
        <td className='p-2' style={{fontSize:'1.5rem'}} onClick={()=>{
            if(window.confirm(`Are you sure you want to delete "${user.displayName}" <${user.email}>? This action cannot be undone.`)) {
                let deleteUser = {uid:user.uid, delete:true}
                setUser(deleteUser)
                props.onChange(deleteUser)
            }
        }}>&times;</td>

        <td style={{maxWidth:'200px'}} ><label>{user.email}</label></td>
        <td style={{maxWidth:'200px'}} ><label>{user.displayName}</label></td>
        <td><MemoryPowerEditor powerRef={powerRef}
            initialPower={user.userData ? user.userData.power : {}}
            onChange={checkIfChanged} displayName={user.displayName} /></td>

        <td><input type='date' ref={expirationRef} onBlur={checkIfChanged} 
            defaultValue={new Date(claims.expirationDate).toISOString().split('T')[0]} /></td>

        <td><input type='checkbox' ref={permanentAccessRef} defaultChecked={claims.permanentAccess} onChange={checkIfChanged} /></td>

        <td><input type='checkbox' ref={adminRef} defaultChecked={claims.admin} onChange={checkIfChanged} /></td>

        <td style={{maxWidth:'50px'}} ><label>{user.uid}</label></td>
        <td><input type='text' size={5} ref={stripeRef} onBlur={checkIfChanged}
            placeholder={claims.stripeId ? claims.stripeId.substr(0,7)+'...' : ''} /></td>

        <td>
            {changed && <Button size='sm' onMouseDown={e => {
                let newUser = getUpdated()
                console.log(newUser)
                props.onChange('newUser', newUser)
                setUser(newUser)
                setChanged(false)
            }}>Update</Button>}
        </td>
    </tr>
}

function MemoryPowerEditor(props) {
    let resources = useMemoryResources()
    let [power, setPower] = useState(props.initialPower)
    let [show, setShow] = useState(false)

    // expose power as the current state of this input component
    useEffect(()=>{
        props.powerRef.current = power
    }, [power])


    let defaultPower = {power:0, status: 'learning'} // default power value
    // fill out power for all modules
    let allPower = resources && Object.keys(resources).sort().reduce((m, key) => {
        // power for key (generate if doesnt exist)
        m[key] = {...(power[key] || defaultPower)}

        // power for key's chapter (generate if doesnt exist)
        let s = key.split('-')
        let chapterKey = `${s[0]}-${s[1]}`
        m[chapterKey] = {...(power[chapterKey] || defaultPower)}

        return m
    }, {})
    // console.log(`ALL power for ${props.displayName}`, allPower)

    // submit / cancel modal
    let cancel = ()=>{
        setPower(props.initialPower)
        setShow(false)
        props.onChange()
    }
    let change = ()=>{
        setShow(false)
        props.onChange()
    }

    let editButton = <Button size='sm' onClick={()=>setShow(true)}>Edit Power</Button>
    // shortcut rendering modal if not needed
    if(!show) return editButton
    if(!resources) return <Spinner animation='border' />

    let modal = <Modal onHide={change} show={show} >
        <Modal.Header>
            <Modal.Title><h2 className='m2'>Memory Power for<br />{props.displayName}</h2></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {show && <table><tbody> {/* Force lazy generation */}
                <tr>
                    <th>Scripture</th>
                    <th>Power</th>
                    <th>Status</th>
                </tr>
                {Object.keys(allPower).sort().map(module=><tr key={module}>
                    <td>{friendlyScriptureRef(module)}</td>
                    <td>{allPower[module].power.toFixed(2)}</td>
                    <td>
                        <select defaultValue={allPower[module].status} onChange={e=>{
                            let status = e.target.value
                            if(status === 'memorized') status = 'memorized-pending'
                            if(status === 'applied') status = 'applied-pending'

                            // edit status of current module
                            let newPower = {...power, [module]:{...allPower[module], status}}
                            // don't include default power in 
                            newPower = Object.fromEntries(
                                Object.entries(newPower).filter(p => !_.isEqual(p, defaultPower))
                            )
                            setPower(newPower)
                        }}>
                            <option value={'learning'}>Learning</option>
                            <option value={'memorized'}>Memorized</option>
                            <option value={'memorized-pending'}>Memorized (pending)</option>
                            <option value={'applied'}>Applied</option>
                            <option value={'applied-pending'}>Applied  (pending)</option>
                        </select>
                    </td>
                </tr>)}
            </tbody></table>}
            <Button className='mr-2' onClick={cancel}>Cancel</Button>
            <Button onClick={change}>Ok</Button>
        </Modal.Body>
    </Modal>

    return <>{modal}{editButton}</>
}