import React, { useContext, useState } from "react";
import { ReactSVG } from "react-svg";
import $ from "jquery";
import { Button } from "react-bootstrap";
import MemorizedPrompt from "./memorizedPrompt"
import { ReactComponent as memoryPalace } from './images/PalaceInside.svg'
import { scriptureFromKey, kinds, keyFromScripture } from "../util";
import { useDispatch, useSelector } from "react-redux";
import { useMemoryResources } from "../common/hooks";
import SVGBButtons from './SVGButtons'
import { nextInPalace, activateJewel, newView, playfulViews } from "./playfulReducer";
import { useFirebase } from "react-redux-firebase";

let halfFullPower = 100.0
// @TODO: 1) fix code after actual imagine is used in place
export default function MemoryPalaceView(props) {
    let dispatch = useDispatch()
    let resources = useMemoryResources()
    let viewSelected = useSelector(state => state.playful.viewSelected)
    let power = useSelector(state => state.firebase.profile.power || {})
    // let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)

    let book = viewSelected.book
    let chapter = viewSelected.chapter

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

    return <>
        {/* {<MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />}             */}
        <SVGBButtons svg={memoryPalace} deps={[`${book}-${chapter}`]} className='memoryPalace' extra={()=>{
            // i < 11 bc rn we only have 11 rectangles
            for (let i = 0; i < 11; i++) {
                if(i < modules.length) {
                    // fill up power
                    let m = $(`#module_${i + 1}`)
                        .removeClass('hide memorized memorized-pending applied applied-pending')
                        .addClass(modules[i].status)
                    m.find('.rock, .jewel').click(() => {
                        dispatch(activateJewel(modules[i].key))
                    })
                    m.find('.pedistal').click(() => {
                        dispatch(newView({view: playfulViews.activity, viewSelected: {module:modules[i].key, kind: kinds.watch}}))
                    })
                    m.find('.power').css({
                        opacity: 0,
                        transform: 'scaleY(' + modules[i].fill + ')',
                    })
                } else {
                    $(`#module_${i + 1}`).addClass('hide')
                }
            }
            $('.backgroundJewel').removeClass('learning memorized memorized-pending applied applied-pending')
            $('.backgroundJewel').addClass(chapterStatus)
            // refresh styling later for transform-origin bug
            setTimeout(()=>{
                for (let i = 0; i < 11; i++) {
                    if(i < modules.length) {
                        $(`.power`).css({opacity:1})
                    }
                }
            }, 0)
        }} />
        <div style={{
            fontSize:'5vw', fontFamily:'Loopiejuice-Regular', color:'white', textShadow:'0 0 5px #0008',
            textAlign:'center', position:'absolute', top:'70%', right:0, left:0,
        }}>{`${book} ${chapter}`}</div>

        <i className="fas fa-4x fa-chevron-left" style={{
                color:'white', textShadow:'0 0 5px #0008', position:'absolute', top:'70%', left:0,
            }} onClick={() => dispatch(nextInPalace(-1))} />
        <i className="fas fa-4x fa-chevron-right" style={{
                color:'white', textShadow:'0 0 5px #0008', position:'absolute', top:'70%', right:0,
            }} onClick={() => dispatch(nextInPalace())} />
    </>
}