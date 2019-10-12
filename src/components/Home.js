import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import Slogans from '../components/Slogans'
import logo_animated from "../images/home/frontanimation.gif";
import header from '../images/home/header.png';

var buyLink = 'https://memorize.bythebookthebible.com'

export default class Home extends Component {
    render() {
        return (
             <div className="Home">
                <div className="full-img" style={{backgroundImage: "url(" + header + ")"}}><p className="right">"My 4-year old memorized<br/>50 verses in 3 months!"</p></div>

                <a href={buyLink} className="button bounce-once">Accidentally Memorize Matthew 5 Now!</a>
                <img src={logo_animated} alt={"Animated Front Logo"} className="wide-video" />
                <Slogans />

                <div className="text-box">
                    <p><em>Five-year-olds</em> in Jesus’ day <em>memorized</em> Leviticus; <b>Americans memorize</b> hundreds of song lyrics; many <y>Muslims memorize</y> the whole Quran; so if we believe in the inspiration of scripture, Let’s memorize it!</p>
                    <p><b>That’s what I did</b> - I’m a kid-loving, ballerina, harpist, and artist who has started putting the Bible to catchy tunes in order to ground the next generation in a Biblical worldview. I am excited to see how the Holy Spirit will use these words of God as a sword to fight for the hearts and minds of children.</p>
                </div>
            </div>
        );
    }
}
