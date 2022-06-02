import React, { useEffect } from "react";
import $ from "jquery";
import { ReactComponent as MemoryPalace } from './images/PalaceInside.svg'
import { scriptureFromKey, kinds, keyFromScripture } from "../util";
import { useDispatch, useSelector } from "react-redux";
import { useMemoryResources } from "../common/hooks";
import { defaultAspectRatio } from './SVGButtons'
import { nextInPalace, activateJewel } from "./playfulReducer";
import { useParams, useHistory } from "react-router-dom";

let halfFullPower = 100.0
let aspectRatio = defaultAspectRatio

export default function MemoryPalaceView(props) {
  let dispatch = useDispatch()
  let resources = useMemoryResources()
  let history = useHistory()
  let { viewSelected } = useParams()
  let power = useSelector(state => state.firebase.profile.power || {})

  let [book, chapter] = viewSelected.split('-')

  let modules = Object.keys(resources).filter(key=>{
    let s = scriptureFromKey(key)
    return s.book == book && s.chapter == chapter
  }).map(key => {
    let p = power[key]
    p = p || {power:0, status: 'learning'}
    // fill has a horizontal asymptote of 1 and is 1/2 when p.power is halfFullPower
    return {fill: p.power / (p.power + halfFullPower), status:p.status, key:key}
  }, {})
  let key = keyFromScripture(book, chapter)
  let chapterStatus = power[key] ? power[key].status : 'learning'

  console.log('palace', book, chapter, modules, chapterStatus)

  useEffect(() => {
    // i < 11 bc rn we only have 11 rectangles
    for (let i = 0; i < 11; i++) {
      if(i < modules.length) {
        // fill up power
        let m = $(`#module_${i + 1}`)
          .removeClass('hide memorized memorized-pending applied applied-pending')
          .addClass(modules[i].status)

        m.find('.rock, .jewel')
        .click(() => {
          dispatch(activateJewel(modules[i].key))
        })

        m.find('.pedistal')
        .click(() => {
          history.push(`/activity/${kinds.watch}/${modules[i].key}`)
        })

        m.find('.power').css({
          opacity: 0,
          transformBox: "fill-box",
          transformOrigin: "50% 88%",
          transform: 'scaleY(' + modules[i].fill + ')',
        })
      } else {
        $(`#module_${i + 1}`).addClass('hide')
      }
    }
    $('#BackgroundJewel').removeClass('learning memorized memorized-pending applied applied-pending')
    $('#BackgroundJewel').addClass(chapterStatus)
    // refresh styling later for transform-origin bug
    setTimeout(()=>{
      for (let i = 0; i < 11; i++) {
        if(i < modules.length) {
          $(`.power`).css({opacity:1})
        }
      }
    }, 1)
  }, [`${book}-${chapter}`, modules])

  return <>
    <svg className='memoryPalace' style={{position:'absolute', width:'100%', height:'100%', ...props.style}} viewBox={`0 0 ${aspectRatio} 1`}>
      <MemoryPalace x={0} y={0} width={aspectRatio} height={1} style={{overflow:'hidden'}} />
    </svg>

    <div style={{
      fontSize:'5vw', fontFamily:'Loopiejuice-Regular', color:'white', textShadow:'0 0 5px #0008',
      textAlign:'center', position:'absolute', top:'70%', right:0, left:0, pointerEvents: "none",
    }}>{`${book} ${chapter}`}</div>

    <i className="fas fa-4x fa-chevron-left" style={{
        color:'white', textShadow:'0 0 5px #0008', position:'absolute', top:'70%', left:0, cursor: "pointer",
      }} onClick={() => history.push(`/palace/${nextInPalace(resources, viewSelected, -1)}`)} />
    <i className="fas fa-4x fa-chevron-right" style={{
        color:'white', textShadow:'0 0 5px #0008', position:'absolute', top:'70%', right:0, cursor: "pointer",
      }} onClick={() => history.push(`/palace/${nextInPalace(resources, viewSelected, 1)}`)} />
  </>
}