import React, { useState } from 'react';
import $ from 'jquery';
import { ReactSVG } from 'react-svg';
import { Row, Col, Button } from 'react-bootstrap';
import done from '../images/kidsPageSidebar/done.png';
import './colorPalette.css';
import { useDispatch } from 'react-redux';
import { addPower } from '../app/rootReducer';
import { useMemoryResources, useCachedStorage } from "../hooks";
import { resoucesForKinds } from "../util";

export default function ProcessCPMemoryPower(props) {
    let {activity, isActive, onRepeat} = props
    let dispatch = useDispatch()
    
    let resources = useMemoryResources()
    let url = resources && resources[activity.module][resoucesForKinds[activity.kind][0]][0]
    let version = resources && resources[activity.module].version
    let src = useCachedStorage({url, version});
    
    let [fillColors, setFillColors] = useState([])
    let [currentColor, setCurrentColor] = useState('white')
    let [counter, setcounter] = useState(0)
    let [drawn, setDrawn] = useState(false)

    let reset = () => {
        setFillColors([])
    }

    let onSubmit = () => {
        if (drawn) {
            dispatch(addPower({module: activity.module, power: 1}))
            reset()
            setcounter(0)
        }
        isActive(false)
    }

    return (
        <div>
        <div onClick={() => isActive(true)}>
            <Row>
            <Col sm={9} md={9}><ReactSVG 
                src={src} 
                afterInjection={(err, svg)=>{
                   if (counter == 0) {
                        for (let i = 0; i < ($(svg).children()).length; i++) {
                            // console.log($(svg).children()[i])
                            $($(svg).children()[i]).css({fill: 'white'})
                            // $($(svg).children()[i]).click(function() {
                            //     return $($(svg).children()[i]).css({fill: currentColor})
                            // })
                            fillColors.push('white')
                            setFillColors(fillColors)
                        }
                        setcounter(1)
                        setDrawn(false)
                    }

                    
                        for (let i = 0; i < ($(svg).children()).length; i++) {
                            $($(svg).children()[i]).css({fill: fillColors[i]})
                            $($(svg).children()[i]).click(function() {
                                $($(svg).children()[i]).css({fill: currentColor})
                                let newFillColors = fillColors.slice(0)
                                newFillColors[i] = currentColor
                                setFillColors(newFillColors)
                                setDrawn(true)
                            })
                        }
                    
                }
            } /></Col>
            <Col sm={3} md={3}><ColorPalette changeColor={setCurrentColor} currentColor={currentColor} /></Col>
            </Row>
            </div>
            <div className='btnn-submit-container'><Button className="btnn-submit" variant="primary" onClick={()=>onSubmit()} ><i className="far fa-check-circle" aria-hidden="true" />Done</Button></div>
        </div>
    )
}

function ColorPalette(props) {
    let colors = ['#FFFFFF', '#8E53A1', '#6ABD46', '#71CCDC', '#F7ED45', '#F7DAAF', '#EC2527', '#F16824', '#CECCCC', '#5A499E', '#06753D', '#024259', '#FDD209', '#7D4829', '#931B1E', '#B44426', '#979797', '#C296C5', '#54B948', '#3C75BB', '#F7ED45', '#E89D5E', '#F26F68', '#F37123', '#676868', '#9060A8', '#169E49', '#3CBEB7', '#FFCD37', '#E5B07D', '#EF3C46', '#FDBE17', '#4E4D4E', '#6B449B', '#BACD3F', '#1890CA', '#FCD55A', '#D8C077', '#A62E32', '#F16A2D', '#343433', '#583E98', '#BA539F', '#9D2482', '#DD64A5', '#DB778D', '#EC4394', '#E0398C', '#68AF46', '#4455A4', '#FBEE34', '#AD732A', '#D91E36', '#F99B2A']
    return (
        <div className='color-palette'>
            {console.log("color-pal")}
            {colors.map(color => {
                let activeClass = props.currentColor === color ? 'color-swatch-active' : '';
                return (
                    <div onClick={() => {props.changeColor(color)}}>
                        <div className={'color-swatch ${activeClass}'} style={{backgroundColor: color}}></div>
                    </div>    
                )
            })}
        </div>
    )
}