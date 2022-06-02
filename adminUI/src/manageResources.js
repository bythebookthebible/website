import React, { useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'

import { db, useMemoryDB, useFirestoreData, memorySeriesDB} from 'bythebook-shared/dist/firebase';
import { getVideoForm, getModuleForm, getSeriesForm, validFormats } from './memoryFormData'
import { useFileUploader, useFirebasePopupForm } from './firebaseForm'

import { doc, setDoc, collection, query, onSnapshot } from "firebase/firestore"


export default function ManageResources(props) {
  const {resources, modules, seriesList} = useMemoryDB()

  const [uploadFile, progressStates] = useFileUploader()

  function submitDroppedFile({file, module, series}) {
    const idData = {module, series, creator: 'bythebook'}
    const progressKey = `${module}-${series}`
    const location = videoForm.getFileLocation({file, module, series})
    const fileData = uploadFile({file, progressKey, location})

    const values = {...fileData, ...idData}

    setDoc(doc(db, videoForm.firebaseCollection, videoForm.getKey(values)), values).catch(console.warn)
  }

  const seriesForm = getSeriesForm({resources, modules, seriesList})
  const moduleForm = getModuleForm({resources, modules, seriesList})
  const videoForm = getVideoForm({resources, modules, seriesList, uploadFile})
  
  const [SeriesPopup, AddSeries, EditSeries] = useFirebasePopupForm(seriesForm)
  const [ModulePopup, AddModule, EditModule] = useFirebasePopupForm(moduleForm)
  const [VideoPopup, AddVideo, _, openPopup] = useFirebasePopupForm(videoForm)

  const EditVideoButton = props => <DynamicVideoButton {...props} openPopup={openPopup} submitFile={submitDroppedFile} progress={progressStates?.[`${props.module}-${props.series}`]} resources={resources} seriesList={seriesList} />


  return <div className='container-xl resourcesView'>
    <table><tbody>
      {/* Headers */}
      <tr style={{position: "sticky", top: 0, background: "white", boxShadow: "black 0 -1px inset", paddingTop: "-5rem"}}>
        <th>Scripture</th>
        <th>Title</th>

        {Object.keys(seriesList).map((k) =>
          <th className='rotate' key={k}><div><span>{seriesList[k].name}</span><EditSeries values={seriesList[k]} /></div></th>
        )}

        <th><AddSeries /></th>
      </tr>

      {/* Rows by module */}
      {modules && Object.entries(modules).map(([moduleKey, module]) => {
        const chapterVerse = `${module.chapter}:${module.startVerse}-${module.endVerse}`
        return <tr key={moduleKey}>
          <td><EditModule values={{...module, chapterVerse}}/>{`${module.book} ${chapterVerse}`}</td>
          <td style={{maxWidth:'8rem'}} className='fade-right'>{module.title}</td>

          {/* Video Uploads */}
          {Object.keys(seriesList).map(s =>
            <td key={s}><EditVideoButton series={s} module={moduleKey} /></td>
          )}
        </tr>
      })}

    </tbody></table>

    <AddModule /><AddVideo />
    <SeriesPopup /><ModulePopup /><VideoPopup />
  </div>
}


const DynamicVideoButton = props => {
  const {module, series, progress, openPopup, submitFile, resources, seriesList} = props

  // only use dropzone to add new videos (not to edit)
  let onDrop = useCallback(files => submitFile({file: files[0], module, series}))
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  // Visually adjust icon
  // Blank while loading
  if(!seriesList[series] || !resources) return ''

  // no uploading for generated series
  if(seriesList[series].format === 'generated') return <span style={{color:"#888"}}>𝓰</span>

  // if uploading, show progress
  if(progress !== undefined) return <CircularProgressbar value={progress} strokeWidth={30} styles={buildStyles({trailColor: '#eee', pathColor:'#28B7FF'})} />

  // if not in db, show plus and trigger addVideoPopup
  const videos = Object.entries(resources)
    .filter(([k,v]) => v.series === series)
    .filter(([k,v]) => v.module === module)
    // .map(([k,v])=>({[k]:v}))

  if(!videos || videos.length === 0)
    return <div {...getRootProps()} onClick={()=>openPopup({editMode:false, values: {module, series, creator: 'bythebook'}})}>
      <i className="fas fa-plus" style={{fontSize:'10px', textAlign:'center'}} />
      <input {...getInputProps()} />
    </div>

  const [_db_key, video] = videos[0]

  let color = '#000'
  const correctFileType = validFormats[seriesList[series].format]
  if(video.size > 200 * 1024 * 1024) color = '#fd7e14' // if file too large (>200 MB), color warning
  if(video.fileType !== correctFileType) color = '#dc3545' // if wrong file type, color danger
  // TODO handle multiple videos of same series

  // if in db, show icon based on file type, and hover edit button
  let icon
  switch(video.fileType){
    case 'svg': icon = "far fa-file-image"; break
    case 'png': icon = "fas fa-file-image"; break
    case 'pdf': icon = "fas fa-file-pdf"; break
    case 'mp3': icon = "fas fa-file-audio"; break
    case 'mp4': icon = "fas fa-file-video"; break
    default: icon = "fas fa-question"; break
  }

  return <div onClick={()=>openPopup({editMode:true, values: {_db_key, ...video}})}>
    <i className={icon} style={{color}} />
    <i className="fas fa-pen edit-hover" />
  </div>
}
