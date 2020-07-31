import React, { useContext, useState } from "react";
import { ReactSVG } from "react-svg";
import $ from "jquery";
import { Button } from "react-bootstrap";
import { DispatchContext, StateContext } from "./kidModeApp";
import MemorizedPrompt from "./memorizedPrompt"
import memoryPalace from '../images/memoryPalace/PalaceInside.svg'

// @TODO: 1) fix code after actual imagine is used in place
export default function MemoryPalaceView(props) {
    let [showMemoryPrompt, setShowMemoryPrompt] = useState(props.showMemoryPrompt)
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext)
    let defaultHalfMemoryPower = 50.0

    return (
        <div>
            {<MemorizedPrompt show={showMemoryPrompt} onHide={()=>setShowMemoryPrompt(false)} />}
            <div style={{
                backgroundColor:'red', height:'5rem', color:'white', 
                fontSize:'4rem', fontFamily:'Loopiejuice-Regular',
                textAlign:'center', position:'absolute', top:'10rem', right:0, left:0,
            }}>
                Coming Soon
            </div>
            <ReactSVG 
                src={memoryPalace}
                afterInjection={(err, svg) => {
                    // fix the i < 10 later (bc rn we only have 10 rectangles)
                    let MPArray = Object.values(state.memoryPower)
                    for (let i = 0; i < 10; i++) {
                        // this is to set an asymptote at half way mark
                        let percentageFilled = MPArray[i].power / (MPArray[i].power + (props.halfMemoryPower || defaultHalfMemoryPower))
                        let glow = $(svg).find(`#power_${i + 1}_`).css({'transform': 'scaleY(' + percentageFilled + ')'})
                        if(MPArray[i].status == 'memorized' || MPArray[i].status == 'applied') {
                            console.log('jewel', i)
                            $(svg).find(`#rock_${i + 1}_`).css({'display': 'none'})
                        }
                    }
                }}
            />
            <Button className="btn-round" variant="primary" onClick={() => dispatch({type:'newView', view:'map', viewSelected:'home'})}>Back to Map</Button>
        </div>
    )
}