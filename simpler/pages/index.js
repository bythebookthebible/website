import './index.scss'
import { loadFirebase } from '../sharedUI/firebase';
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import { scriptureFromKey, keyFromScripture, clamp, toHHMMSS, valueAfter } from '../sharedUtil/dataUtil'
import { defineAllDefaultTemplates, syncAttributeProperty, attachTemplateToShadow, toggleFullscreen, isFullScreen, fullScreenEnabled } from '../sharedUtil/uiUtil'

const cloudStorage = getStorage()
import '../sharedUI/sharedWidgets'
import '../sharedUI/loginWidgets'

var firebaseState // keep this as a global state


document.body.onload = function(e) {
  const root = document.getElementById("root")

  let page = "loading" // "loading" | "login" | "searching" | "playing"
  let query = Object.fromEntries(new URL(window.location).searchParams) // {module: "", series: ""}

  function firebaseUpdate(newState, oldState) {
    let oldPage = page
    let newPage = page

    // TODO handle offline case

    // change app page as things are loaded into firebase
    let mustLoad = ['user', 'profile', 'memoryResources', 'memoryModules', 'memorySeries',] // 'online', 'token',
    let loaded = mustLoad.map(i => {return {[i]: newState.loaded.includes(i)}})

    if(!mustLoad.every(i => newState.loaded.includes(i))) {
      newPage = "loading"

    } else if(!newState.current.user) {
      newPage = "login"

    } else if(query?.module) {
      newPage = "video"

    } else {
      newPage = "searching"
    }

    // innerText = newPage

    // swap pages
    if(newPage !== oldPage) {
      const pages = {
        loading: 'loading-page',
        login: 'login-page',
        video: 'video-page',
        searching: 'search-page',
      }

      let element = document.createElement(pages[newPage])
      root.replaceChildren(element)

      if(newPage == "video") { queryUpdate() }
    }
  }

  function queryUpdate() {

  }

  root.replaceChildren(document.createElement("loading-page"))
  firebaseState = loadFirebase({
    onUpdate: (newState, oldState)=>firebaseUpdate(newState, oldState)
  })
}



window.customElements.define('search-page', class extends HTMLElement {
  connectedCallback() {
    attachTemplateToShadow(this, 'search-page')

    const el = this.elements = {
      submit: this.shadowRoot.getElementById("submitArrow"),
      search: this.shadowRoot.querySelector('scripture-search'),
    }

    el.submit.onclick = e => {
      const value = this.elements.search.value
      window.location.search = "?module=" + value
    }
  }
})



window.customElements.define('scripture-search', class extends HTMLElement {
  // static observedAttributes = ["value"]

  // get & set this.value with the DOM elements as the master
  #value = ''
  get value() { return this.#value }

  set value(newValue) {
    const oldRef = scriptureFromKey(this.#value)
    const newRef = scriptureFromKey(newValue)

    // update book selector
    this.elements.book.value = newRef.book


    // update chapter selector
    if(!oldRef || oldRef.book !== newRef.book) {
      // refresh chapter options
      this.elements.chapter.innerHTML = Object.keys(this.activeModules[newRef.book]).reduce((html, chapter, index) => {
        return html + `<option value="${chapter}">${chapter}</option>`
      }, "")
    }
    this.elements.chapter.value = newRef.chapter


    // update verses selector
    if(!oldRef || oldRef.chapter !== newRef.chapter || oldRef.book !== newRef.book) {
      // refresh chapter options
      this.elements.verses.innerHTML = Object.keys(this.activeModules[newRef.book][newRef.chapter]).reduce((html, verses, index) => {
        return html + `<option value="${verses}">${verses}</option>`
      }, "")
    }
    this.elements.verses.value = newRef.verses

    this.#value = newValue
  }


  connectedCallback() {
    attachTemplateToShadow(this, 'scripture-search')

    let { memoryModules, memoryResources } = firebaseState.current

    const activeModules = this.activeModules = Object.values(memoryResources).reduce((books, {module}, index) => {
      if(!memoryModules.hasOwnProperty(module)) {
        console.error(`Resources for missing module "${module}" - this is an inconsistency in the database`)
        return books
      }

      const moduleInfo = memoryModules[module]

      let {book, chapter} = moduleInfo
      let verses = `${moduleInfo.startVerse}-${moduleInfo.endVerse}`

      books[book] ??= {}
      books[book][chapter] ??= {}
      books[book][chapter][verses] ??= module

      return books
    }, {})

    const el = this.elements = {
      book: this.shadowRoot.getElementById('book'),
      chapter: this.shadowRoot.getElementById('chapter'),
      verses: this.shadowRoot.getElementById('verses'),
    }


    // initialize
    el.book.innerHTML = Object.keys(activeModules).reduce((html, book, index) => {
      return html + `<option value="${book}">${book}</option>`
    }, "")

    const defaultValue = this.getAttribute('defaultValue') 
      ?? Object.values(Object.values(activeModules['James'])[0])[0]

    this.value = defaultValue

    // handlers
    el.book.onchange = e => {
      if(el.book.value !== scriptureFromKey(this.value).book) {
        this.value = Object.values(Object.values(activeModules[el.book.value])[0])[0]
      }
    }

    el.chapter.onchange = e => {
      if(el.chapter.value !== scriptureFromKey(this.value).chapter) {
        this.value = Object.values(activeModules[el.book.value][el.chapter.value])[0]
      }
    }

    el.verses.onchange = e => {
      if(el.verses.value !== scriptureFromKey(this.value).verses) {
        this.value = activeModules[el.book.value][el.chapter.value][el.verses.value]
      }
    }
  }

})



window.customElements.define('video-page', class extends HTMLElement {
  static observedAttributes = [ ]

  connectedCallback() {
    syncAttributeProperty(this, 'message')
    attachTemplateToShadow(this, 'video-page')

    const el = this.elements = {
      search: this.shadowRoot.querySelector('scripture-search'),
      video: this.shadowRoot.querySelector('custom-video'),
    }

    // search bar handler
    const query = Object.fromEntries(new URL(window.location).searchParams) // {module: "", series: ""}
    el.search.value = query.module
    el.search.onblur = e => {
      const value = this.elements.search.value
      let url = new URL(window.location)
      url.searchParams.set('module', value)
      window.location = url.href
    }

    // get things for the video
    let { memoryModules, memorySeries, memoryResources } = firebaseState.current

    // reorder memorySeries
    let { Schmideo, Music, ...other } = memorySeries
    memorySeries = { Schmideo, Music, ...other }

    let relevantResources = Object.values(memoryResources).filter(val => val.module == query.module)

    // sort relevantResources in order of memorySeries
    relevantResources = Object.keys(memorySeries)
      .map(series => relevantResources.find(x => x.series == series))
      .filter(x => x != undefined)
    console.log({relevantResources, memoryModules, memorySeries})


    let resource = relevantResources[0]
    getDownloadURL(ref(cloudStorage, resource.location))
      .then(url => el.video.src = url)
  }

  attributeChangedCallback(name, oldValue, newValue) {
  }
})


/**
 * Natural controlls (Play, pause, seeek, progress bar, download for offline, download base file, download derrivatives?, )
 * Special controlls (Simple loops, Dragon loops, auto, chapter-long loops)
 * Actual looping etc happens in web worker through MediaSource API https://developer.mozilla.org/en-US/docs/Web/API/MediaSource
 */
const newRepetitions = 10
const reviewRepetitions = 2


window.customElements.define('custom-video', class extends HTMLElement {

  static observedAttributes = ['src', 'timestamps', 'loopmode']
  attributeChangedCallback(name, oldValue, newValue) {
    console.log({el: "custom-video", name, oldValue, newValue})

    if(name === 'src' && oldValue != newValue) {
      this.elements.video.src = newValue
    }

    if(name === 'loopmode' && oldValue != newValue) {
      // initialize loop state
      if(this.loopmode === 'auto') {
        this.loopState = {offset:0, length:1, repeats: newRepetitions}

      // } else if(this.loopmode === 'loop') {
      //   this.loopState = {}

      // } else if(this.loopmode === 'continue') {
      //   this.loopState = {}

      } else {
        this.loopState = {}
      }
    }
  }

  connectedCallback() {
    syncAttributeProperty(this, 'src')  
    syncAttributeProperty(this, 'timestamps')  
    syncAttributeProperty(this, 'loopmode')  
    attachTemplateToShadow(this, 'custom-video')

    const el = this.elements = {
      root: this.shadowRoot.querySelector('#root'),
      overlay: this.shadowRoot.querySelector('#overlay'),
      video: this.shadowRoot.querySelector('video'),

      progressRoot: this.shadowRoot.querySelector('#progressRoot'),
      progressTimestamp: this.shadowRoot.querySelector('#progressRoot .timestamp'),
      progressBackground: this.shadowRoot.querySelector('#progressRoot .background'),
      progressKnob: this.shadowRoot.querySelector('#progressRoot .knob'),
      progressPreloaded: this.shadowRoot.querySelector('#progressRoot .preloaded'),
      progress: this.shadowRoot.querySelector('#progressRoot .progress'),

      play: this.shadowRoot.querySelector('#play'),

      settings: this.shadowRoot.querySelector('#settings'),
      download: this.shadowRoot.querySelector('#download'),
      speed: this.shadowRoot.querySelector('#speed'),
      repeat: this.shadowRoot.querySelector('#repeat'),
      fullscreen: this.shadowRoot.querySelector('#fullscreen'),
    }

    // EVENT HANDLERS

    // hide / show overlay
    let overlayTimeout = undefined

    el.overlay.onmousemove = e => {
      if(el.overlay.style.opacity == '0') {
        // if opacity hidden, make visible
        clearTimeout(overlayTimeout)
        el.overlay.style.opacity = '1'
      } else if (!el.video.paused) {
        // if opacity visible & playing, set timeout to hide after 1 sec
        clearTimeout(overlayTimeout)
        overlayTimeout = setTimeout(() => {
          el.overlay.style.opacity = '0'
        }, 700)
      }
    }

    // play / pause
    el.play.onclick = e => {
      // unless on a specific control, toggle play
      clearTimeout(overlayTimeout)
      if(el.video.paused) {
        el.video.play()
        el.play.classList.replace('fa-play', 'fa-pause')
        overlayTimeout = setTimeout(() => {
          el.overlay.style.opacity = '0'
        }, 300)
      } else { 
        el.video.pause()
        el.play.classList.replace('fa-pause', 'fa-play')
        el.overlay.style.opacity = '1'
      }
    }


    // seek
    function handleMouseSeek(e) {
      // if valid, seek in the video
      if(el.video.duration) {
        let boundingBox = el.progressBackground.getBoundingClientRect()
        let fraction = clamp((e.x - boundingBox.x) / boundingBox.width, 0, 1)
        let time = el.video.duration * fraction

        el.progress.style.width = `${fraction * 100}%`
        el.progressTimestamp.textContent = `${toHHMMSS(time)} / ${toHHMMSS(el.video.duration)}`
        el.video.currentTime = time
      }
      return false // disables accidentally selection timestamp text
    }

    el.progressRoot.onmouseup = handleMouseSeek
    el.progressRoot.onmousedown = handleMouseSeek
    el.progressRoot.ontouchend = handleMouseSeek
    el.progressRoot.ontouchmove = handleMouseSeek
    el.progressRoot.onmousemove = e => {
      if(e.buttons === 1) handleMouseSeek(e)
    }

    el.video.on('loadedmetadata', e => el.progressTimestamp.textContent = `${toHHMMSS(el.video.currentTime)} / ${toHHMMSS(el.video.duration)}`)
    el.video.on('timeupdate', e => el.progressTimestamp.textContent = `${toHHMMSS(el.video.currentTime)} / ${toHHMMSS(el.video.duration)}`)

    // fullscreen
    if(fullScreenEnabled()) {
      el.fullscreen.onclick =  () => { toggleFullscreen(this) }

      document.onfullscreenchange = e => {
        let fullscreen = isFullScreen()
        el.fullscreen.classList.remove(`fa-${!fullscreen ? "minimize" : "maximize"}`)
        el.fullscreen.classList.add(`fa-${fullscreen ? "minimize" : "maximize"}`)
      }

    } else {
      el.fullscreen.style.display = "none"
    }

    // settings

    // speed

    // download

    // repeat
    let loopOptions = {
      auto: 'fa-shuffle',
      loop: 'fa-repeat',
      continue: 'fa-arrows-turn-to-dots',
    }

    el.repeat.onclick = e => {
      let oldMode = this.loopmode
      let newMode = valueAfter(Object.keys(loopOptions), this.loopmode) || 'auto'

      el.repeat.classList.replace(loopOptions[oldMode], loopOptions[newMode])
      this.loopmode = newMode
    }

    function nextState({offset, length, repeats}) {
      // first innermost repeats
      repeats--
      if(repeats > 0)
        return {offset, length, repeats}

      // Done with the full cycle? start at the beginning again.
      if(length >= segmentCount) {
        // TODO: send ending event?
        // loop back to beginning
        return {offset:0, length:1, repeats: newRepetitions}
      }

      // if this interval is not aligned in the next size block, and the next block exists
      // then start new material (smallest interval immediately after current one)
      if( (offset + length) % (2 * length) != 0  &&  offset+length < segmentCount) {
        return {offset: offset+length, length: 1, repeats: newRepetitions}
      }

      // if we are aligned, and we still have room in this module
      // then review (double interval size, end time fixed)
      if(2*length < segmentCount) {
        return {offset: offset-length, length:2*length, repeats: reviewRepetitions}
      }

      // we are ready to review the whole module (interval expands to cover everything)
      return {offset: 0, length: segmentCount, repeats: reviewRepetitions}
    }

    el.video.on('timeupdate', e => {
      
    })

    if(!this.loopmode) this.loopmode = 'auto'

  }
})



defineAllDefaultTemplates()
