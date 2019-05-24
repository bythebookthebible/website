import React, { Component } from 'react';
import '../css/Sidebar.css';
// import buy_sermon_on_the_mount from '../images/leftsidebar_BuyMatt5,6,7.png';

export default class QuoteBar extends Component {
    render() {
        return(
        <div className="QuoteBar sidebar row">
			<div className = "text-box bounce-once" >
				“My four year old memorized 53 verses in 3 months! This program is really amazing” - Parent of 4 year old girl
			</div> 
			{/* <div className = "text-box bounce-once" >
				"Let the word of Christ dwell in you richly, teaching and admonishing one another in all wisdom, singing psalms and hymns and spiritual songs”
				- Collosians 3:16
			</div>
			<div className = "text-box bounce-once" >
				"Bind them on your heart always; tie them around your neck. When you walk, they will lead you; when you lie down, they will watch over you; and when you awake, they will talk with you.” Proverbs 6:21
			</div> */}
			<div className = "text-box bounce-once" >
				“Throughout the day our kids randomly start singing chapters of the Bible!”
				-Homeschool parent
			</div>
			{/* <div className = "text-box bounce-once" >
				"There is gold and abundance of costly stones, but the lips of knowledge are a precious jewel.” Proverbs 20:15
			</div> */}
			<div className = "text-box bounce-once" >
				“They always ask if they can watch the videos and then they just keep watching them over and over again and over again.”
			</div>
			{/* <div className = "text-box bounce-once" >
				"So faith comes from hearing, and hearing through the word of Christ.” Romans 10:17
			</div>
			<div className = "text-box bounce-once" >
				"Sanctify them in the truth; your word is truth.” John 17:17
			</div>
			<div className = "text-box bounce-once" >
				"Finally, brothers, whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, if there is any excellence, if there is anything worthy of praise, think about these things.”
				- Philippians 4:8
			</div> */}
		</div>
        )
    }
}
