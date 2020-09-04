import React, { useState } from "react";
import KeyboardEventHandler from 'react-keyboard-event-handler';
import KeyHandler, { KEYPRESS } from 'react-key-handler';
import { Document, Page, pdfjs } from "react-pdf";
import { Row, Col, Container } from 'react-bootstrap';
import { SizeMe } from 'react-sizeme';
import right from '../images/kidsPageSidebar/right.png';
import left from '../images/kidsPageSidebar/left.png';
import { useDispatch } from 'react-redux';
import { addPower } from '../app/rootReducer';
import { useMemoryResources, useCachedStorage } from "../hooks";
import { resoucesForKinds } from "../util";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PopupBookWithMemoryPower(props) {
    let {activity, isActive, onRepeat} = props
    let dispatch = useDispatch()
    
    let resources = useMemoryResources()
    let url = resources && resources[activity.module][resoucesForKinds[activity.kind][0]][0]
    let version = resources && resources[activity.module].version
    let src = useCachedStorage({url, version});
    
    let [numPages, setNumPages] = useState(null)
    let [pageNumber, setPageNumber] = useState(1)
    let [completed, setCompleted] = useState(false)

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages)
        isActive(true)
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
                dispatch(addPower({module: activity.module, power: 1}))
                setCompleted(true)
            }
            isActive(false)
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
                        file={src}
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