import React from 'react';
import logoSpinning from '../images/logoSpinning.svg'
import {ReactComponent as Background} from '../playfulMode/maps/images/MainMap.svg'
// import lightBackground from '../images/lightBackground.webp'

export function Spinner(props) {
  return <img src={logoSpinning} {...props} />
}

export function LoadingPage(props) {
  return <div style={{textAlign:'center'}} >
    <Spinner style={{width:'80%', maxWidth:'500px', margin:'20% auto'}} />
  </div>
}
// // Prettier Loading Page Too Heavy????
// export function LoadingPage(props) {
//   return <div className='container-xl' style={{
//     backgroundImage:`url(${lightBackground})`,
//     backgroundSize:'cover', padding:0,
//     backgroundPositionX: 'center',
//     position: 'absolute', top:0, left:0, right:0, bottom:0,
//   }}>
//     <div style={{backgroundColor:'#fff9', width:'100%', height:'100%', textAlign:'center'}} >
//       <Spinner style={{width:'80%', maxWidth:'500px', margin:'20% auto'}} />
//     </div>
//   </div>
// }

export function AbsoluteCentered(props) {
  return React.cloneElement(props.children, {style:{
    position: 'absolute',
    margin: 0,
    top: '50%',
    left: '50%',
    transform: 'translateY(-50%) translateX(-50%)',
    ...props.style,
    }})
}

export function PlayfulPlainContainer(props) {
  let width = window.innerWidth
  let height = window.innerHeight
  let op = props.opacity || .7
  let blur = props.blur || 5

  let background = <svg style={{position:'absolute', overflow:'hidden', width:'100%', height:'100%', ...props.style}} viewBox={`0 0 ${width} ${height}`}>
    <defs>
      <filter id="blur">
        <feGaussianBlur stdDeviation={blur} result="blur" />
        <feColorMatrix type='matrix' in="blur"
        values={`${op} 0 0 0 ${1-op}   0 ${op} 0 0 ${1-op}   0 0 ${op} 0 ${1-op}   0 0 0 1 0`} />
      </filter>
    </defs>
    <Background x={0} y={0} width={width} height={height} style={{overflow:'hidden'}} filter="url(#blur)" />
  </svg>

  return <>
    {background}
    <AbsoluteCentered>
      {props.children}
    </AbsoluteCentered>
  </>
}