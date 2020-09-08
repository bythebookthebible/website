import React, { useState, useRef} from 'react';
import logoSpinning from '../images/logoSpinning.svg'

export function Spinner(props) {
  return <img src={logoSpinning} {...props} />
}

export function LoadingPage(props) {
  return <div className='container-xl'>
    <Spinner style={{width:'80%', maxWidth:'500px', margin:'auto'}} />
  </div>
}

export function AbsoluteCentered(props) {
  return React.cloneElement(props.children, {style:{
    position: 'absolute',
    margin: 0,
    top: '50%',
    left: '50%',
    transform: 'translateY(-50%) translateX(-50%)',
    ...props.style,
      // marginLeft: `-${size.width/2}px`,
      // marginTop: `-${size.height/2}px`,
    }})
}