import React, { Component } from 'react';
import header from '../images/ourStory/header.png';
import behind_the_scenes from '../images/ourStory/behindTheScenes.jpg';
import why_memorize from '../images/ourStory/whyMemorize.png';

export default class OurStory extends Component {
    render() {
        return (
            <div className="OurStory">
                    <div className="full-img" style={{backgroundImage: "url(" + header + ")"}}><p>Our Story:</p></div>
					<div className="text-box">
                        <p>From the time I was little, my Mom taught me to memorize large portions of scripture. When I was seven years old I had memorized the Sermon on the Mount, and when I was 13 I decided to memorize the book of Philippians and Ruth. I was homeschooled and my Mom was everything to me: spiritual leader, best friend, teacher… I trained to become a professional dancer for 30 hours a week, and after learning my feet were too crooked to continue, redirected those hours to learning the harp. But when I was 15, God showed a different plan for my life. </p>
                        <p>The summer before my Sophomore year in High school, my Mom was diagnosed with stage four brain cancer. After her surgery, the speech part of her brain was damaged and my sister and I re-taught Mom how to walk and talk. But though she couldn’t remember our names or the word for water, she was able to recite verses from the Bible. When her speech picked up a little bit, Mom told us she wanted to memorize Proverbs 31! We were surprised. She was just re-learning how to talk, and she wanted to memorize a chapter of the Bible? But Mom wasn’t one to be dissuaded, so my sister and I waltzed around the house and improvised a melody to the chapter into our Voice Memo app. Then we played the song over and over again with Mom. Within just a few weeks of listening to it she was able to recite the whole thing from memory. We sang it everywhere, on walks, in the car, during doctor’s appointments…etc.</p>
                        <p>Mom’s speech declined again after a second surgery, and Proverbs 31 was one of the last things she was able to say. Then for about a month, she didn’t say a word, and she was unable to move. I came home from final exams my junior year of high school, and that evening my precious Mom went to live with Christ. Throughout the next hard months, the chapters of scripture I had memorized really brought me through those days. Time and time again verses would come to me all throughout my day and keep me focused on Christ. God taught me so much about trusting him through Mom’s death. God was now my teacher, spiritual leader and best friend.</p>
                        <p>Around this time a friend asked us to teach Sunday School for the preschoolers in their small home-church. We accepted, and not knowing anything else to do, decide to teach Bible Memory. Using a similar idea to the one we used with Mom, my sister and I came up with a melody and taught the kids to memorize 53 verses in just over 3 months. The parents loved it and gave CDs of the songs to many of their friends. The parents recommended I turn it into a curriculum to make it more widely available. It was then one of the parents noticed that all my skills would be combined if I did: I have a love of business, harp, ballet, art, teaching and Bible, and this curriculum would tie them all together! After much prayer, By the Book the Bible was born: a curriculum meant not to teach individual verse, but whole chapters and books, in the same manner that my Mom had taught me. I have now graduated high-school and am taking a gap year to start this business. My goal is to empower other children like me to memorize and understand large portions of scripture that can carry with them through the rest of their lives.</p>
					</div>

                    <div className="full-img" style={{backgroundImage: "url(" + behind_the_scenes + ")"}}><p>Behind the Scenes:</p></div>
					<div className="text-box">
                        <p>My goal for By the Book the Bible, is to effectively communicate God’s meaning and purpose with every verse that students memorize. To do this, there is a lot of work that goes into each section! Here’s a bit of what the process looks like behind the scenes. </p>
                        <p>The whole program centers around the Bible. So, the first thing I do is study and pray a lot. I research the historical context, theological implications, and life applications of a verse, and from that try to discover the main emotion God is trying to convey in the segment of verses. Then my sister and I look at the section of verses and compose a melody with that emotion and the word for word scripture.</p>
                        <p>After that, I compose a harp accompaniment, put it into Logic X Pro, and add sound effects, drums etc. Once we have a completed soundtrack, my sister and I come up with a story board that balances entertainment, content, and memorable moments to best communicate God’s message in a catchy, easy-to-memorize way. Then we call over a few loyal friends, set up a sheet in our living room, and film away!</p>
                        <p>With a completed dance video, I move on to lesson videos. I go back to the research I did at first, and try to boil down the complicated topics into the essence of what a young-child needs to know. Then my sister and I come up with a short story that illustrates the point. Once again, we call over our friends and film in the backyard!</p>
                        <p>Lastly, before uploading it to the website, I test out the curriculum on several Homeschool Coop Classes and Sunday Schools where I teach. If a common question comes up or a tune is hard to memorize, I go back and re-do that section.</p>
                        <p>If all goes well, I send it off to my mentors for one last check, post it, and then move onto the next chapter while praying by name for each kid who is working on memorizing it!</p>
					</div>

                    <div className="full-img" style={{backgroundImage: "url(" + why_memorize + ")"}}><p>Why Memorize:</p></div>
					<div className="text-box">
                        God commanded us: <br/>"These commandments that I give you today are to be on your hearts. Impress them on your children. Talk about them when you sit at home and when you walk along the road, when you lie down and when you get up. Tie them as symbols on your hands and bind them on your foreheads. Write them on the doorframes of your houses and on your gates." - Deut 6:6-9
					</div>
            </div>
        );
    }
}
