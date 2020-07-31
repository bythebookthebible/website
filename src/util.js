import deepEqual from 'fast-deep-equal/es6/react'
import { isAssertionExpression } from 'typescript'

export const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalm', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea',
'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
'1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James',
'1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation']

export const kinds = {
  watch:'watch',
  teacherGuide:'teacherGuide',
  speed:'speed',
  schmoment:'schmoment',
  joSchmo:'joSchmo',
  music:'music',
  karaoke:'karaoke',
  discussion:'discussion',
  dance:'dance',
  echo:'echo',
  coloring:'coloring',
  craft:'craft',
  book:'book',
}

export const kidModeKinds = {
  watch:'watch',
  speed:'speed',
  schmoment:'schmoment',
  joSchmo:'joSchmo',
  music:'music',
  karaoke:'karaoke',
  discussion:'discussion',
  dance:'dance',
  echo:'echo',
  coloring:'coloring',
  craft:'craft',
  book:'book',
}

export const resoucesForKinds = {
  watch:['watch'],
  teacherGuide:['teacherGuide'],
  speed:['watch', 'timestamps'],
  schmoment:['schmoment'],
  joSchmo:['joSchmo'],
  music:['music'],
  karaoke:['karaoke'],
  discussion:['discussion'],
  dance:['dance'],
  echo:['watch', 'karaoke', 'timestamps'],
  coloring:['coloring'],
  craft:['craft'],
  book:['popupBook'],
}

export function getKidKinds(moduleResource) {
  return Object.keys(kidModeKinds).filter(
    k=>resoucesForKinds[k].every(r=>moduleResource[r])
  )
}

export function getAllKinds(moduleResource) {
  return Object.keys(kinds).filter(
    k=>resoucesForKinds[k].every(r=>moduleResource[r])
  )
}

// paths not in this list are of the form
// 'Book': r=>(r.book=='Book'),
// or
// 'Book Ch': r=>(r.book=='Book' && r.chapter == parseInt(Ch)),
export const pathFilters = {
  'Armor of God': r=>(r.book=='Ephesians' && r.chapter==6),
  'Sermon on the Mount': r=>(r.book=='Matthew' && 5<=r.chapter && r.chapter<=7),
}

// convert between scripture references and a string key
// used for tracking scripture selected
export const keyFromScripture = (book, chapter, verses) => {
  let [startVerse, endVerse] = verses.split('-')
  return `${String(books.indexOf(book)).padStart(2,'0')}-${String(chapter).padStart(3,'0')}-${String(startVerse).padStart(3,'0')}-${String(endVerse).padStart(3,'0')}`
}

export const scriptureFromKey = key => {
  let r = key.split('-')
  return {book: books[Number(r[0])], chapter: Number(r[1]), verses: `${Number(r[2])}-${Number(r[3])}`}
}

export function friendlyScriptureRef(key) {
  let s = scriptureFromKey(key)
  return `${s.book} ${s.chapter}:${s.verses}`
}

// this is a mathematically correct mod accounting for negative numbers
// mod(n, m) returns i where 0 <= i < m, where n - i is divisible by m
export function mod(n, m) {
  return m >= 0 ? n % m : (n % m) + m
}

export function valueAfter(arr, val, n=1) {
  for(let i in arr) {
    i=Number(i) // apparently i is a string
    if(deepEqual(arr[i], val))
      return arr[(i+n) % arr.length]
  }
  return arr[0]
}

export function toTitleCase(str) {
  return str.trim().replace(/\b[a-z]|['_][a-z]|\B[A-Z]/g, function(x){return x[0]==="'"||x[0]==="_"?x:String.fromCharCode(x.charCodeAt(0)^32)})
}
