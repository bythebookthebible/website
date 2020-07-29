import React, { useState, useContext } from "react";
import { DispatchContext, StateContext } from "./kidModeApp";
import KeyboardEventHandler from 'react-keyboard-event-handler';
import KeyHandler, { KEYPRESS } from 'react-key-handler';
import { Document, Page, pdfjs } from "react-pdf";
import { Row, Col, Container } from 'react-bootstrap';
import { SizeMe } from 'react-sizeme';
import right from '../images/kidsPageSidebar/right.png';
import left from '../images/kidsPageSidebar/left.png';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PopupBookWithMemoryPower(props) {
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext)

    let [numPages, setNumPages] = useState(null)
    let [pageNumber, setPageNumber] = useState(1)
    let [completed, setCompleted] = useState(false)

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages)
        props.isActive(true)
    }

    let goToPrevView = () => {
        if (pageNumber - 2 > 0) {
            setPageNumber(pageNumber - 2)
        }
    }

    let goToNextView = () => {
        console.log(pageNumber, 'of', numPages, completed)
        if (pageNumber + 2 <= numPages) {
            setPageNumber(pageNumber + 2)
        }
        if (pageNumber + 3 >= numPages) { // second page of new spread is the end
            if (!completed) {
                dispatch({type:'addMemoryPower', power: 1})
                setCompleted(true)
            }
            props.isActive(false)
        }
    }

    let keyHandler = (key) => {
        if (key == 'left' ) {
            goToPrevView()
        } else if (key == 'right') {
            goToNextView()
        }
    }
 
    return (
        <div>  
            <SizeMe
                monitorHeight
                refreshRate={32}
                refreshMode={"debounce"}
                render={({ size }) => (
                    <Container>
                    <Document
                        file={props.src}
                        onLoadSuccess={onDocumentLoadSuccess}
                    >
                        <Row>
                        <Col xs={6}><Page width={size.width / 2} pageNumber={pageNumber} error={''} onClick={()=>goToPrevView()} /></Col>
                        <Col xs={6}><Page width={size.width / 2} pageNumber={pageNumber + 1} error={''} onClick={()=>goToNextView()} /></Col>
                        </Row>
                    </Document>
                    </Container>
                )}
            />
            <div className='pdf-page-display'>
                <button className='pdf-btn' onClick={()=>goToPrevView()}><img src={right} style={{height: '30px', width: '30px'}}/></button>
                Page {pageNumber} of {numPages}
                <button className='pdf-btn' onClick={()=>goToNextView()}><img src={left} style={{height: '30px', width: '30px'}}/></button>
            </div>    
            <KeyboardEventHandler handleKeys={['all']} onKeyEvent={(key) => keyHandler(key)} />
            <KeyHandler
                keyEventName={KEYPRESS}
                keyValue={'ArrowLeft'}
                onKeyHandle={()=>goToPrevView()}
            />    
            <KeyHandler
                keyEventName={KEYPRESS}
                keyValue='End'
                onKeyHandle={()=>goToNextView()}
            />    
        </div>
    );

}