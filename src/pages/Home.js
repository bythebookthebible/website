import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import {Row, Col} from 'react-bootstrap'

var giftLink = 'https://memorize.bythebookthebible.com/courses/give-as-a-gift'
var buyLink = 'https://memorize.bythebookthebible.com'
var redeemLink = 'https://memorize.bythebookthebible.com/cart/add_product/562899?price_id=641889'

var marketingVideo = 'https://firebasestorage.googleapis.com/v0/b/bythebookthebible.appspot.com/o/public%2Fmarketingvid_16.mp4?alt=media'

export default function Home() {
    return <div className="Home container-fluid">
        <div className="container-xl">
            <div className='display-1'>Memorize a Book<br />of the Bible</div>
            <h2>Our mission is to create a Biblically literate generation by giving families a fun way to memorize books of the Bible.</h2>

            <Row className="flex-centered">
                <Col xs={12} md={{span: "auto", order: 2}}><a href={buyLink} className="display-4 btn btn-round btn-primary">Get&nbsp;Started</a></Col>
                <Col xs={5} md={{span: "auto", order: 1}}><a href={giftLink} className="btn btn-round btn-primary">Give as a Gift</a></Col>
                <Col xs={5} md={{span: "auto", order: 3}}><a href={redeemLink} className="btn btn-round btn-primary">Redeem my Gift</a></Col>
            </Row>

            <Row>
                <Col xs={12} sm={12} lg={{span: 6, order: 2}}><ReactPlayer url={marketingVideo} width="100%" height="auto" controls /></Col>
                <Col xs={10} sm={6} lg={{span: 3, order: 1}}><q>My 4-year-old memorized 53 verse in 3 months!</q><div className="caption"> - Peter G (parent of ‘memorzie’)</div></Col>
                <Col xs={10} sm={6} lg={{span: 3, order: 3}}><q>I love it so much it makes me want to laugh cry!</q><div className="caption"> - Maddie B. (4-year-old ‘memorzie’)</div></Col>
            </Row>
        </div>

        <Row className="pink">
            <Col xs={12} md={4}>
                <h1>Releases</h1>
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
            <Col xs={12} md={4}><ReactPlayer url="https://vimeo.com/385380297" height="100%" width="auto" controls /></Col>
            <Col xs={12} md={4}>
                <h1>Each chapter includes:</h1>
                <ul>
                    <li>Music Videos</li>
                    <li>Teacher’s Guides</li>
                    <li>Supplementary Videos</li>
                    <li>Coloring Pages</li>
                </ul>
            </Col>
        </Row>

        <Row><Col sm={8}>
            <h1>Imagine a world...</h1>
            <p>where you can walk into any Sunday school and ask who has memorized the Gospel of John? A third of the kids raise their hands</p>
            <p>This is the world By the Book the Bible wants to create.</p>
        </Col></Row>

        <Row>
            <Col xs={12} sm={6} xl={{span: 4, order: 1}}>
                <h1>Fun</h1>                        
                <q>They [my kids] enjoy singing along to the videos with so much enthusiasm whenever and wherever they are!</q><div className="caption"> - JoAe C (mother of ‘memorzie’)</div>
            </Col>
            <Col xs={12} sm={6} xl={{span: 4, order: 4}}><ReactPlayer url="https://vimeo.com/368945565/f4437500a0" width="100%" height="auto" controls /></Col>
            <Col xs={12} sm={6} xl={{span: 4, order: 2}}><ReactPlayer url="https://vimeo.com/365858058/a5efa07acc" width="100%" height="auto" controls /></Col>
            <Col xs={12} sm={6} xl={{span: 4, order: 5}}>
                <h1>Fast</h1>
                <q>we could just listen to the songs a few times and then she started to recite it!</q><div className="caption"> - Nancy H. (Parent of ‘memorzie’)</div>
            </Col>
            <Col xs={12} sm={6} xl={{span: 4, order: 3}}>
                <h1>Effective</h1>
                <q>I always struggled with even memorizing a few verses of the Bible but your catchy tunes and songs have helped me to memorize whole chapters!</q><div className="caption"> - Staci G (parent of ‘memorzie’)</div>
            </Col>
            <Col xs={12} sm={6} xl={{span: 4, order: 6}}><ReactPlayer url="https://vimeo.com/385476859/3e4c0fc914" width="100%" height="auto" controls /></Col>
        </Row>
    </div>
}
