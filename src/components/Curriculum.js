import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import Slogans from '../components/Slogans'

import our_strategy from '../images/curriculum/ourStrategy.png';
import energized from '../images/curriculum/energized.png';
import live_our_lives from '../images/curriculum/liveOurLives.png';
import memorize from '../images/curriculum/memorize.png';
import boy_crafting from '../images/curriculum/boyCrafting.png';
import cartoon_mountain from '../images/curriculum/cartoonMountain.png';

export default class Curriculum extends Component {
    render() {
        return (
            <div className="Curriculum">
                <div className="full-img" style={{backgroundImage: "url(" + our_strategy + ")"}}><div>Our Strategy:</div></div>
                <Slogans /><br/>
                <div className="text-box">
                    I believe there are three essential aspects that need to be fulfilled to have a successful Bible memory program. Colossians encapsulates them all very well when it says, “Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom, singing psalms , hymns and spiritual songs.” First of all, it is very important that the kids effectively can actually recall and retain huge portions of scripture in long-term memory. This is the first pillar of our program, <em>“We memorize by the Book.”</em> However, rote memory is completely useless unless they know what the verses mean and how to apply it to their lives. This is our second pillar, <em>“We live our lives by the Book.”</em> Thirdly, if kids don’t have a positive internal motivation to memorize, the process will be ineffective and boring. This is our third pillar, <em>“We’re energized by the Book”</em> In light of our three essential pillars, we provide different services to conquer each of those areas.
                </div>

                <div className="full-img" style={{backgroundImage: "url(" + memorize + ")"}}><div>Memorize by the Book:<br/>"I know it!"</div></div>
                <ReactPlayer url="https://vimeo.com/358934723/ce17ef22aa" className="asside small-video" preload />
                <div className="text-box">
                    <h3>Dance Videos:</h3>
                    There are tons of little kids that can recite the lyrics to “Let it Go” or “Three Little Monkeys,” so similarly, we use tunes as the main source of memory. Every 3-10 verses we provide a video that shows a dance (for visual and kinesthetic learners) and a song (for auditory learners). When kids watch, sing, dance, and listen to this video throughout the week, it gets stuck in their head and they accidentally memorize it! 
                </div>

                <img src={cartoon_mountain} alt={"Coloring Page"} className="asside" />
                <div className="text-box">
                    <h3>Coloring Pages:</h3>
                    To learn the material even more, we have coloring pages so the kids can illustrate each verse we memorize. These will be combined into one binder.
                </div>

                <div className="full-img" style={{backgroundImage: "url(" + live_our_lives + ")"}}><div>Live Our Lives by the Book:<br/>"I understand it!"</div></div>
                <ReactPlayer url="https://vimeo.com/359427145/2078c17372" className="asside small-video" preload />
                <div className="text-box">
                    <h3>Lesson Videos:</h3>
                    There will be short videos that explain one aspect of the verse in more depth and shows (using a story) how to apply it to the kid’s own lives. 
                </div>
                
                <div className="text-box">
                    <h3>Teacher Guide:</h3>
                    The most effective way that kids can learn what a verse means is one-on- one conversation. Discussion questions encourage conversations between parents and kids – encouraging them to think critically and ask questions. 
                </div>

                <div className="full-img" style={{backgroundImage: "url(" + energized + ")"}}><div>Energized by the Book:<br/>"It's fun!"</div></div>
                <img src={boy_crafting} alt={"Coloring Page"} className="asside" />
                <div className="text-box">
                    <h3>Crafts:</h3>
                    Often times a coloring page will become part of a craft. we have topical crafts combined into the coloring page book.
                </div>

                <div className="text-box">
                    <h3>Games:</h3>
                    Our curriculum provides memory review games as well as games that help illustrate a point.
                </div>

                <div className="text-box">
                    <h3>Memory Jewels:</h3>
                    Kids love external motivations, so we provide external motivation in the form of memory jewels. Every time your child Memorizes a video, he/she will earn a jewel with the verse reference on it. They will collect these jewels in a special box that will eventually be full of treasure, symbolizing the eternal treasure hidden in their hearts! “There is gold and abundance of costly stones, but the lips of knowledge are a precious jewel.”
                </div>
            </div>
        );
    }
}
