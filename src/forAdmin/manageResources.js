import React, { useState, useEffect, useRef, useCallback } from 'react'
import {Row, Col, ProgressBar, Spinner, Button} from 'react-bootstrap'
import $ from 'jquery'
import {useDropzone} from 'react-dropzone'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import { useFirestore } from '../hooks'
import {books, kinds, resoucesForKinds} from '../util'
import {firebase, db, storage} from '../firebase'

const defaultVideoData = {
  book: books[0],
  chapterVerse: '1:1-5',
  kind: Object.keys(kinds)[0],
  title: 'Title',
}

const memoryResources = 'memoryResources_02'

export default function ManageVideos(props) {
  let [localModules, setLocalModules] = useState({})
  let modules = useFirestore(
    memoryResources,
    (cum, doc) => {
      let d = doc.data();
      let chapterVerse = `${d.chapter}:${d.startVerse}-${d.endVerse}`
      cum[doc.id] = {...d, key:doc.id, chapterVerse: chapterVerse, newResource: false}
      return cum
    }, {}
  );
  console.log(modules)

  useEffect(() => { setLocalModules(modules) }, [modules])

  return <div className='container-xl form'>
    <table><tbody>
      <tr>
        <th>Scripture</th>
        <th>Title</th>
        <th className='rotate'><div><span>icon</span></div></th>

        <th className='rotate'><div><span>music</span></div></th>
        <th className='rotate'><div><span>watch</span></div></th>
        <th className='rotate'><div><span>dance</span></div></th>
        <th className='rotate'><div><span>karaoke</span></div></th>
        <th className='rotate'><div><span>schmoment</span></div></th>
        <th className='rotate'><div><span>speed</span></div></th>
        <th className='rotate'><div><span>coloring</span></div></th>
        <th className='rotate'><div><span>discussion</span></div></th>
        <th className='rotate'><div><span>teacherGuide</span></div></th>
      </tr>
      {modules && Object.keys(modules).map(mod => <ResourceTableRow {...modules[mod]} onChange={e => {
        // update state to match the updated form
        // data validation could go here too
        modules[mod][e.target.name] = e.target.value
        setLocalModules(modules)
      }}/>)}
      <tr>
        <td><button onClick={function(event) {

        // let dbRecord = {
        //   book: r.book,
        //   chapter: Number(r.chapter),
        //   startVerse: Number(r.startVerse),
        //   endVerse: Number(r.endVerse),
        //   title: r.title,
        //   version: Date.now(),
        //   icon: r.icon,
        // }


          // if($(':invalid').length !== 0) {
          //   $('#warnInvalid').css({'display':'block'})
          //   return
          // } else {
          //   $('#warnInvalid').css({'display':'none'})
          // }

          // let uploadTasks = {}
          // let dbTasks = {}

          // console.log(videos)

          // // group into modules
          // let byModule = videos.reduce((prev, cur) => {
          //     let bookIndex = String(books.indexOf(cur.data.book)).padStart(2, '0')
          //     let chapter=cur.data.chapterVerse.split(':')[0].padStart(3, '0')
          //     let startVerse=cur.data.chapterVerse.split(':')[1].split('-')[0].padStart(3, '0')
          //     let endVerse=cur.data.chapterVerse.split(':')[1].split('-')[1].padStart(3, '0')

          //     let key = `${bookIndex}-${chapter}-${startVerse}-${endVerse}`

          //     prev[key] = Object.keys(prev).includes(key) ? [...prev[key], cur] : [cur]
          //     return prev
          // }, {})

          // console.log(byModule)

          // for(var key in byModule) {
          //   let d = byModule[key][0].data
          //   let dbRecord = {
          //     book: d.book,
          //     chapter: d.chapter,
          //     startVerse: d.startVerse,
          //     endVerse: d.endVerse,
          //     title: d.title,
          //     version: Date.now(),
          //   }

          //   for(var v of byModule[key]) {
          //     let id = `${key}-${v.data.kind.toLowerCase().replaceAll(' ', '-')}`
          //     // let fileType = v.data.file.name.split('.').slice(-1)
          //     // let url = `memory/${v.data.book}/${chapter}/${id}.${fileType}`
  
          //     // let ref = firebase.storage().ref(url)
          //     // let uploadTask = ref.put(v.data.file)
          //     // uploadTask.on('state_changed', (snapshot) => {
          //     //   let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          //     //   setVideos(videos.map(_v => {
          //     //     if (_v.key === v.key) {
          //     //       _v = {..._v, progress: progress}
          //     //     }
          //     //     return _v
          //     //   }))
          //     // uploadTask.then(() => {console.log(`Uploaded ${url}`)})
          //   }

          //   console.log(key, dbRecord)
            
          //   db.doc(`${memoryResources}/${key}`).set(dbRecord).then(() => {console.log('Updated DB', key)})
          //   // v.data = {...dbRecord, chapterVerse: v.data.chapterVerse}
          // }

        }} >Upload</button></td>

        <td><input type='file' id='fileInput' size={8} multiple style={{display: 'none'}}
        onChange={function(event) {
          // let defaultData
          // if(videos.length == 0) defaultData = {...defaultVideoData}
          // else defaultData = videos[videos.length - 1].data

          // let newVideos = [...videos]

          // for(let i = 0; i <  event.target.files.length; i++) {
          //   // Add a row to the table for each selected file.
          //   let file = event.target.files[i]
          //   let newRow = {data: {...videoDataGuess(file.name, defaultData), file: file}, newResource: true, key: file.name}
          //   if(!(newRow.key in newVideos.map(v => v.key))) {
          //     newVideos.push(newRow)
          //   }
          // }
          // setVideos(newVideos)
        }}/></td>

      </tr>
    </tbody></table>
    <div colSpan={3} id='warnInvalid' style={{display:'none'}}>Data format error</div>
  </div>
}


// export default function ManageVideos(props) {
//   let [videos, setVideos] = useState([])

//   useEffect(() => {
//     db.collection("memoryResources").get().then(querySnapshot => {
//       var newVideos = querySnapshot.docs.map(doc => {
//         let d = doc.data()
//         let chapterVerse = `${d.chapter}:${d.startVerse}-${d.endVerse}`
//         return {key: doc.id, data: {...d, chapterVerse: chapterVerse}, newResource: false}
//       })
//       setVideos(newVideos)
//     })
//   }, [])

//   return <div className='container form'>
//     <table><tbody>
//       <tr>
//         <th>Scripture</th>
//         <th>Kind</th>
//         <th>Title</th>
//         <th>File</th>
//       </tr>
//       {videos.map(props => <ResourceTableRow {...props} onChange={e => {
//         // update state to match the updated form
//         // data validation could go here too
//         setVideos(videos.map(v => {
//           if (v.key === props.key) {
//             v = {...v}
//             v.data[e.target.name] = e.target.value
//           }
//           return v
//         }))
//       }}/>)}
//       <tr>
//         <th></th>
//         <td><button onClick={() => {$('#fileInput').click()}}>Add Videos</button></td>
//         <td><button onClick={function(event) {
//           // upload all new files to storage
//           // add entry for each file to db
//           if($(':invalid').length !== 0) {
//             $('#warnInvalid').css({'display':'block'})
//             return
//           } else {
//             $('#warnInvalid').css({'display':'none'})
//           }

//           let uploadTasks = {}
//           let dbTasks = {}

//           console.log(videos)

//           // group into modules
//           let byModule = videos.reduce((prev, cur) => {
//               let bookIndex = String(books.indexOf(cur.data.book)).padStart(2, '0')
//               let chapter=cur.data.chapterVerse.split(':')[0].padStart(3, '0')
//               let startVerse=cur.data.chapterVerse.split(':')[1].split('-')[0].padStart(3, '0')
//               let endVerse=cur.data.chapterVerse.split(':')[1].split('-')[1].padStart(3, '0')

//               let key = `${bookIndex}-${chapter}-${startVerse}-${endVerse}`

//               prev[key] = Object.keys(prev).includes(key) ? [...prev[key], cur] : [cur]
//               return prev
//           }, {})

//           console.log(byModule)

//           for(var key in byModule) {
//             let d = byModule[key][0].data
//             let dbRecord = {
//               book: d.book,
//               chapter: d.chapter,
//               startVerse: d.startVerse,
//               endVerse: d.endVerse,
//               title: d.title,
//               version: Date.now(),
//             }

//             for(var v of byModule[key]) {
//               let id = `${key}-${v.data.kind.toLowerCase().replaceAll(' ', '-')}`
//               // let fileType = v.data.file.name.split('.').slice(-1)
//               // let url = `memory/${v.data.book}/${chapter}/${id}.${fileType}`
//               switch(v.data.kind) {
//                 case "What It Means":
//                   dbRecord.teacherGuide = [v.data.url]; break
//                 case "Teachers Guide":
//                   dbRecord.teacherGuide = [v.data.url]; break
//                 case "Speed Memory":
//                   dbRecord.speed = [v.data.url]; break
//                 case "Schmoment":
//                   dbRecord.schmoment = [v.data.url]; break
//                 case "Music":
//                   dbRecord.music = [v.data.url]; break
//                 case "Karaoke":
//                   dbRecord.karaoke = [v.data.url]; break
//                 case "Karaoke Video":
//                   dbRecord.karaoke = [v.data.url]; break
//                 case "Family Chat":
//                   dbRecord.discussion = [v.data.url]; break
//                 case "Dance":
//                   dbRecord.dance = [v.data.url]; break
//                 case "Dance Video":
//                   dbRecord.dance = [v.data.url]; break
//                 case "Color":
//                   dbRecord.coloring = [v.data.url]; break
//                 case "Coloring Pages":
//                   dbRecord.coloring = [v.data.url]; break
//                 case "Music Video":
//                   dbRecord.watch = [v.data.url]; break
//                 case "Watch":
//                   dbRecord.watch = [v.data.url]; break
//                 default:
//                   console.log('invalid kind:', v.data.kind)
//               }
  
//               // let ref = firebase.storage().ref(url)
//               // let uploadTask = ref.put(v.data.file)
//               // uploadTask.on('state_changed', (snapshot) => {
//               //   let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
//               //   setVideos(videos.map(_v => {
//               //     if (_v.key === v.key) {
//               //       _v = {..._v, progress: progress}
//               //     }
//               //     return _v
//               //   }))
//               // uploadTask.then(() => {console.log(`Uploaded ${url}`)})
//             }

//             console.log(key, dbRecord)
            
//             db.doc(`${memoryResources}/${key}`).set(dbRecord).then(() => {console.log('Updated DB', key)})
//             // v.data = {...dbRecord, chapterVerse: v.data.chapterVerse}
//           }
            

//           // for(var v of videos) {
//           //   if(v.newResource) {
//           //     let bookIndex = String(books.indexOf(v.data.book)).padStart(2, '0')
//           //     let chapter=v.data.chapterVerse.split(':')[0].padStart(3, '0')
//           //     let startVerse=v.data.chapterVerse.split(':')[1].split('-')[0].padStart(3, '0')
//           //     let endVerse=v.data.chapterVerse.split(':')[1].split('-')[1].padStart(3, '0')

//           //     let id = `${bookIndex}-${chapter}-${startVerse}-${endVerse}-${v.data.kind.toLowerCase().replaceAll(' ', '-')}`
//           //     let fileType = v.data.file.name.split('.').slice(-1)
//           //     let url = `memory/${v.data.book}/${chapter}/${id}.${fileType}`

//           //     let ref = firebase.storage().ref(url)
//           //     let uploadTask = ref.put(v.data.file)
//           //     uploadTask.on('state_changed', (snapshot) => {
//           //       let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
//           //       setVideos(videos.map(_v => {
//           //         if (_v.key === v.key) {
//           //           _v = {..._v, progress: progress}
//           //         }
//           //         return _v
//           //       }))
//           //     })
//           //     uploadTask.then(() => {console.log('Uploaded File')})

//           //     let dbRecord = {
//           //       book: v.data.book,
//           //       chapter: Number(chapter),
//           //       startVerse: Number(startVerse),
//           //       endVerse: Number(endVerse),
//           //       title: v.data.title,
//           //       kind: v.data.kind,
//           //       url: url,
//           //       version: Date.now(),
//           //     }
              
//           //     db.doc(`memoryResources/${id}`).set(dbRecord).then(() => {console.log('Updated DB')})
//           //     v.data = {...dbRecord, chapterVerse: v.data.chapterVerse}
//           //   }
//           // }
//           // setVideos(videos.map(v => {return {...v, newResource: false}}))

//         }} >Upload</button></td>

//         <td><input type='file' id='fileInput' size={8} multiple style={{display: 'none'}}
//         onChange={function(event) {
//           let defaultData
//           if(videos.length == 0) defaultData = {...defaultVideoData}
//           else defaultData = videos[videos.length - 1].data

//           let newVideos = [...videos]

//           for(let i = 0; i <  event.target.files.length; i++) {
//             // Add a row to the table for each selected file.
//             let file = event.target.files[i]
//             let newRow = {data: {...videoDataGuess(file.name, defaultData), file: file}, newResource: true, key: file.name}
//             if(!(newRow.key in newVideos.map(v => v.key))) {
//               newVideos.push(newRow)
//             }
//           }
//           setVideos(newVideos)
//         }}/></td>

//       </tr>
//     </tbody></table>
//     <div colSpan={3} id='warnInvalid' style={{display:'none'}}>Data format error</div>
//   </div>
// }

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
  // if(p.newResource) return <tr>
  //     <td>
  //       <select defaultValue={p.book} onChange={p.onChange} name='book' >
  //         {books.map((b) => <option value={b}>{b}</option>)}
  //       </select>
  //       <input type='text' name='chapterVerse' pattern={'\\d+:\\d+-\\d+'} size={3} defaultValue={p.chapterVerse} onChange={p.onChange}/>
  //     </td>
  //     <td>
  //       <select defaultValue={p.kind} onChange={p.onChange} name='kind' >
  //         {Object.keys(kinds).map((b) => <option value={b}>{b}</option>)}
  //       </select>
  //     </td>
  //     <td><input type='text' name='title' pattern={'[A-Za-z ]+'} size={5} defaultValue={p.title} onChange={p.onChange}/></td>
  //     <td>{p.file.name}</td>
  //   </tr>
  // else
  return <tr>
    <td>{`${p.book} ${p.chapterVerse}`}</td>
    <td>{p.title}</td>
    <td><FileUpload resource={p} attribute={'icon'} /></td>

    <td><FileUpload resource={p} attribute={kinds.music} /></td>
    <td><FileUpload resource={p} attribute={kinds.watch} /></td>
    <td><FileUpload resource={p} attribute={kinds.dance} /></td>
    <td><FileUpload resource={p} attribute={kinds.karaoke} /></td>
    <td><FileUpload resource={p} attribute={kinds.schmoment} /></td>
    <td><FileUpload resource={p} attribute={kinds.speed} /></td>
    <td><FileUpload resource={p} attribute={kinds.coloring} /></td>
    <td><FileUpload resource={p} attribute={kinds.discussion} /></td>
    <td><FileUpload resource={p} attribute={kinds.teacherGuide} /></td>

    {/* <td>{p.progress && (p.progress<100 ? <ProgressBar now={p.progress} /> : <i class="fa fa-check" aria-hidden="true"></i>)}</td> */}
  </tr>
}

function FileUpload(props) {
  let file = useRef()
  let [uploading, setUploading] = useState(false)
  let [progress, setProgress] = useState(0)
  
  
  let onDrop = useCallback(files => {
    let r = props.resource
    console.log(r)

    let fileType = files[0].name.split('.').slice(-1)
    let path = `memory/${r.key}${'-' + props.suffix || ''}.${fileType}`

    // upload to storage
    let ref = firebase.storage().ref(path)
    // let uploadTask = ref.put(files[0])
    // uploadTask.on('state_changed', (snapshot) => {
    //   setProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
    //   if(snapshot.bytesTransferred == snapshot.totalBytes) {
    //     setUploading(false)
    //   }
    // })
    // uploadTask.then(() => {console.log('Uploaded File')})

    // update database
    
    let dbKeys = ['book', 'chapter', 'startVerse', 'endVerse', 'title', 'icon', ...Object.values(resoucesForKinds).reduce((cum, arr)=>[...cum, ...arr],[])]
    let dbRecord = Object.keys(r).filter(k=>dbKeys.includes(k)).reduce((cum, key)=>{return {...cum, [key]:r[key]}},{})
    dbRecord = {...dbRecord, version: Date.now(), [props.attribute]:[path]}
    console.log(r.key, dbRecord)

    // db.doc(`${memoryResources}/${id}`).set(dbRecord).then(() => {console.log('Updated DB')})

  })
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  let icon = <i class="fa fa-plus-square-o" aria-hidden="true" />
  if (uploading) icon = <CircularProgressbar value={progress} strokeWidth={50} styles={buildStyles({trailColor: '#eee', pathColor:'#10fc'})} />
  else if(props.resource[props.attribute]) icon = <i class="fa fa-file" aria-hidden="true" />
  
  return <div onClick={() => {$(file.current).click()}} {...getRootProps()} style={{width:'25px'}} >
      <input ref={file} style={{display: 'none'}} {...getInputProps()} />
      {icon}
  </div>
}