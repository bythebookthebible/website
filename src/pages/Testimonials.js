import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import {Row, Col} from 'react-bootstrap'

export default class Testimonials extends Component {
    render() {
        return (
            <div className="Testimonials container-fluid">
                <Row>
                    <Col xs={12} md={{span: 6, order: 2}}>
                        <ReactPlayer url="https://vimeo.com/365195512/423dc7d469" width="100%" height="auto" controls/>
                        <div className="caption">4 years old. 10 days. 21 verses (Proverbs 31:10-31)</div>

                        <ReactPlayer url="https://vimeo.com/365858473/5f0e4750d1" width="100%" height="auto" controls/>
                        <div className="caption">5 years old. 1 month. 20 verses (Matthew 5:1-20)</div>

                        <ReactPlayer url="https://vimeo.com/365197261/98a213c820" width="100%" height="auto" controls/>
                        <div className="caption">4, 5, 7 year olds. 3 months. 41 verses (Acts 7:1-41)</div>

                        <ReactPlayer url="https://vimeo.com/368945565/f4437500a0" width="100%" height="auto" controls/>
                        <div className="caption">6 years old. 1 week. 21 verses (Proverbs 31:10-31)</div>

                        <ReactPlayer url="https://vimeo.com/365858058/a5efa07acc" width="100%" height="auto" controls/>
                        <div className="caption">8 years old. 1 month. 20 verses (Matthew 5:1-20)</div>

                        <ReactPlayer url="https://vimeo.com/365088784/1ba722f24c" width="100%" height="auto" controls/>
                        <div className="caption">10, 15 years old. 5 days. 21 verses (Proverbs 31:10-31)</div>

                        <ReactPlayer url="https://vimeo.com/365194451/cb2bbb8d60" width="100%" height="auto" controls />
                        <div className="caption">6 years old. 10 days. 21 verses (Proverbs 31:10-31)</div>

                        <ReactPlayer url="https://vimeo.com/365092266/d15d6fd118" width="100%" height="auto" controls/>
                        <div className="caption">10, 11, 15, 15 years old. 5 days. 21 verses (Proverbs 31:10-31)</div>
                    </Col>

                    <Col xs={12} md={{span: 6, order: 1}}>
                        <q> I am in love with Rose's ByTheBook curriculum! Rose and her team have done an excellent job of coming up a curriculum to help children store up and hide God's living Word inside their hearts through such fun and innovative songs, skits, dramas and coloring papers.<br /><br />
                            Not only have they developed a great curriculum to have God's Word stick to the little ones' hearts but her interpretation of the scripture to help the children understand the meaning of what they're memorizing is exceptionally insightful and yet simple, speaking to the heart.<br /><br />
                            My children are living proof to the great work they have done. They enjoy singing along to the videos with so much enthusiasm whenever and wherever they are!  I would highly recommend this curriculum to all those who desire to pass on the heritage of hiding God's Word in the hearts of the little ones.
                        </q>
                        <q>When I listened to the video, I was really skeptical that they would be able to memorize it because that’s a lot of scripture, but I was absolutely surprised at how many verse my kids could memorize… they can memorize that many verses, even though that really is a lot” -parent</q>
                        <q>I’d definitely recommend this curriculum to other parents! It’s amazing having whole chapters of the Bible stored up in their memory and on their hearts. It has been a blessing for me as well too, I always struggled with even memorizing a few verses of the Bible but your catchy tunes and songs have helped me to memorize whole chapters :D Thank you!</q>
                        <q>I memorized all the verses accidentally… I didn’t try at all- I just accidentally memorized it!” -unsuspecting 10-year-old brother</q>
                        <q>I love getting the whole picture, they really can understand the context, it’s the whole picture of the chapter, instead of just a couple isolated verses; they really get the whole message of the section.” -parent</q>
                        <q>My kids are continuing to talk about camp as their favorite camp, rehearse the verses, and talking more about Jesus. They are asking really good questions and praying with more heart. Having my young kids see old kids lead and love Jesus was very impactful.</q>
                        <q>I love hearing the girls sing the memory verses randomly throughout the day, I would even join in with them! Hearing them recite proverbs 31 throughout the week was also convicting and a good reminder to me as well. I was learning as they were singing :)</q>
                        <q>I would recommend this to other parents because it made the Bible practical and the Word of God fun!</q>
                        <q>We’ve searched online for material of people singing the scriptures word for word, and we can’t find anything, or hardly anything. So, we thought this was really cool to have one chapter of scripture they can just memorize so easily… You think about how many songs we memorize that are on the radio or even from the 80’s or the 90’s, these songs that we know every single word to, and how much of that are words that actually mean anything… in fact much of it is just nonsense. So, for us to be able to memorize scripture in just a couple days is pretty cool.” -parent</q>
                        <q>I am really impressed. You guys really made it [the Bible] come alive for her. I would absolutely recommend this curriculum to others.” -parent</q>
                        <q>I would recommend this to any grandparent looking to find a gift for their grandchildren… I just like the concept of using music to memorize, it is marvelous” – grandmother of a ‘memorzie’</q>
                        <q>Having it to song makes it so much easier; we could just listen to the songs a few times and then she started to recite it” -parent</q>
                        <q>It was really well done and [my kids] really enjoyed it” -parent</q>
                        <q>I think the songs are just the key, it really makes it easy to memorize, they are very entertaining, and she enjoyed them. We watch it in the mornings at breakfast, and then in the afternoon, and then in the car rides” -parent </q>
                    </Col>
                </Row>
            </div>
        );
    }
}
