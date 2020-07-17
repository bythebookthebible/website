import React, { Component, useState, useEffect, useRef } from 'react'
import ReactPlayer from 'react-player'
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

import {firebase, db, storage} from '../firebase'

const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea',
'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
'1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
'1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']

// const kinds = ["Music Video", "Dance Video", "Karaoke Video", "Coloring Pages", "Teachers Guide"]
const kinds = ["Music Video", "Teachers Guide", "Speed Memory", "Schmoment", "Music", "Dance Video", "Coloring Pages", "Karaoke Video"]

const defaultVideoData = {
    book: books[0],
    chapterVerse: '1:1-2',
    kind: kinds[0],
    title: 'Judge Not',
}

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

function ManageCamps(props) {
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

function ManageVideos(props) {
    let [videos, setVideos] = useState([])

    useEffect(() => {
        db.collection("memoryResources").get().then(querySnapshot => {
            var newVideos = querySnapshot.docs.map(doc => {
                let d = doc.data()
                let chapterVerse = `${d.chapter}:${d.startVerse}-${d.endVerse}`
                return {key: doc.id, data: {...d, chapterVerse: chapterVerse}, newResource: false}
            })
            setVideos(newVideos)
        })
    }, [])

    return <div className='container form'>
        <table><tbody>
            <tr>
                <th>Scripture</th>
                <th>Kind</th>
                <th>Title</th>
                <th>File</th>
            </tr>
            {videos.map(props => <ResourceTableRow {...props} onChange={e => {
                // update state to match the updated form
                // data validation could go here too
                setVideos(videos.map(v => {
                    if (v.key === props.key) {
                        v = {...v}
                        v.data[e.target.name] = e.target.value
                    }
                    return v
                }))
            }}/>)}
            <tr>
                <th></th>
                <td><button onClick={() => {$('#fileInput').click()}}>Add Videos</button></td>
                <td><button onClick={function(event) {
                    // upload all new files to storage
                    // add entry for each file to db
                    if($(':invalid').length !== 0) {
                        $('#warnInvalid').css({'display':'block'})
                        return
                    } else {
                        $('#warnInvalid').css({'display':'none'})
                    }

                    let uploadTasks = {}
                    let dbTasks = {}

                    for(var v of videos) {
                        if(v.newResource) {
                            let bookIndex = String(books.indexOf(v.data.book)).padStart(2, '0')
                            let chapter=v.data.chapterVerse.split(':')[0].padStart(3, '0')
                            let startVerse=v.data.chapterVerse.split(':')[1].split('-')[0].padStart(3, '0')
                            let endVerse=v.data.chapterVerse.split(':')[1].split('-')[1].padStart(3, '0')

                            let id = `${bookIndex}-${chapter}-${startVerse}-${endVerse}-${v.data.kind.toLowerCase().replaceAll(' ', '-')}`
                            let fileType = v.data.file.name.split('.').slice(-1)
                            let url = `memory/${v.data.book}/${chapter}/${id}.${fileType}`

                            let ref = firebase.storage().ref(url)
                            let uploadTask = ref.put(v.data.file)
                            uploadTask.on('state_changed', (snapshot) => {
                                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                                setVideos(videos.map(_v => {
                                    if (_v.key === v.key) {
                                        _v = {..._v, progress: progress}
                                    }
                                    return _v
                                }))
                            })
                            uploadTask.then(() => {console.log('Uploaded File')})

                            let dbRecord = {
                                book: v.data.book,
                                chapter: Number(chapter),
                                startVerse: Number(startVerse),
                                endVerse: Number(endVerse),
                                kind: v.data.kind,
                                title: v.data.title,
                                url: url,
                                version: Date.now(),
                            }
                            
                            db.doc(`memoryResources/${id}`).set(dbRecord).then(() => {console.log('Updated DB')})
                            v.data = {...dbRecord, chapterVerse: v.data.chapterVerse}
                        }
                    }
                    setVideos(videos.map(v => {return {...v, newResource: false}}))
                }}>Upload</button></td>

                <td><input type='file' id='fileInput' size={8} multiple style={{display: 'none'}}
                onChange={function(event) {
                    let defaultData
                    if(videos.length == 0) defaultData = {...defaultVideoData}
                    else defaultData = videos[videos.length - 1].data

                    let newVideos = [...videos]

                    for(let i = 0; i <  event.target.files.length; i++) {
                        // Add a row to the table for each selected file.
                        let file = event.target.files[i]
                        let newRow = {data: {...videoDataGuess(file.name, defaultData), file: file}, newResource: true, key: file.name}
                        if(!(newRow.key in newVideos.map(v => v.key))) {
                            newVideos.push(newRow)
                        }
                    }
                    setVideos(newVideos)
                }}/></td>

            </tr>
        </tbody></table>
        <div colSpan={3} id='warnInvalid' style={{display:'none'}}>Data format error</div>
    </div>
}

function videoDataGuess(fileName, defaultData) {
    let lastEntryData = {...defaultData}

    // kind
    if(/\.pdf$/.test(fileName)){
        if(/[^a-z]+tg[^a-z$]+/i.test(fileName)) lastEntryData.kind = 'Teachers Guide'
        else lastEntryData.kind = 'Coloring Pages'
    } else if(/\.m4a$/.test(fileName)){
        if(/[^a-z]+kar[^a-z$]+/i.test(fileName)) lastEntryData.kind = 'Karaoke Video'
        if(/[^a-z]+dv[^a-z$]+/i.test(fileName)) lastEntryData.kind = 'Dance Video'
        if(/[^a-z]+lv[^a-z$]+/i.test(fileName)) lastEntryData.kind = 'Schmoment'
        else lastEntryData.kind = 'Music Video'
    } else if(/\.mp3$/.test(fileName)){
        lastEntryData.kind = 'Music'
    }

    // verse

    // title
    let title = /^[\w ]+/.exec(fileName)
    if(title.length) lastEntryData.title = toTitleCase(title[0])

    return lastEntryData
}

function toTitleCase(str) {
    return str.trim().replace(/\b[a-z]|['_][a-z]|\B[A-Z]/g, function(x){return x[0]==="'"||x[0]==="_"?x:String.fromCharCode(x.charCodeAt(0)^32)})
}

function ResourceTableRow(p) {
    if(p.newResource) return <tr>
            <td>
                <select defaultValue={p.data.book} onChange={p.onChange} name='book' >
                    {books.map((b) => <option value={b}>{b}</option>)}
                </select>
                <input type='text' name='chapterVerse' pattern={'\\d+:\\d+-\\d+'} size={3} defaultValue={p.data.chapterVerse} onChange={p.onChange}/>
            </td>
            <td>
                <select defaultValue={p.data.kind} onChange={p.onChange} name='kind' >
                    {kinds.map((b) => <option value={b}>{b}</option>)}
                </select>
            </td>
            <td><input type='text' name='title' pattern={'[A-Za-z ]+'} size={5} defaultValue={p.data.title} onChange={p.onChange}/></td>
            <td>{p.data.file.name}</td>
        </tr>
    else return <tr>
        <td>{`${p.data.book} ${p.data.chapterVerse}`}</td>
        <td>{p.data.kind}</td>
        <td>{p.data.title}</td>
        <td>{p.data.url.split('/').slice(-1)}</td>
        <td>{p.progress && (p.progress<100 ? <ProgressBar now={p.progress} /> : <i class="fa fa-check" aria-hidden="true"></i>)}</td>
    </tr>
}

var getUsers = firebase.functions().httpsCallable('getUsers');
var setUser = firebase.functions().httpsCallable('setUser');

function ManageUsers(props) {
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