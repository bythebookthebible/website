import React, { Component, useState } from "react";
import { Navbar, Nav, NavDropdown, NavItem, Button } from "react-bootstrap";
import { Sidebar, SidebarItem } from 'react-responsive-sidebar';
import "./adultModeApp.css";
import $ from "jquery";
import logo from "../images/logo.svg"
 
export default function MenuContainer(props) {

    let [showSidebar, setShowSidebar] = useState(false)
    let [showNestedSidebar, setShowNestedSidebar] = useState(false)
    let moduleNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    function openMenu() {
        setShowSidebar(true);
    }

    function closeMenu() {
        setShowSidebar(false);
    }

    function nestedSiderbarHandler() {
        setTimeout(setShowNestedSidebar(!showNestedSidebar), 5000)
    }

    let nestedSidebar = <div className="nestedSidebar" style={(showNestedSidebar)? {display: 'block'} : {display: 'none'}}>
            <ul>
    <li><a href="#">1</a></li>
    <li><a href="#">2</a></li>
    <li><a href="#">3</a></li>
    <li><a href="#">4</a></li>
    <li><a href="#">5</a></li>
    <li><a href="#">1</a></li>
    <li><a href="#">2</a></li>
    <li><a href="#">3</a></li>
    <li><a href="#">4</a></li>
    <li><a href="#">5</a></li>
    </ul>
    </div>
    



    let content = <div>
        <div className="sidemenu" style={(showSidebar)? {marginLeft: '0'} : {marginLeft: '-100%'}} >
        <ul>
        <button className="btnn" onClick={() => closeMenu()} ><a href="#">BACK</a></button>
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Genesis</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Numbers</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Leviticus</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Deuteronomy</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Joshua</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Exodus</a></li>{nestedSidebar}

        <li onClick={() => nestedSiderbarHandler()}><a href="#">Numbers</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Deuteronomy</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Joshua</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Numbers</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Deuteronomy</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Joshua</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Numbers</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Deuteronomy</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Joshua</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Numbers</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Deuteronomy</a></li>{nestedSidebar}
        <li onClick={() => nestedSiderbarHandler()}><a href="#">Joshua</a></li>{nestedSidebar}

        </ul>
        </div>

        <div className="main">
        <div>
            <Button onClick={() => openMenu()}>Select Chapters</Button>
        </div>
        <h1>main content</h1>
        </div>
    </div>

    return (
        <div>
            {content}
        </div>
        // <div>
        //     <div className="sidemenu">
        //     <ul>
        //         <li><a href="#">Genesis</a></li>
        //         <li><a href="/">Exodus</a></li>
        //         <li><a href="/">Leviticus</a></li>
        //         <li><a href="/">Numbers</a></li>
        //         <li><a href="/">Deuteronomy</a></li>
        //         <li><a href="/">Joshua</a></li>

        //         <li><a href="/">Numbers</a></li>
        //         <li><a href="/">Deuteronomy</a></li>
        //         <li><a href="/">Joshua</a></li>
        //         <li><a href="/">Numbers</a></li>
        //         <li><a href="/">Deuteronomy</a></li>
        //         <li><a href="/">Joshua</a></li>
        //         <li><a href="/">Numbers</a></li>
        //         <li><a href="/">Deuteronomy</a></li>
        //         <li><a href="/">Joshua</a></li>
        //         <li><a href="/">Numbers</a></li>
        //         <li><a href="/">Deuteronomy</a></li>
        //         <li><a href="/">Joshua</a></li>

        //     </ul>
        //     </div>

        //     <div>
        //         <h1>main content</h1>
        //     </div>
        // </div>
        


    )


}


/*




*/