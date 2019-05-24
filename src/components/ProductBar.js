import React, { Component } from 'react';
import '../css/Sidebar.css';
import matt567 from '../images/product/Matt567.svg';
import ephesians from '../images/product/ephesians.svg';
import Proverbs31 from '../images/product/Prov31.svg';

export default class ProductBar extends Component {
    render() {
        return ( 
		<div className = "ProductBar sidebar row" >
			<div className="text-box" >
				We are currently developing curriculum for Matthew, chapters 5, 6, and 7. If you would like to be notified when we release the Sermon on the Mount package, please email me <a href = "mailto:rose@bythebookthebible.com"> here </a>.<br/ >
			</div>
			<a href="#Contact"><img className="bounce" src={ matt567 } alt={ "Matthew 5, 6, and 7" }/></a >
			<a href="#Contact"><img className="bounce" src={ ephesians } alt={ "Ephesians" }/></a >
			<a href="#Contact"><img className="bounce" src={ Proverbs31 } alt={ "Proberbs 31" }/></a >
		</div>
        )
    }
}