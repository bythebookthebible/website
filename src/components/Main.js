import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import '../css/Main.css';
import logo_animated from "../images/frontanimation_600px.gif";
import under_construction from "../images/webconstructionsite_v2.png";

export default class Main extends Component {
    render() {
        return (
            <div className="Main-body">
                <br />
                <img src={logo_animated} alt={"Animated Front Logo"} />
                <br />
                <br />
                <img src={under_construction} alt={"Site Presently Under Construction"} />
                <br />
                <br />
                <ReactPlayer url="http://vimeo.com/332012395/8418951f9e" preload />
            </div>
        );
    }
}
