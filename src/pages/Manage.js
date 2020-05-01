import React, { Component } from 'react'
import ReactPlayer from 'react-player'
import {Row, Col, ProgressBar} from 'react-bootstrap'
import $ from 'jquery'
import {
  Switch,
  Route,
  useRouteMatch,
  useParams
} from "react-router-dom"

import topImg  from '../images/R+C.svg'

var firebase = require('firebase')
var db = firebase.firestore()

const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea',
'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
'1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
'1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']

const kinds = ["Music Video", "Dance Video", "Karaoke Video", "Slower Video", "Coloring Pages", "Teachers Guide"]
const defaultVideoData = {
    book: books[0],
    chapterVerse: '1:1-2',
    kind: kinds[0],
    title: 'Judge Not',
}

export default class Manage extends Component {
    constructor(props) {
        super(props)
        this.state = {user: firebase.auth().currentUser}

        firebase.auth().onAuthStateChanged(async function(user) {
            if(!user) {
                window.location = '/login?to=/manage'
            }
            let token = await user.getIdTokenResult(true)
            if (!token.claims.admin) {
                window.location = '/memorize'
            }
            this.setState({user: user})
        }.bind(this))
    }
    render() {
        return (
            <div className="Manage">
                {
                    firebase.auth().currentUser ? 
                        <div className="button" onClick={() => {
                            firebase.auth().signOut().then(function(user) {
                                    window.location = '/memorize'
                                }).catch(function(e) {
                                    console.log('Signout error: ', e)
                                })
                        }}>Logout</div> :
                        <a className="button" href='/login'>Login</a>
                }

                <Switch>
                    <Route path={'/manage/manageUsers'}><h1>Manage Users</h1></Route>
                    <Route path={'/manage/manageVideos'}><ManageVideos /></Route>
                    <Route path={'/manage/manageCamps'}><ManageCamps /></Route>
                    <Route path={'/manage'}><ManageMenu /></Route>
                </Switch>
            </div>
        )
    }
}

var ManageMenu = function(props) {
    return (
        <div className='ManageMenu'>
            <Col>
                <Row><img src={topImg} style={{width:'100%', maxWidth:'250px'}} /></Row>
                <Row><a className='button' href='/manage/manageVideos'>Manage Videos</a></Row>
                <Row><a className='button' href='/manage/manageCamps'>Manage Camps</a></Row>
                {/* <Row><a className='button' href='/manage/manageUsers'>Manage Users</a></Row> */}
            </Col>
        </div>
    )
}

class ManageCamps extends Component {
    constructor(props) {
        super(props)
        this.state = {campData: []}

        db.collection("summercamps").get().then(function(querySnapshot) {
            var campData = querySnapshot.docs.map(function(doc) {
                return doc.data()
            })
            this.setState({campData: campData})
        }.bind(this))
    }

    render() {
        return (
            <div className='ManageCamps form'>
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
                    {console.log(this.state.campData)}
                    {this.state.campData.map(CampTableRow)}
                    <tr>
                        <th></th>
                        <td><button onClick={function(event) {
                            // Add a row to the table. Will update db with button when filled in.
                            this.state.campData.push({
                                location: 'New Camp',
                                startDate: {toDate: function() {return new Date()}},
                                numStudents: 0,
                                venueStatus: 'idea',
                            })
                            this.setState({campData: this.state.campData})
                        }.bind(this)}>Add Camp</button></td>
                    </tr>
                </table>
            </div>
        )
    }
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

class ManageVideos extends Component {
    constructor(props) {
        super(props)
        this.state = {videos: []}

        db.collection("memoryResources").get().then(function(querySnapshot) {
            var videos = querySnapshot.docs.map(doc => {
                let d = doc.data()
                let chapterVerse = `${d.chapter}:${d.startVerse}-${d.endVerse}`
                return {key: doc.id, data: {...d, chapterVerse: chapterVerse}, newResource: false
            }})
            this.setState({videos: videos})
        }.bind(this))
    }

    render() {
        return (
            <div className='ManageCamps form'>
                <table><tbody>
                    <tr>
                        <th>Scripture</th>
                        <th>Kind</th>
                        <th>Title</th>
                        <th>File</th>
                    </tr>
                    {this.state.videos.map(props => <ResourceTableRow {...props} onChange={((e) => {
                        // update state to match the updated form
                        // data validation could go here too
                        this.setState({videos: this.state.videos.map(v => {
                            if (v.key === props.key) {
                                v = {...v}
                                v.data[e.target.name] = e.target.value
                            }
                            return v
                        })})
                    }).bind([props, this])}/>)}
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

                            for(var i in this.state.videos) {
                                let v = this.state.videos[i]
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
                                        this.setState({videos: this.state.videos.map(_v => {
                                            if (_v.key === v.key) {
                                                _v = {..._v, progress: progress}
                                            }
                                            return _v
                                        })})
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
                                    }
                                    
                                    db.doc(`memoryResources/${id}`).set(dbRecord).then(() => {console.log('Updated DB')})
                                    v.data = {...dbRecord, chapterVerse: v.data.chapterVerse}
                                }
                            }
                            this.setState({videos: this.state.videos.map(v => {return {...v, newResource: false}})})
                        }.bind(this)}>Upload</button></td>

                        <td><input type='file' id='fileInput' size={8} multiple style={{display: 'none'}}
                        onChange={function(event) {
                            let lastEntry = this.state.videos[this.state.videos.length - 1]
                            if(this.state.videos.length == 0) {
                                lastEntry = {data: defaultVideoData}
                            }
                            let newVideos = [...this.state.videos]

                            for(let i = 0; i <  event.target.files.length; i++) {
                                // Add a row to the table for each selected file.
                                let newRow = {...lastEntry, newResource: true, key: event.target.files[i].name}
                                newRow.data = {...newRow.data, file: event.target.files[i]}
                                if(!(newRow.key in newVideos.map(v => v.key))) {
                                    newVideos.push(newRow)
                                }
                            }
                            
                            this.setState({videos: newVideos})
                        }.bind(this)}/></td>

                    </tr>
                </tbody></table>
                <div colSpan={3} id='warnInvalid' style={{display:'none'}}>Data format error</div>
            </div>
        )
    }
}

class ResourceTableRow extends Component {
    render() {
        let p = this.props
        // console.log(p)
        if(p.newResource) {
            return (
            <tr>
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
            )
        }
        return (
            <tr>
                <td>{`${p.data.book} ${p.data.chapterVerse}`}</td>
                <td>{p.data.kind}</td>
                <td>{p.data.title}</td>
                <td>{p.data.url.split('/').slice(-1)}</td>
                {p.progress && <td><ProgressBar now={p.progress} /></td>}
            </tr>
        )
    }
} 
