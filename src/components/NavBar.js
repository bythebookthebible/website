import React, { Component } from 'react';
import '../css/NavBar.css';
import main_logo from '../images/top_nav/main_logo.png';
import nav_button_home from '../images/top_nav/menu_buttonhome.png';
import nav_button_faqs from '../images/top_nav/menu_buttonFAQS.png';
import nav_button_about from '../images/top_nav/menu_buttonabout.png';
import nav_button_contact from '../images/top_nav/menu_buttoncontact.png';
import nav_button_curriculum from '../images/top_nav/menu_buttoncurriculum.png';
import nav_girls from '../images/top_nav/menu_roseandcatherine.png';

export default class NavBar extends Component {
    render() {
        return (
            <div className="App-nav">
                <ul className="nav">
                    <li className="nav-item">
                        <img src={main_logo} alt={"Main Logo"} />
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">
                            <img src={nav_button_home} alt={"Home"} />
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">
                            <img src={nav_button_faqs} alt={"FAQs"} />
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">
                            <img src={nav_button_about} alt={"About Us"} />
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">
                            <img src={nav_button_contact} alt={"Contact"} />
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">
                            <img src={nav_button_curriculum} alt={"Curriculum"} />
                        </a>
                    </li>
                    <li className="nav-item">
                        <img src={nav_girls} alt={"Rose & Catherine"} />
                    </li>
                </ul>
            </div>
        )
    }
}