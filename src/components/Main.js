import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import '../css/Main.css';
import logo_animated from "../images/frontanimation_600px.gif";
import under_construction from "../images/webconstructionsite.png";
import blessed_video from "../images/blessed_dance800px2G.mp4";

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
                <ReactPlayer url={blessed_video} playing />
            </div>
        );
    }
}
