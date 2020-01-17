import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import {Row, Col} from 'react-bootstrap'

var giftLink = 'https://memorize.bythebookthebible.com/courses/give-as-a-gift'
var buyLink = 'https://memorize.bythebookthebible.com'
var redeemLink = 'https://memorize.bythebookthebible.com/cart/add_product/562899?price_id=641889'

export default class Home extends Component {
    render() {
        return (
            <div className="Home">
                <h1>Memorize a Book<br />of the Bible</h1>
                <Row><Col sm={8}><h2>Our mission is to create a Biblically literate generation by giving families a fun way to memorize books of the Bible.</h2></Col></Row>

                <Row className="Test" className="flex-centered">
                    <Col xs={12} md={{span: "auto", order: 2}}><a href={buyLink} className="big-button">Get&nbsp;Started</a></Col>
                    <Col xs={5} md={{span: "auto", order: 1}}><a href={giftLink} className="button">Give as a Gift</a></Col>
                    <Col xs={5} md={{span: "auto", order: 3}}><a href={redeemLink} className="button">Redeem my Gift</a></Col>
                </Row>

                <Row className="">
                    <Col xs={12} sm={12} lg={{span: 6, order: 2}}><ReactPlayer url="https://vimeo.com/385379882/4f267b11ed" className="video" controls /></Col>
                    <Col xs={10} sm={6} lg={{span: 3, order: 1}}><q>My 4-year-old memorized 53 verse in 3 months!</q><caption> - Peter G (parent of ‘memorzie’)</caption></Col>
                    <Col xs={10} sm={6} lg={{span: 3, order: 3}}><q>I love it so much it makes me want to laugh cry!</q><caption> - Maddie B. (4-year-old ‘memorzie’)</caption></Col>
                </Row>

                <Row className=" pink">
                    <Col xs={12} md={4}>
                        <h2>Releases</h2>
                        <p className="small">Subscription gives you access to all up-to-date By the Book content.</p>
                        <ul className="plain-list">
                            <li>Jan 2020 – sermon on the Mount</li>
                            <li>Mar 2020 – Acts 7</li>
                            <li>May 2020 – Proverbs 31</li>
                            <li>Jul 2020 – 1 Cor 13</li>
                            <li>Sep 2020 – James</li>
                            <li>Nov 2020 – Philippians</li>
                        </ul>
                    </Col>
                    <Col xs={12} md={4}><ReactPlayer url="https://vimeo.com/385380297" className="video" controls /></Col>
                    <Col xs={12} md={4}>
                        <h2>Each chapter includes:</h2>
                        <ul>
                            <li>Music Videos</li>
                            <li>Teacher’s Guides</li>
                            <li>Supplementary Videos</li>
                            <li>Coloring Pages</li>
                        </ul>
                    </Col>
                </Row>

                <div>
                    <Row><Col sm={8}>
                        <h2>Imagine a world...</h2>
                        <p>where you can walk into any Sunday school and ask who has memorized the Gospel of John? A third of the kids raise their hands</p>
                        <p>This is the world By the Book the Bible wants to create.</p>
                    </Col></Row>

                    <Row>
                        <Col xs={12} sm={6} xl={{span: 4, order: 1}}>
                            <h2>Fun</h2>                        
                            <q>They [my kids] enjoy singing along to the videos with so much enthusiasm whenever and wherever they are!</q><caption> - JoAe C (mother of ‘memorzie’)</caption>
                        </Col>
                        <Col xs={12} sm={6} xl={{span: 4, order: 4}}><ReactPlayer url="https://vimeo.com/368945565/f4437500a0" className="video" controls /></Col>
                        <Col xs={12} sm={6} xl={{span: 4, order: 2}}><ReactPlayer url="https://vimeo.com/365858058/a5efa07acc" className="video" controls /></Col>
                        <Col xs={12} sm={6} xl={{span: 4, order: 5}}>
                            <h2>Fast</h2>
                            <q>we could just listen to the songs a few times and then she started to recite it!</q><caption> - Nancy H. (Parent of ‘memorzie’)</caption>
                        </Col>
                        <Col xs={12} sm={6} xl={{span: 4, order: 3}}>
                            <h2>Effective</h2>
                            <q>I always struggled with even memorizing a few verses of the Bible but your catchy tunes and songs have helped me to memorize whole chapters!</q><caption> - Staci G (parent of ‘memorzie’)</caption>
                        </Col>
                        <Col xs={12} sm={6} xl={{span: 4, order: 6}}><ReactPlayer url="https://vimeo.com/385476859/3e4c0fc914" className="video" controls /></Col>
                    </Row>
                </div>
            </div>
        );
    }
}
