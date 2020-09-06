import React, { useState, useRef} from 'react';
import logoSpinning from '../images/logoSpinning.svg'
import { Container } from 'react-bootstrap';

export function Spinner(props) {
  return <img src={logoSpinning} {...props} />
}

export function LoadingPage(props) {
  return <div className='container-xl'>
    <Spinner style={{width:'80%', maxWidth:'500px', margin:'auto'}} />
  </div>
}