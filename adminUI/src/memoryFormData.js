import React from 'react'

import { books, keyFromScripture, scriptureFromKey, friendlyScriptureRef, fileExtensionFromPath } from 'bythebook-shared/dist/util'
import { firebase, memoryModulesDB, memoryResourcesDB, memorySeriesDB } from 'bythebook-shared/dist/firebase';
import { getStorage, ref, deleteObject } from "firebase/storage"
import { DynamicFileFormElement } from './firebaseForm';

const cloudStorage = getStorage(firebase)

export const validFormats = {video:'mp4', pdf:'pdf', music:'mp3', svg:'svg', generated:'generated'}
export const validTranslations = ['ESV', 'LSB', 'NIV']
export const memoryStorageFolder = 'resources'

export const getVideoForm = ({resources, modules, seriesList, uploadFile}) => {
  const form = {
    firebaseCollection: memoryResourcesDB,
    getFileLocation: (values) => {
      const {file, module, series} = values
      const videoKey = form.getKey({module, series, creator: 'bythebook', lastModified: file.lastModified})
      const fileType = fileExtensionFromPath(file.name)
      const s = scriptureFromKey(module)
      return `${memoryStorageFolder}/${s.book}/${String(s.chapter).padStart(3, '0')}/${videoKey}.${fileType}`
    },
    validAdd: (formData) => {
      const file = formData.file.getFiles()[0]
      console.log(file)
      const fileType = file.name.split('.').slice(-1)[0]
      const correctFileType = validFormats[seriesList[formData.series.value].format]
      const sizeWarning = `This file is very large (${file.size / 1024 / 1024} MB). Are you sure you want to upload?`
      const fileTypeWarning = `This file is a ${fileType}, but should be a ${correctFileType}. Please re-export this file.`

      if(file.size > 200 * 1024 * 1024 && !window.confirm(sizeWarning)) { return false }
      if(fileType !== correctFileType) { window.alert(fileTypeWarning); return false }
      return formData.series.value && formData.module.value
    },
    validUpdate: (formData) => {
      const files = formData.file.getFiles()
      if(files.length > 0) {
        const file = files[0]
        const fileType = file.name.split('.').slice(-1)[0]
        const correctFileType = validFormats[seriesList[formData.series.value].format]
        const sizeWarning = `This file is very large (${Math.ceil(file.size / 1024 / 1024)} MB). Are you sure you want to upload?`
        const fileTypeWarning = `This file is a ${fileType}, but should be a ${correctFileType}. Please re-export this file.`

        if(file.size > 200 * 1024 * 1024 && !window.confirm(sizeWarning)) { return false }
        if(fileType !== correctFileType) { window.alert(fileTypeWarning); return false }
      }
      return formData.series.value && formData.module.value
    },
    getKey: (values) => `${values.module}-${values.creator}-${values.series}-${values.lastModified}`,
    deleteIdentifier: (values) => `${values.module}-${values.series} file`,

    getValuesForAdd: (formData) => {
      let {file, module, series, ...values} = Object.keys(formData).reduce((f, k) => {f[k] = formData[k].value; return f}, {})
      file = formData.file.getFiles()?.[0]
      const idData = {module, series, creator: 'bythebook', lastModified: file.lastModified}
      const progressKey = `${module}-${series}`
      const location = form.getFileLocation({file, module, series})
      const fileData = formData.file.submitFile({progressKey, location})

      // {thumbLocation:, timestamps: [], memoryScore:,}
      return { ...values, ...fileData, location, ...idData, }
    },
    getValuesForUpdate: (formData, oldValues) => {
      let {file, module, series, ...values} = Object.keys(formData).reduce((f, k) => {f[k] = formData[k].value; return f}, {})

      values = {...values, module, series, creator: 'bythebook'}

      const timestamps = formData.file?.getTimestamps()
      if(timestamps) values.timestamps = timestamps

      const files = formData.file.getFiles()
      if(files.length > 0) {
        // parse file metadata
        file = files[0]
        const progressKey = `${module}-${series}`
        const location = form.getFileLocation({file, module, series})

        console.log(`Uploading to ${location} to replace ${oldValues.location}`)
        const fileData = formData.file.submitFile({progressKey, location})

        if(oldValues.location !== location) // remove old file, if we didnt overwrite it
          deleteObject(ref(cloudStorage, oldValues.location)).catch(console.warn)

        values = {...values, ...fileData, location}
      }

      return values
    },

    beforeDelete: (formData, oldValues) => {
      // remove old file from storage
      formData.file.submitDelete()
    },

    buttonText: 'Add Video',
    keyFields: ["module", "series"],
    fields: {
      module: ["Module:", <select>{Object.keys(modules).map(x => <option key={x} value={x}>{friendlyScriptureRef(x)}</option>)}</select>],
      series: ["Series:", 
        <select>{Object.keys(seriesList)
          .filter(k => seriesList[k].format !== 'generated')
          .map(x => <option key={x} value={x}>{x}</option>)
        }</select>
      ],
      title: ["Title:", <input type='text' pattern={'[A-Za-z ]+'} size={20} />],
      translation: ["Translation:", <select>{validTranslations.map((x) => <option key={x} value={x}>{x}</option>)}</select>],
      description: ["Description:", <textarea type='text' pattern={'[A-Za-z ]+'} rows={3} cols={20} />],
      file: ["File:", <DynamicFileFormElement docKey="location" timestampKey="timestamps" />],
    }
  }
  return form
}

export const getSeriesForm = ({seriesList}) => ({
  firebaseCollection: memorySeriesDB,
  getFormValues: (formData) => Object.keys(formData)
    .reduce((f, k) => {f[k] = formData[k].value; return f}, {}),
  validAdd: (formData) => formData.name.value && !(formData.name.value in seriesList),
  validUpdate: (formData) => !!formData.name.value,
  getKey: (values) => values.name,
  buttonText: 'Add Series',
  keyFields: ["name"],
  fields: {
    name: ["Name:", <input type='text' placeholder='name' pattern={'[A-Za-z ]+'} size={20} />],
    format: [
      "Format:", 
      <select>
        {Object.keys(validFormats).map(x => <option key={x} value={x}>{x}</option>)}
      </select>,
    ],
    description: ["Description:", <textarea type='text' pattern={'[A-Za-z ]+'} rows={3} cols={20} />],
    generatorFormat: ["Generator Format:", <textarea type='text' rows={3} cols={20} />],
  }
})

export const getModuleForm = ({modules}) => {
  const form = {
    firebaseCollection: memoryModulesDB,
    getFormValues: (formData) => {
      let { book, title, chapterVerse } = Object.keys(formData).reduce((f, k) => {f[k] = formData[k].value; return f}, {})
      let [chapter, verses] = chapterVerse.split(':')
      let [startVerse, endVerse] = verses.split('-')

      return {
        book: book,
        chapter: Number(chapter),
        startVerse: Number(startVerse),
        endVerse: Number(endVerse),
        title: title,
      }
    },
    validAdd: (formData) => {
      const key = form.getKey(form.getFormValues(formData));
      return key && !(key in modules)
    },
    validUpdate: (formData) => {
      const values = form.getFormValues(formData)
      return values.book && values.chapter && values.startVerse && values.endVerse
    },
    getKey: (values) => keyFromScripture(values.book, values.chapter, `${values.startVerse}-${values.endVerse}`),
    deleteIdentifier: (values) => `${values.book} ${values.chapter}:${values.startVerse}-${values.endVerse}?`,
    buttonText: 'Add Module',
    keyFields: ["book","chapterVerse"],
    fields: {
      book: ["Book:", <select>{books.map((x) => <option key={x} value={x}>{x}</option>)}</select>],
      chapterVerse: ["Verse:", <input type='text' pattern={'\\d+:\\d+-\\d+'} size={10} defaultValue='1:1-10' />],
      title: ["Title:", <input type='text' pattern={'[A-Za-z ]+'} size={10} placeholder='Title' />],
      // intro: ["Intro:", <input type='file' />],
      // animation: ["Animation:", <input type='file' />],
    }
  }
  return form
}