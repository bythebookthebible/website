import React, { useState, useEffect, useRef, useCallback } from 'react'
import $ from 'jquery'
import {useDropzone} from 'react-dropzone'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import { useMemoryResources } from '../common/hooks'
import {books, kinds, resoucesForKinds, keyFromScripture} from '../util'
// import {firebase, db} from '../firebase'
import { useFirestore, useFirebase } from 'react-redux-firebase'

const defaultVideoData = {
  book: books[0],
  chapterVerse: '1:1-5',
  kind: Object.keys(kinds)[0],
  title: 'Title',
}

const memoryResources = 'memoryResources_02'

export default function ManageVideos(props) {
  let resources = useMemoryResources()
  let firestore = useFirestore()

  let attributeOptions = ['lock', 'icon', ...Object.values(resoucesForKinds).reduce((cum, arr)=>new Set([...cum, ...arr]).values(),[])]

  let onAddModule = event => {
    let title = $('#title').val()
    let book = $('#book').val()
    let chapterVerse = $('#chapterVerse').val()
    let [chapter] = chapterVerse.split(':').slice(0)
    let [verses] = chapterVerse.split(':').slice(-1)
    let [startVerse, endVerse] = verses.split('-')
    let key = keyFromScripture(book, chapter, verses)

    let module = {
      book: book,
      chapter: Number(chapter),
      startVerse: Number(startVerse),
      endVerse: Number(endVerse),
      title: title,
      version: Date.now(),
      lock: true,
    }

    firestore.doc(`${memoryResources}/${key}`).set(module)
  }

  return <div className='container-xl form'>
    <table><tbody>
      {/* Headers */}
      <tr>
        <th>Scripture</th>
        <th>Title</th>
        {attributeOptions.map(attr => 
          <th className='rotate'><div><span>{attr}</span></div></th>
        )}
      </tr>

      {/* Rows by module */}
      {resources && Object.entries(resources).map(([module, resource]) => 
        <ResourceTableRow attributeOptions={attributeOptions} resource={resource} module={module} />
      )}

    </tbody></table>
    
    {/* Add Module */}
    <select id='book' >
      {books.map((b) => <option value={b}>{b}</option>)}
    </select>
    <input type='text' id='chapterVerse' pattern={'\\d+:\\d+-\\d+'} size={5} defaultValue='1:1-10' />
    <input type='text' id='title' pattern={'[A-Za-z ]+'} size={10} defaultValue='Title' />
    
    <button onClick={onAddModule} >Add Module</button>

    <div style={{height: '2rem'}} />

  </div>
}

function ResourceTableRow(props) {
  let r = props.resource
  let m = props.module
  return <tr>
    <td>{`${r.book} ${r.chapter}:${r.startVerse}-${r.endVerse}`}</td>
    <td>{r.title}</td>

    {props.attributeOptions.map(attr => 
      <td><Uploader resource={r} module={m} attribute={attr} /></td>
    )}
  </tr>
}

function Uploader(props) {
  let firebase = useFirebase()
  let firestore = useFirestore()

  let file = useRef()
  let [uploading, setUploading] = useState(false)
  let [progress, setProgress] = useState(0)
  
  
  let onDrop = useCallback(async files => {
    // TODO: HANDLE MULTIPLE FILES POSSIBLY

    if(props.attribute == 'lock')
      return

    if(props.attribute == 'timestamps') {
      // upload text of file to firestore
      let reader = new FileReader()
      reader.onload = e => {
        firestore.doc(`${memoryResources}/${props.module}`)
          .update({version: Date.now(), [props.attribute]:[reader.result]})
          .catch(console.error)
      }
      reader.readAsText(files[0])
      return
    }

    else {
      // rename file for storage
      let r = props.resource
      let fileType = files[0].name.split('.').slice(-1)
      let fileName = `memory/${r.book}/${String(r.chapter).padStart(3, '0')}/${props.module}-${props.attribute}${props.suffix ? '-' + props.suffix : ''}.${fileType}`

      // upload and track progress
      setUploading(true)
      let uploadTracker = firebase.storage().ref(fileName).put(files[0])
      uploadTracker.on('state_changed', snapshot => {
          setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        })
      uploadTracker.then(() => {setUploading(false)})
      uploadTracker.catch(console.error)


      // upload to firestore
      firestore.doc(`${memoryResources}/${props.module}`)
        .update({version: Date.now(), [props.attribute]:[fileName]})
        .catch(console.error)
    }
  })

  // make icon match type
  // default icon is '+' if no content
  let icon = <i className="fas fa-plus" aria-hidden="true" style={{fontSize:'10px', textAlign:'center'}} />
  
  // if uploading, icon is progressbar
  if (uploading) icon =
    <CircularProgressbar value={progress} strokeWidth={30} styles={buildStyles({trailColor: '#eee', pathColor:'#10fc'})} />

  // timestamps icon is determined by the attribute, since it is not a file
  else if(props.attribute == 'timestamps' && props.resource[props.attribute]) icon = 
    <i class="fas fa-file-alt" aria-hidden="true" />

  // if attribute is 'lock', icon is instead a checkbox
  else if(props.attribute == 'lock') icon = 
    <input type='checkbox' defaultChecked={!!props.resource[props.attribute]} onChange={e => {
      firestore.doc(`${memoryResources}/${props.module}`)
        .update({version: Date.now(), [props.attribute]:e.target.checked})
        .catch(console.error)
    }} />

  // if something is uploaded (file) then match file type
  else if(props.resource[props.attribute]) {
    let fileType = props.resource[props.attribute][0].split('.').slice(-1)[0]
    switch(fileType){
      case 'svg': icon = <i class="far fa-file-image" aria-hidden="true" />; break
      case 'png': icon = <i class="fas fa-file-image" aria-hidden="true" />; break
      case 'pdf': icon = <i class="fas fa-file-pdf" aria-hidden="true" />; break
      case 'mp3': icon = <i class="fas fa-file-audio" aria-hidden="true" />; break
      case 'mp4': icon = <i class="fas fa-file-video" aria-hidden="true" />; break
      case 'mov': icon = <i class="fas fa-file-video" aria-hidden="true" />; break
      default: {
        console.log('unknown file type:', fileType, props.resource[props.attribute])
        icon = <i class="fas fa-file" aria-hidden="true" />
        break
      }
    }
  }

  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  const onClick = () => {
    if(props.attribute !== 'lock') {
      $(file.current).click()
    }
  }

  return <div {...getRootProps()} onClick={onClick} style={{width:'25px', textAlign:'center'}} >
      {icon}
      <input ref={file} style={{display: 'none'}} {...getInputProps()} />
  </div>
}