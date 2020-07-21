import React, { useState, useEffect } from 'react';
import Sidebar from 'react-sidebar';
import diamond from '../images/kidsPageSidebar/diamond.png';
import { Navbar, Nav, NavDropdown, NavItem, Button, Row, Col } from "react-bootstrap";
import './colorPalette.css'
import back from '../images/kidsPageSidebar/back.png';
import logo from '../images/logo.svg';


export default function SidebarPopUp(props) {
    // let [visible, setVisible] = useState(false)

    // let openSidebar = () => {
    //     setVisible(true)
    // }

    // let closeSidebar = () => {
    //     setVisible(props.show)
    // }

    let content = <div>
        <Row>
        <Col lg={9} xl={9}>
            <div className="sidemenu-kids" style={(props.show)? {marginLeft: '70%'} : {marginLeft: '100%'}}>
                <Button className="btnn" variant="primary" onClick={() => props.setShow()} ><img src={back} style={{height: '30px', width: '30px'}}/>   Close</Button>
                {props.sidebarLayout()}
            </div>
        </Col> 
        </Row>
        <div style={{textAlign: 'left'}}>
            <Button className='btnn-display' onClick={() => props.setShow()}><img src={diamond} style={{height: '50px', width: '60px'}}/>   Click Me   </Button>
        </div>
    </div>

    return (

        <div>
            {content}
        </div>
    //     <Sidebar
    //     sidebar={props.sidebarLayout()}
    //     open={visible}
    //     onSetOpen={() => closeSidebar()}
    //     styles={{ 
    //         sidebar: { padding: '15px', color:'#28B7FF', background: "#28B7FF", width: '30%', height: '100vh', overflow: 'hidden'},
    //         root: {top: '75px', zIndex: '1000000'}
    //  }}
    //     pullRight={true}
    //   >
    //     <button onClick={() => openSidebar()}>
    //       Hello
    //     </button>
    //   </Sidebar>
    )      
}