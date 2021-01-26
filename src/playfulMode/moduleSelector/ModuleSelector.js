import React, { useState } from "react"
import { Container, Row, Col } from "react-bootstrap"

import { scriptureFromKey, getKidKinds } from '../../util'
import './moduleSelector.scss'

import defaultIcon from './images/defaultIcon.png'
import lock from '../images/Lock.svg'

import { storage } from "../../firebase"
import { useAsyncEffect, useMemoryResources } from "../../common/hooks"
import { useDispatch, useSelector } from "react-redux"
import { newView, playfulViews } from "../playfulReducer"
import { AbsoluteCentered } from "../../common/components"

export default function ModuleSelctor(props) {
  let dispatch = useDispatch()
  let resources = useMemoryResources()
  let viewSelected = useSelector(state => state.playful.viewSelected)

  // Make scripture grouped by Book, Chapter
  let scriptures = Object.keys(resources)
    .filter(key => getKidKinds(resources[key]).includes(viewSelected))
    .reduce((cum, key) => {
      let s = scriptureFromKey(key)
      cum[s.book] = cum[s.book] || {}
      cum[s.book][s.chapter] = cum[s.book][s.chapter] || {}
      cum[s.book][s.chapter][s.verses] = {...s, key:key}
      return cum
  }, {})

  let content = <Container fluid>
    <Row className='bookTitle'>
      <Col>Coming Soon...</Col>
    </Row>
  </Container>

  if(Object.keys(scriptures).length != 0) {
    content = <Container fluid>
      {Object.keys(scriptures).map(book =>
        Object.keys(scriptures[book]).map(chapter => <React.Fragment key={`${book} ${chapter}`}>
          <Row className='bookTitle'>
            <Col>{`${book} ${chapter}`}</Col>
          </Row>
          <Row className='verseRow'>
            {Object.keys(scriptures[book][chapter]).map(verses => {
              //content
              let locked = !!resources[scriptures[book][chapter][verses].key].lock

              return <Col key={`${book} ${chapter} ${verses}`} className='verseItem'
                onClick={()=>!locked && dispatch(newView({
                  view:playfulViews.activity,
                  viewSelected:{module:scriptures[book][chapter][verses].key, kind: viewSelected}
                }))}>
                <Icon module={scriptures[book][chapter][verses].key} />
                {locked && <AbsoluteCentered><img src={lock} /></AbsoluteCentered>}
              </Col>
            })}
          </Row>
        </React.Fragment>)
      )}
    </Container>
  }

  return <div className={`moduleSelector ${viewSelected}`} >
    <div className='selectorContainer'>
      {content}
    </div>
    <div className='corner' />
  </div>
}

function Icon(props) {
  let iconRef = useMemoryResources(resources => resources[props.module].icon)
  let title = useMemoryResources(resources => resources[props.module].title)
  let verse = scriptureFromKey(props.module)
  let [src, setSrc] = useState(defaultIcon)
  
  useAsyncEffect(async abort => {
    if(iconRef) {
      const downloadUrl = await storage.ref(iconRef[0]).getDownloadURL()
      if(!abort.current) setSrc(downloadUrl)
    }
  }, [iconRef])

  return <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 389.01 204.98">
    <defs>
      <style>{".cls-1{font - size:44.28px;}.cls-1,.cls-2,.cls-5{fill:#231f20;}.cls-1,.cls-5{font - family:Loopiejuice-Regular, Loopiejuice;}.cls-2{opacity:0.4;}.cls-3{fill:#fff;}.cls-4,.cls-8{fill:none;stroke-miterlimit:10;}.cls-4{stroke:#00bff3;stroke-width:13.17px;}.cls-5{font - size:17.22px;}.cls-6{letter - spacing:-0.02em;}.cls-7{fill:#45ade2;opacity:0.7;}.cls-8{stroke:#fff;stroke-width:5.49px;}"}</style>
    </defs>
    <g id="Label">
      <text class="cls-1" transform="translate(191.1 132.09)">{title}</text>
    </g>
    <g id="Icon">
      <image width="426" height="419" transform="translate(34.38 29.24) scale(0.32)" xlinkHref={src}/>
  </g>
    <g id="GreyBackground">
      <rect class="cls-2" x="5.04" y="6.92" width="374.47" height="191.1" />
    </g>
    <g id="WhiteBackground">
      <g id="Layer_4" data-name="Layer 4">
        <rect class="cls-3" x="211.82" y="164.14" width="155.52" height="30.86" rx="2.7" />
      </g>
    </g>
    <g id="BlueFrame">
      <path class="cls-4" d="M382.39,198.44q-80.38-4-166.95-4.58c-72.26-.39-141.52,1.31-207.52,4.58,2.74-28.58,4.5-59.91,4.57-93.63C12.56,69.61,10.76,37,7.92,7.34q88,4,183.19,4.28c66.31.06,130.14-1.48,191.28-4.28C379.57,38,377.84,71.67,378,107.92,378.17,140.31,379.83,170.59,382.39,198.44Z" 
      transform="translate(-0.64 -0.42)" />
    </g>
    <g id="Verse">
      <text class="cls-5" transform="translate(227.56 181.75)">
        <tspan class="cls-6">{`${verse.book} ${verse.chapter}:${verse.verses}`}</tspan>
      </text>
    </g>
    <g id="PlayButton">
      <circle class="cls-7" cx="195.58" cy="102.47" r="56.41" />
      <circle class="cls-8" cx="195.58" cy="102.47" r="56.41" />
      <path class="cls-3" d="M187,80l31.31,20.33a3.62,3.62,0,0,1-.06,6.11l-31.31,19.4a3.62,3.62,0,0,1-5.53-3.08V83A3.62,3.62,0,0,1,187,80Z" transform="translate(-0.64 -0.42)" />
    </g>
  </svg>
}