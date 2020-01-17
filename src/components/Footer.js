import React, { Component } from 'react';
import logo from '../images/logo.svg';

var email = 'rose@bythebookthebible.com'
var address = '15600 NE 8th Street Ste B1 #428 Bellevue, Wa 98008'
var facebook = 'bythebookthebible'

export default class Footer extends Component {
    render() {
        return (
        <div className="Footer">
            <div>Facebook: <a href={"https://www.facebook.com/" + facebook}>{facebook}</a></div>
            <div>Email: <a href={"mailto:" + email}>{email}</a></div>
            <div>Address: {address}</div>
        </div>
        )
    }
}
