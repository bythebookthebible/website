import React, { useState, useContext } from 'react';
import $ from 'jquery';
import { ReactSVG } from 'react-svg';
import ColorPalette from "./colorPalette";
import { Row, Col, Button } from 'react-bootstrap';
import { DispatchContext, StateContext } from "./kidModeApp";
import done from '../images/kidsPageSidebar/done.png';

export default function ProcessCPMemoryPower(props) {
    let dispatch = useContext(DispatchContext)
    let [fillColors, setFillColors] = useState([])
    let [currentColor, setCurrentColor] = useState('white')
    let [counter, setcounter] = useState(0)
    let [drawn, setDrawn] = useState(false)

    let reset = () => {
        setFillColors([])
    }

    let onSubmit = () => {
        if (drawn) {
            dispatch({type: 'addMemoryPower', power: 1})
            reset()
            setcounter(0)
            props.isActive(false)
        }
    }

    return (
        <div>
        <div onClick={() => props.isActive(true)}>
            <Row>
            <Col sm={9} md={9}><ReactSVG 
                src={props.src} 
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
            <div className='btnn-submit-container'><Button className="btnn-submit" variant="primary" onClick={()=>onSubmit()} ><img src={done} style={{height: '30px', width: '30px'}} />   Done</Button></div>
        </div>
    )
}