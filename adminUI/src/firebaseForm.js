import React, { useState, useRef, useCallback, useImperativeHandle, useEffect } from 'react'

import { db, cloudStorage, useFirestoreVariableDoc, useDownloadUrl } from 'bythebook-shared/dist/firebase';
import { Video, TimestampEditor } from 'bythebook-shared/dist/components';
import { Button, Modal } from 'react-bootstrap'

import { doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"
import { ref, deleteObject, uploadBytesResumable } from "firebase/storage"
import { fileExtensionFromUrl } from 'bythebook-shared/dist/util';

export const DynamicFileFormElement = React.forwardRef((props, forwardedRef) => {
  const {firestoreDoc, docKey, timestampKey} = props

  const fileRef = useRef()

  const [uploadFile, progressStates] = useFileUploader()
  const [curValueState, curValue] = useFirestoreVariableDoc(firestoreDoc)
  const previewUrl = useDownloadUrl(curValueState?.[docKey])

  const timestampVideoRef = useRef()

  // provide functions for form to getValue, submitFile, submitDelete
  const getValue = useCallback(() => {
    const file = fileRef.current?.files?.[0]
    return file && {
      size: file.size,
      fileType: file.name.split('.').slice(-1)[0],
      lastModified: file.lastModified,
    }
  })

  const submitDelete = useCallback(() => {
    deleteObject(ref(cloudStorage, curValue.current.location)).catch(console.warn)
    // updateDoc(doc(db, firestoreDoc), {docKey: db.FieldValue.delete()}).catch(console.warn)
  })

  const submitFile = useCallback (props => {
    const {location, progressKey} = props

    const file = fileRef.current?.files?.[0]
    uploadFile({file, progressKey, location})

    const oldValue = curValue.current

    if(oldValue && oldValue[docKey] && oldValue[docKey] !== location ) {
      deleteObject(ref(cloudStorage, oldValue.location)).catch(console.warn)
    }

    return {
      size: file.size,
      fileType: file.name.split('.').slice(-1)[0],
      lastModified: file.lastModified,
    }
  })

  const fileInput = <DroppableFileInput ref={fileRef} />

  useImperativeHandle(forwardedRef, () => ({
    getValue,
    submitFile,
    submitDelete,
    progressStates,
    getFiles: ()=>fileRef.current?.files,
    getTimestamps: ()=>timestampKey && timestampVideoRef.current?.timestamps,
  }), [getValue, submitFile, submitDelete, progressStates, fileRef, timestampVideoRef])


  // if something is uploaded, show preview
  //  if it is a video && timestampKey exists, show timestamp UI
  const fileType = previewUrl && fileExtensionFromUrl(previewUrl)
  let preview = <iframe src={previewUrl} style={{width:"50vw"}} />
  if(["mp4", "mp3", "m4a"].includes(fileType)) preview = <TimestampEditor.Video ref={timestampVideoRef} {...{timestampKey, firestoreDoc, src: previewUrl}} />

  return <div className="DynamicFileFormElement">
    {preview}
    {fileInput}
  </div>
})

export const DroppableFileInput = React.forwardRef((props, ref) => {
  const preventDefault = e => e.preventDefault()
  const onDrop = e => `ref.current`.files = e.dataTransfer.files
  return <input ref={ref} type="file" {...props} onDragOver={preventDefault} onDragEnter={preventDefault} onDrop={onDrop} />
})


export const useFileUploader = () => {
  const [progressStates, setUploadStates] = useState({})

  function uploadFile ({file, progressKey, location}) {
    // rename file for standardized storage
    const timestamp = file.lastModified
    const fileType = file.name.split('.').slice(-1)[0]

    // upload to storage and track progress
    setUploadStates(state => ({...state, [progressKey]: 0}))
    const uploadTracker = uploadBytesResumable(ref(cloudStorage, location), file)
    uploadTracker.on('state_changed', 
      snapshot => {
        setUploadStates(state => ({...state, [progressKey]: (snapshot.bytesTransferred / snapshot.totalBytes) * 100}))
      },
      console.error,
      () => {
        setUploadStates(state => ({...state, [progressKey]: undefined}))
      },
    )

    // return file metadata
    return {
      location,
      size: file.size,
      fileType: fileType,
      lastModified: file.lastModified,
      // thumbnail: null,
    }
  }

  return [uploadFile, progressStates]
}


export const useFirebasePopupForm = (form) => {
  // default parameters
  form.deleteIdentifier = form.deleteIdentifier || form.getKey
  form.getValuesForAdd = form.getValuesForAdd || form.getFormValues
  form.getValuesForUpdate = form.getValuesForUpdate || form.getFormValues

  const {firebaseCollection, getKey, fields, keyFields} = form

  // state
  let [editMode, setEditMode] = useState(false)
  let inputRefs = useRef( Object.keys(fields).reduce((refs, key)=>{ refs[key] = null; return refs }, {}) )
  let initialValues = useRef(form.defaults)
  let [showPopup, setShowPopup] = useState(false)

  let closePopup = () => { setShowPopup(false) }
  let openPopup = (state) => {
    if(state.editMode !== undefined) setEditMode(state.editMode);
    if(state.values !== undefined) initialValues.current = state.values;

    setShowPopup(true)
  }

  function submit() {
    const formData = inputRefs.current
    if(editMode) {
      if(form.validUpdate(formData)) {
        console.log('updating', formData)
        const oldValues = initialValues.current
        const _db_key = oldValues._db_key
        console.log(formData, oldValues)
        const values = form.getValuesForUpdate(formData, oldValues)

        updateDoc(doc(db, firebaseCollection, _db_key), values).catch(console.warn)
        closePopup()
      }
    } else {
      if(form.validAdd(formData)) {
        console.log('adding', formData)
        const values = form.getValuesForAdd(formData)
        console.log(values)
        setDoc(doc(db, firebaseCollection, getKey(values)), values).catch(console.warn)
        closePopup()
      }
    }
  }

  function onDelete() {
    // const formData = inputRefs.current
    const oldValues = initialValues.current
    const _db_key = oldValues._db_key
    // const values = form.getValuesForUpdate(formData, initialValues.current)
    if(!window.confirm(`are you sure you want to delete ${form.deleteIdentifier(oldValues)}?`)) return

    form.beforeDelete && form.beforeDelete(inputRefs.current, oldValues)

    deleteDoc(doc(db, firebaseCollection, _db_key)).catch(console.warn)
    closePopup()
  }


  const oldValues = initialValues.current
  let firestoreDoc = oldValues && (`${firebaseCollection}/${oldValues._db_key}`)

  const Popup = props => <Modal show={showPopup} onHide={closePopup} animation={false} backdrop={false} key="popup" >
    <Modal.Body>
      <button className='btn-close' style={{'float':'right'}} onClick={closePopup} />
      <table><tbody>
        {Object.keys(fields).map(key => {
          const [label, input] = fields[key]
          const newProps = { 
            id: key, 
            ref: r=>{inputRefs.current[key] = r}, 
            defaultValue:oldValues ? oldValues[key] : undefined,
            // disabled: editMode && keyFields.includes(key),
          }
          if(typeof input.type !== "string") {
            newProps.firestoreDoc = firestoreDoc
          }

          return <tr key={key}>
            <th>{label}</th>
            <td>{React.cloneElement(input, newProps)}</td>
          </tr>
        })}

      </tbody></table>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={closePopup}>Cancel</Button>
      <Button variant="primary" onClick={submit}>Submit</Button>
      {editMode && <Button variant="danger" onClick={onDelete}>Delete</Button>}
    </Modal.Footer>
  </Modal>

  const AddButton = props => <Button variant="primary" onClick={()=>openPopup({editMode:false})} >{form.buttonText}</Button>
  const EditButton = props => <i className="fas fa-pen edit-hover" onClick={()=>openPopup({editMode:true, values:props.values})} />

  return [Popup, AddButton, EditButton, openPopup]
}
