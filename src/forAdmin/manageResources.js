import React, { useState, useEffect, useRef } from 'react'
import {Row, Col, ProgressBar, Spinner, Button} from 'react-bootstrap'
import $ from 'jquery'

import { useFirestore } from '../hooks'
import {books, kinds} from '../util'
import {firebase, db, storage} from '../firebase'

const defaultVideoData = {
    book: books[0],
    chapterVerse: '1:1-5',
    kind: kinds[0],
    title: 'Title',
}

export default function ManageVideos(props) {
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
