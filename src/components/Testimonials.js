import React, { Component } from 'react';
import ReactPlayer from 'react-player'

export default class Testimonials extends Component {
    render() {
        return (
            <div className="Testimonials">
                <div className="two-cols">
                    <div>
                        <p className="text-box">“We’ve searched online for material of people singing the scriptures word for word, and we can’t find anything, or hardly anything. So, we thought this was really cool to have one chapter of scripture they can just memorize so easily… You think about how many songs we memorize that are on the radio or even from the 80’s or the 90’s, these songs that we know every single word to, and how much of that are words that actually mean anything… in fact much of it is just nonsense. So, for us to be able to memorize scripture in just a couple days is pretty cool.” -parent</p>
                        <p className="text-box">“I memorized all the verses accidentally… I didn’t try at all- I just accidentally memorized it!” -unsuspecting 10-year-old brother</p>
                        <p className="text-box">“When I listened to the video, I was really skeptical that they would be able to memorize it because that’s a lot of scripture, but I was absolutely surprised at how many verse my kids could memorize… they can memorize that many verses, even though that really is a lot” -parent</p>
                        <p className="text-box">“I am really impressed. You guys really made it [the Bible] come alive for her. I would absolutely recommend this curriculum to others.” -parent</p>
                        <p className="text-box">“I love getting the whole picture, they really can understand the context, it’s the whole picture of the chapter, instead of just a couple isolated verses; they really get the whole message of the section.” -parent</p>
                        <p className="text-box">“I would recommend this to any grandparent looking to find a gift for their grandchildren… I just like the concept of using music to memorize, it is marvelous” – grandmother of a ‘memorzie’</p>
                        <p className="text-box">“Having it to song makes it so much easier; we could just listen to the songs a few times and then she started to recite it” -parent</p>
                        <p className="text-box">“It was really well done and [my kids] really enjoyed it” -parent</p>
                        <p className="text-box">“I think the songs are just the key, it really makes it easy to memorize, they are very entertaining, and she enjoyed them. We watch it in the mornings at breakfast, and then in the afternoon, and then in the car rides” -parent </p>
                    </div>

                    <div>
                        <ReactPlayer url="https://vimeo.com/365194451/cb2bbb8d60" className="small-video" controls />
                        <p className="text-box">This 6 year old is reciting Proverbs 31:10-31. She worked on it for 10 days.</p>

                        <ReactPlayer url="https://vimeo.com/365092266/d15d6fd118" className="small-video" controls/>
                        <p className="text-box">These 10, 11, 15 and 15 year olds were volunteering at a by the Book summer camp and accidentally memorized Proverbs 31:10-31. They have been listening to it for 5 days.</p>
                        {/* <p className="text-box">These 4, 5, and 7 year olds are reciting Acts 7:1-41. They have been working for about three months.</p> */}
                        
                        <ReactPlayer url="https://vimeo.com/365195512/423dc7d469" className="small-video" controls/>
                        <p className="text-box">This 4 year old is reciting Proverbs 31:10-31. She worked on it for 10 days.</p>

                        {/* <p className="text-box">These 4-6 year olds are reciting Proverbs 31:10-31. They've been working on it for five days.</p> */}
                        <ReactPlayer url="https://vimeo.com/365088784/1ba722f24c" className="small-video" controls/>
                        <p className="text-box">These 10 and 15 year olds were volunteering at a by the Book summer camp and accidentally memorized Proverbs 31:10-31. They have been listening to it for 5 days.</p>
                    </div>
                </div>
            </div>
        );
    }
}
