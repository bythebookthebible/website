import React, { useState, useEffect, useRef, useCallback } from 'react'
import {Row, Col, ProgressBar, Spinner, Button} from 'react-bootstrap'
import $ from 'jquery'
import {useDropzone} from 'react-dropzone'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import { useFirestore } from '../hooks'
import {books, kinds, resoucesForKinds, keyFromScripture} from '../util'
import {firebase, db, storage} from '../firebase'

const defaultVideoData = {
  book: books[0],
  chapterVerse: '1:1-5',
  kind: Object.keys(kinds)[0],
  title: 'Title',
}

const memoryResources = 'memoryResources_02'

export default function ManageVideos(props) {
  let [modules, setModules] = useState({})
  let dbModules = useFirestore(
    memoryResources,
    (cum, doc) => {
      let d = doc.data();
      let chapterVerse = `${d.chapter}:${d.startVerse}-${d.endVerse}`
      cum[doc.id] = {...d, key:doc.id, chapterVerse: chapterVerse}
      return cum
    }, {}
  );

  console.log(modules)

  useEffect(() => { setModules(dbModules) }, [dbModules])

  let attributeOptions = ['icon', ...Object.values(resoucesForKinds).reduce((cum, arr)=>new Set([...cum, ...arr]).values(),[])]

  return <div className='container-xl form'>
    <table><tbody>
      <tr>
        <th>Scripture</th>
        <th>Title</th>
        {attributeOptions.map(attr => <th className='rotate'><div><span>{attr}</span></div></th>)}
      </tr>

      {modules && Object.keys(modules).map(mod => <ResourceTableRow attributeOptions={attributeOptions} module={modules[mod]} onChange={e => {
        // update state to match the updated form
        // data validation could go here too
        modules[mod][e.target.name] = e.target.value
        setModules(modules)
      }}/>)}

    </tbody></table>
    
    {/* Add Module */}
    <select id='book' >
      {books.map((b) => <option value={b}>{b}</option>)}
    </select>
    <input type='text' id='chapterVerse' pattern={'\\d+:\\d+-\\d+'} size={5} defaultValue='1:1-10' />
    <input type='text' id='title' pattern={'[A-Za-z ]+'} size={10} defaultValue='Title' />
    
    <button onClick={function(event) {
      let title = $('#title').val()
      let book = $('#book').val()
      let chapterVerse = $('#chapterVerse').val()
      let [chapter] = chapterVerse.split(':').slice(0)
      let [verses] = chapterVerse.split(':').slice(-1)
      let [startVerse, endVerse] = verses.split('-')
      let key = keyFromScripture(book, chapter, verses)

      let dbRecord = {
        book: book,
        chapter: Number(chapter),
        startVerse: Number(startVerse),
        endVerse: Number(endVerse),
        title: title,
        version: Date.now(),            
      }

      let newModule = {
        ...dbRecord,
        key: key,
        chapterVerse: chapterVerse,
      }

      setModules({...modules, [key]:newModule})
      // not adding to db until there is at least one content for this module
    }} >Add Module</button>
  </div>
}

function ResourceTableRow(props) {
  let p = props.module
  return <tr>
    <td>{`${p.book} ${p.chapterVerse}`}</td>
    <td>{p.title}</td>

    {props.attributeOptions.map(attr => <td><FileUploader resource={p} attribute={attr} /></td>)}
  </tr>
}

function FileUploader(props) {
  let file = useRef()
  let [uploading, setUploading] = useState(false)
  let [progress, setProgress] = useState(0)
  
  
  let onDrop = useCallback(async files => {
    let r = props.resource
    console.log(r)

    let fileType = files[0].name.split('.').slice(-1)
    let value = `memory/${r.key}-${props.attribute}${props.suffix ? '-' + props.suffix : ''}.${fileType}`

    // new db contents
    let dbKeys = ['book', 'chapter', 'startVerse', 'endVerse', 'title', 'icon', ...Object.values(resoucesForKinds).reduce((cum, arr)=>[...cum, ...arr],[])]
    let dbRecord = Object.keys(r).filter(k=>dbKeys.includes(k)).reduce((cum, key)=>{return {...cum, [key]:r[key]}},{})

    if(props.attribute == 'timestamps') {
      // timestamp special case: read file into text
      let reader = new FileReader()
      reader.onload = e=>{
        // update to database
        dbRecord = {...dbRecord, version: Date.now(), [props.attribute]:[reader.result]}
        console.log(dbRecord)
        db.doc(`${memoryResources}/${r.key}`).set(dbRecord).catch(() => {console.log('Error Updating DB')})
      }
      reader.readAsText(files[0])

    } else {
      // upload to storage
      let ref = firebase.storage().ref(value)
      let uploadTask = ref.put(files[0])
      setUploading(true)
      uploadTask.on('state_changed', (snapshot) => {
        setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        if(snapshot.bytesTransferred == snapshot.totalBytes) {
          setUploading(false)
        }
      })
      uploadTask.then(() => {console.log('Uploaded File')})

      // update to database
      dbRecord = {...dbRecord, version: Date.now(), [props.attribute]:[value]}
      console.log(dbRecord)
      db.doc(`${memoryResources}/${r.key}`).set(dbRecord).catch(() => {console.log('Error Updating DB')})
    }


  })
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  let icon = <i className="fa fa-plus-square-o" aria-hidden="true" />
  if (uploading) icon = <CircularProgressbar value={progress} strokeWidth={30} styles={buildStyles({trailColor: '#eee', pathColor:'#10fc'})} />
  else if(props.resource[props.attribute]) icon = <i class="fa fa-file" aria-hidden="true" />
  
  return <div onClick={() => {$(file.current).click()}} {...getRootProps()} style={{width:'25px'}} >
      <input ref={file} style={{display: 'none'}} {...getInputProps()} />
      {icon}
  </div>
}