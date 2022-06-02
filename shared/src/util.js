import deepEqual from 'fast-deep-equal/es6/react'
import { useEffect, useMemo, useRef, useState } from 'react'

export const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea',
'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
'1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
'1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']

export const keyFromScripture = (book, chapter, verses) => {
  if(chapter) {
    if(verses) {
      // all exist
      let [startVerse, endVerse] = verses.split('-')
      return `${String(books.indexOf(book)).padStart(2,'0')}-${String(chapter).padStart(3,'0')}-${String(startVerse).padStart(3,'0')}-${String(endVerse).padStart(3,'0')}`
    }
    // book, chap, no verses
    return `${String(books.indexOf(book)).padStart(2,'0')}-${String(chapter).padStart(3,'0')}`
  }
  // only book
  return `${String(books.indexOf(book)).padStart(2,'0')}`
}

export const scriptureFromKey = key => {
  let r = key.split('-')
  if(r.length == 4) {
    return {book: books[Number(r[0])], chapter: Number(r[1]), verses: `${Number(r[2])}-${Number(r[3])}`}
  }
  if(r.length == 2) {
    return {book: books[Number(r[0])], chapter: Number(r[1])}
  }
  if(r.length == 1) {
    return {book: books[Number(r[0])]}
  }
}

export function friendlyScriptureRef(key) {
  let s = scriptureFromKey(key)
  let ref = s.book
  if(s.chapter) ref += ' ' + s.chapter
  if(s.verses) ref += ':' + s.verses
  return ref
}

// this is a mathematically correct mod accounting for negative numbers
// mod(n, m) returns i where 0 <= i < m, where n - i is divisible by m
export function mod(n, m) {
  let tmp = n % m
  return tmp >= 0 ? tmp : tmp + m
}

export function valueAfter(arr, val, n=1, returnIndex=false) {
  let isVal = a=>deepEqual(a, val)
  if(!val instanceof Function) isVal = val

  for(let i in arr) {
    i=Number(i) // apparently i is a string
    if(isVal(arr[i])) {
      i = mod((i+n), arr.length)
      if(returnIndex) return i
      return arr[i]
    }
  }
  return arr[0]
}

export function valuesAfter(arr, val, N, wrap=true) {
  N = Math.min(N, arr.length)
  if(!val) return arr.slice(0, N)
  const i = valueAfter(arr, val, 1, true)
  if(!wrap || i+N < arr.length) return arr.slice(i, i + N)
  else return [...arr.slice(i, i + N), ...arr.slice(0, i + N - arr.length)]
}

export function findClosest(list, value) {
  const len = list.length
  // short circuit simplest cases
  if(len == 0) return undefined
  if(len == 1) return list[0]

  // find index where value is in interval [i, i-1]
  list.sort((a,b)=>a-b)
  let i = 0
  while(i < len && list[i] < value) i++

  // return the correct one of i, (i-1)
  if(i == len) return list[i-1]
  if(list[i] - value > value - list[i-1]) return list[i-1]
  return list[i]
}

export function toTitleCase(str) {
  return str.trim().replace(/\b[a-z]|['_][a-z]|\B[A-Z]/g, function(x){return x[0]==="'"||x[0]==="_"?x:String.fromCharCode(x.charCodeAt(0)^32)})
}

export function toHHMMSS(sec) {
  let min, hour
  [hour, min, sec] = [Math.floor(sec/3600), Math.floor(sec/60)%60, sec%60]

  if(hour) return `${hour}:${min.padStart(2, '0')}:${sec.toFixed(0).padStart(2, '0')}`
  return `${min}:${sec.toFixed(0).padStart(2, '0')}`
}

export function fileExtensionFromUrl(url) {
  return (new URL(url)).pathname.split('.').slice(-1)[0]
}

export function fileExtensionFromPath(path) {
  return path.split('.').slice(-1)[0]
}

// as seen in https://non-traditional.dev/how-to-use-the-forwarded-ref-in-react-1fb108f4e6af
export const useForwardedRef = (ref) => {
  const innerRef = useRef(null);

  useEffect(() => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(innerRef.current);
    } else {
      ref.current = innerRef.current;
    }
  });

  return innerRef;
};

export const objectMap = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).map(
      ([k, v], i) => fn(k, v, i)
    )
  )

export const objectFilter = (obj, fn) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([k, v]) => fn(k, v)
    )
  )

export const interpolate = (x,y,t) => x - x*t + y*t

export const useRefListener = (ref, event, callback, deps=[], options=false) => {
  useEffect(() => {
    const cur = ref.current
    if(cur) {
      cur.addEventListener(event, callback)
      return () => cur.removeEventListener(event, callback, options)
    }
  }, [ref, ...deps])
}

export const useKeydownListener = (ref, callback, deps=[], options=false) => {
  useEffect(() => {
    const cur = ref.current
    if(cur) {
      cur.tabIndex = 0 // keydown wont work if you cant focus on the element
      cur.addEventListener('keydown', callback, options)
      return () => cur.removeEventListener('keydown', callback)
    }
  }, [ref, ...deps])
}

export const fullScreenEnabled = () => (!!(
  document.fullscreenEnabled ||
  document.mozFullScreenEnabled || 
  document.msFullscreenEnabled || 
  document.webkitSupportsFullscreen || 
  document.webkitFullscreenEnabled || 
  document.webkitSupportsPresentationMode
))

export const toggleFullscreen = function(node) {
   if (isFullScreen()) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
      else if (document.webkitSetPresentationMode) document.webkitSetPresentationMode("inline");
      return false;
   }
   else {
      if (node.requestFullscreen) node.requestFullscreen();
      else if (node.mozRequestFullScreen) node.mozRequestFullScreen();
      else if (node.webkitRequestFullScreen) node.webkitRequestFullScreen();
      else if (node.msRequestFullscreen) node.msRequestFullscreen();
      else if (node.webkitSetPresentationMode) node.webkitSetPresentationMode("fullscreen");
      return true
   }
}

const isFullScreen = function() {
   return !!(document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
}

export function ArrayAll(arr, fn= x=>x) {
  return arr.reduce((prev, cur) => prev && fn(cur), true)
}