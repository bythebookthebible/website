// import React, { useCallback, useContext } from 'react';
// import { EpubView, EpubViewStyle, ReactReader, ReactReaderStyle } from 'react-reader';

// import testBook from '../epubs/testBook.epub';
// import { DispatchContext, StateContext } from "./kidModeApp";

// export default function PopupBookGenerator(props) {
//     let state = useContext(StateContext)

//     return (
//         <div onClick={()=>props.closeSidebar()} style={{position: 'relative', height: '100vh', width: '100vw', zIndex: '0'}} >
//             <ReactReader 
//                 url={testBook}
//                 showToc={false}
//                 style={{}}
//                 title={state.resources[state.activity.key][state.activity.kind]["title"]}
//                 swipeable={true}
//             />
//             {/* <EpubView
//                 url={testBook}
//             /> */}
//         </div>
//     )
// }

import React, { Component, useState, useEffect, useRef, useContext } from "react";
import { DispatchContext, StateContext } from "./kidModeApp";
import testPDF from '../epubs/testPDF.pdf';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function ProcessPDFMemoryPower(props) {
    let dispatch = useContext(DispatchContext)
    let state = useContext(StateContext)

    let [numPages, setNumPages] = useState(null)
    let [pageNumber, setPageNumber] = useState(1)

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages)
    }

    return (
        <div>
            <Document className='pdf'
                file={testPDF}
                onLoadSuccess={onDocumentLoadSuccess}
            >    
                <Page pageNumber={pageNumber} className='pdf-page' />
            </Document>
            <p>Page {pageNumber} of {numPages}</p>    
        </div>
    );

}