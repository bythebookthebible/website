import React, { useContext, useState } from "react";
import { ReactSVG } from "react-svg";
import $ from "jquery";
import { Button } from "react-bootstrap";
import MemorizedPrompt from "./memorizedPrompt"
import memoryPalace from '../images/memoryPalace/PalaceInside.svg'
import { scriptureFromKey } from "../util";
import { useDispatch, useSelector } from "react-redux";
import { useMemoryResources } from "../common/hooks";
import { nextInPalace, playfulViews, newView } from "./playfulReducer";

let halfFullPower = 50.0
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

    console.log('palace', book, chapter, modules)

    return (
        <div>
            {/* {<MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />}             */}
            <ReactSVG 
                src={memoryPalace}
                afterInjection={(err, svg) => {
                    // i < 10 bc rn we only have 10 rectangles
                    for (let i = 0; i < 10; i++) {
                        if(i < modules.length) {
                            // fill up power
                            $(svg).find(`#power_${i + 1}_`).css({opacity:0, transform: 'scaleY(' + modules[i].fill + ')'})
                            // crack jewel
                            if(modules[i].status == 'memorized' || modules[i].status == 'applied') {
                                $(svg).find(`#rock_${i + 1}_`).css({'display': 'none'})
                            }
                        } else {
                            $(svg).find(`#module${i + 1}`).css({'display': 'none'})
                        }
                    }
                    // refresh styling later for safari transform-origin bug
                    setTimeout(()=>{
                        for (let i = 0; i < 10; i++) {
                            if(i < modules.length) {
                                $(svg).find(`#power_${i + 1}_`).css({opacity:1})
                            }
                        }
                    }, 0)
                }}
            />
            <div style={{
                fontSize:'5vw', fontFamily:'Loopiejuice-Regular', textShadow:'0 0 10px white',
                textAlign:'center', position:'absolute', top:'60vw', right:0, left:0,
            }}>{`${book} ${chapter}`}</div>

            <i className="fa fa-4x fa-chevron-left" style={{
                    color:'white', position:'absolute', top:'60vw', left:0,
                }} onClick={() => dispatch(nextInPalace(-1))} />
            <i className="fa fa-4x fa-chevron-right" style={{
                    color:'white', position:'absolute', top:'60vw', right:0,
                }} onClick={() => dispatch(nextInPalace())} />

            <Button className="btn-round" variant="primary" onClick={() => dispatch(newView({view:playfulViews.default}))}>Back to Map</Button>
        </div>
    )
}