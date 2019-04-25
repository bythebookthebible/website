import React, { Component } from 'react';
import '../css/LeftBar.css';
import buy_sermon_on_the_mount from '../images/leftsidebar_BuyMatt5,6,7.png';
import buy_ephesians from '../images/leftsidebar_buyEphesians.png';

export default class LeftBar extends Component {
    render() {
        return(
            <div className="LeftSideBar">
                <div className="sideBar">
                    <div className="row">
                        <div className="col">
                            <img src={buy_sermon_on_the_mount} alt={"Matthew 5, 6, and 7"} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <p/>
                            <p className="sidebar-text-block">We are currently developing curriculum for Matthew, chapters 5, 6, and 7.
                                If you would like to be notified when we release the Sermon on the Mount package,
                                please email me <a href="mailto:rose@bythebookthebible.com">here.</a><br/>
                            </p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            <img src={buy_ephesians} alt={"Matthew 5, 6, and 7"} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}