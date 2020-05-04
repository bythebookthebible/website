import React, { Component } from 'react';
import {Row} from 'react-bootstrap'
import memorize from '../images/Memorize.svg';
import live_our_lives from '../images/Live our Lives.svg';
import energized from '../images/energized.svg';

export default class Slogans extends Component {
    render() {
        return (
			<Row className="Slogans">
				<div className="blue">
					<img src={memorize} alt="Memorize By the Book" />
					<p>
						We <em>memorize</em> not the sentence or the fragment of the verse, but <em>By the Book!</em> What Book? The Bible!
					</p>
				</div>
				<div className="yellow">
					<img src={live_our_lives} alt="Live Our Lives By the Book" />
					<p>
						We <em>Live our lives</em> not this world and our sinful desires, but <em>By the Book!</em> What Book? The Bible!
					</p>
				</div>
				<div className="pink">
					<img src={energized} alt="Energised By the Book" />
					<p>
						We’re <em>energized</em> not by empty fun or lazy entertainment, but <em>By the Book!</em> What book? The Bible!
					</p>
				</div>
			</Row>
        )
    }
}
