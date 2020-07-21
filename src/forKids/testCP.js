import React, { useState } from 'react';
import $ from 'jquery';
import { ReactSVG } from 'react-svg';
import test_cp from '../images/coloringPages/test_cp.svg';
import ColorPalette from "./colorPalette";
import { Row, Col } from 'react-bootstrap';

export default function TestCP(props) {
    // let [currentColor, setCurrentColor] = useState('white')
    // let fillColors = []
    // let indexArr = []
    // let [fillColors, setFillColors] = useState([])
    // let [indexArr, setIndexArr]= useState([])
    // let fillColors = props.fillColors
    // let setFillColors = props.setFillColors
    // let indexArr= props.indexArr
    // let setIndexArr = props.setIndexArr
    let [fillColors, setFillColors] = useState([])
    // let [indexArr, setIndexArr]= useState([])
    // let [reset, setReset] = useState(false)
    // let [drawn, setDrawn] = useState(false)
    let [currentColor, setCurrentColor] = useState('white')
    let [counter, setcounter] = useState(0)
    let [drawn, setDrawn] = useState(false)
    let [reset, setReset] = useState(false)
    // console.log('TestCP called')


    // let updateFillColors = () => {
    //     // let newArr = fillColors.slice(0)
    //     fillColors.push(currentColor)
    //     setFillColors(fillColors)
    //     console.log("fillColors:", fillColors)
    // }

    // let updateIndexArr = (val) => {
    //     indexArr.push(val)
    //     setIndexArr(indexArr)
    //     console.log("indexArr:", indexArr)
    // }

    // let color = (val) => {

    //     updateIndexArr(val)
    //     updateFillColors()
    //     // console.log("etarget:", val)
    //     // console.log("indexArr:", props.indexArr)
    //     // console.log('currentColor:', props.fillColors)
    // }
    // afterInjection={(svg) => {
    //     if (props.reset) {
    //         $(svg).css({fill: 'white'})
    //     }
    //     let classList = [];
    //     for (let i = 0; i < 100; i++) {
    //         classList.push('cls-' + i)
    //     }
    //     for (let i = 0; i < 100; i++) {
    //         $(svg).click( function(e) {
    //             $(e.target).css({fill: props.currentColor})
    //             props.onDraw()
    //         }) 
    //     }
    // }}

    let onSubmit = () => {
        if (drawn) {
            dispatch({type: 'addMemoryPower', power: 1})
            setReset(true)
            props.onOpen()
        }
    }



    return (
        <div>
            <Row>
            <Col sm={9} md={9}><ReactSVG 
                key='fixedstring'
                src={props.src} 
                afterInjection={(err, svg)=>{
                   if (counter == 0 || reset) {
                        for (let i = 0; i < ($(svg).children()).length; i++) {
                            console.log($(svg).children()[i])
                            $($(svg).children()[i]).css({fill: 'white'})
                            // $($(svg).children()[i]).click(function() {
                            //     return $($(svg).children()[i]).css({fill: currentColor})
                            // })
                            fillColors.push('white')
                            setFillColors(fillColors)
                        }
                        setcounter(1)
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
            <div className='btnn-submit-container'><Button className="btnn-submit" variant="primary" onClick={} ><img src={done} style={{height: '30px', width: '30px'}} />   Done</Button></div>
        </div>
    )
}



            // {/* <ReactSVG 
            //     src={test_cp} 
            //     // afterInjection={(svg) => {
            //     //     if (props.reset) {
            //     //         $(svg).css({fill: 'white'})
            //     //     }
            //     //     let classList = [];
            //     //     for (let i = 0; i < 100; i++) {
            //     //         classList.push('cls-' + i)
            //     //     }
            //     //     for (let i = 0; i < 100; i++) {
            //     //         $(svg).click( function(e) {
            //     //             $(e.target).css({fill: props.currentColor})
            //     //             props.onDraw()
            //     //         }) 
            //     //     }
            //     // }}
            // />    */}
            // {/* {$(svg).click( function(e) {
            //                 $(e.target).css({fill: props.currentColor})
            //                 props.onDraw()
            //             }) } */}

                            // beforeInjection={(svg)=> {
                //     for (let i = 0; i < props.index.length; i++) {

                //     }
                // }}

                                    // console.log("svg.childen", $(svg).children())
                    // for (let i = 0; i < indexArr.length; i++) {
                    //     for (let j = 0; j < ($(svg).children()).length; j++) {
                    //         if (i == 0 && j == 66) {
                    //             console.log(indexArr[i], $(svg).children()[j])
                    //         }
                    //         if (('' + $(svg).children()[j]) == indexArr[i]) {
                    //             $($(svg).children()[j]).css({fill: currentColor})
                    //         }
                    //     }
                    // }

                    // console.log($(svg).children()[66])
                    // // console.log(
                    // // $($(svg).children()[66]).css({fill: 'red'})
                    // console.log($(svg).children()[66])
                    

                    // console.log("realpath", $(svg).children()[66])
                    // for (let i = 0; i < indexArr.length; i++) {
                    //     // console.log(props.indexArr[i])
                    //     ($(svg).children()).css({fill: fillColors[i]})
                    //     $(indexArr[i]).css({fill: fillColors[i]})
                    //     console.log("inside",indexArr[i])
                        
                    // }
                    // $(svg).on('click', function(e) {
                    //     let val = e.target
                    //     updateIndexArr(e.target)

                    //     console.log(e.target)
                    //     $(e.target).css({fill: currentColor})
                    //     console.log('aftere.targetcsss call', e.target)
                    //     updateFillColors()
                        
                        // color(e.target)

                    

                    // setIndexArr($(svg).find())
                    // console.log(indexArr)