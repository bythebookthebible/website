import React, { Component } from 'react';
import '../css/Slogans.css';
import memorize from '../images/Memorize.svg';
import live_our_lives from '../images/Live our Lives.svg';
import energized from '../images/energized.svg';

export default class Slogans extends Component {
    render() {
        return (
			<div className="Slogans">
				<div className="blue">
					<img src={memorize} alt="Memorize By the Book" />
					<p>
						We <b>memorize</b> not the sentence or the fragment of the verse, but <b>By the Book!</b> What Book? The Bible!
					</p>
				</div>
				<div className="yellow">
					<img src={live_our_lives} alt="Live Our Lives By the Book" />
					<p>
						We <y>Live our lives</y> not this world and our sinful desires, but <y>By the Book!</y> What Book? The Bible!
					</p>
				</div>
				<div className="pink">
					<img src={energized} alt="Energised By the Book" />
					<p>
						We’re <em>energized</em> not by empty fun or lazy entertainment, but <em>By the Book!</em> What book? The Bible!
					</p>
				</div>
			</div>
        )
    }
}
