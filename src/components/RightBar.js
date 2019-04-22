import React, { Component } from 'react';
import '../css/RightBar.css';
// import buy_sermon_on_the_mount from '../images/leftsidebar_BuyMatt5,6,7.png';

export default class RightBar extends Component {
    render() {
        return(
            <div className="RightSideBar">
                <div className="container">
                    <div className="row">
                        <div className="sideBar">
                            <p>Missing Image!</p>
                            {/*<img src={buy_sermon_on_the_mount} alt={"Matthew 5, 6, and 7"} />*/}
                        </div>
                    </div>
                    <div className="row">
                        <div className="sidebar">

                        </div>
                    </div>
                    <div className="row">
                        <div className="sideBar">

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}