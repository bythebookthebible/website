import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import Slogans from '../components/Slogans'

import header from '../images/curriculum/boyThinking.png';
import curriculum from '../images/curriculum/girlColoring.png';
import boy_crafting from '../images/curriculum/boyCrafting.png';
import cartoon_mountain from '../images/curriculum/cartoonMountain.png';

export default class Curriculum extends Component {
    render() {
        return (
            <div className="Curriculum">
                <div className="full-img" style={{backgroundImage: "url(" + header + ")"}}><div>Our Strategy:</div></div>
                <q>“Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom, singing psalms , hymns and spiritual songs.”</q>
                <Slogans /><br/>

                <div className="two-cols">
                    <div className="text-box">
                        <em className="check">Teacher’s Guide:</em>
                            <ul>
                                <li>A pdf summarizing an easy 5 step guide to optimize our curriculum’s effectiveness in helping kids accidentally memorize books and chapters of the Bible. </li>
                                <li>Includes Discussion Questions, games ideas, and other memory activities to reinforce memory.  </li>
                            </ul>
                        <em className="check">Music Video:</em>
                            <ul>
                                <li>A 1 minute video containing 2-9 verses of scripture in a catchy tune and dance that motivates kids to watch it over and over again</li>
                                <li>Having this playing in the background of your life is really how kids can memorize so quickly </li>
                            </ul>
                        <em className="check">Supporting Videos:</em>
                            <ul>
                                <li>These are iterations on the Music Video that help further reinforce memory and conceptualize the concepts God is communicating in a child friendly way. </li>
                                <li>Includes a 10 minute Echo video where small portions of the Music Video are repeated over and over again to further the memory process, a Words Video where we go through the dance video and explain the confusing words, and a fun karaoke video to sing with to help review. </li>
                            </ul>
                        <em className="check">Coloring Pages</em>
                            <ul>
                                <li>Coloring pages illustrating the concepts that God is communicating through his word</li>
                            </ul>
                    </div>
                    <div>
                        <ReactPlayer url="https://vimeo.com/358934723/ce17ef22aa" className="asside small-video" preload />
                        <ReactPlayer url="https://vimeo.com/359427145/2078c17372" className="asside small-video" preload />
                        <img src={cartoon_mountain} alt={"Coloring Page"} className="asside" />
                        <img src={boy_crafting} alt={"Coloring Page"} className="asside" />
                    </div>
                </div>
            </div>
        );
    }
}
