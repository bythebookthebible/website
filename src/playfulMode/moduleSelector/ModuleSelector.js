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

  if(Object.keys(scriptures).length == 0)
    return <div className={`moduleSelector comingSoon ${viewSelected}`} >
    <Container fluid className=''>
      <Row className='bookTitle'>
        <Col>Coming Soon...</Col>
      </Row>
    </Container>
    <div className='corner' />
  </div>

  return <div className={`moduleSelector ${viewSelected}`} >
    <Container fluid className='selectorContainer'>
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
                <br />{verses}
              </Col>
            })}
          </Row>
        </React.Fragment>)
      )}
    </Container>
    <div className='corner' />
  </div>
}

function Icon(props) {
  let iconRef = useMemoryResources(resources => resources[props.module].icon)
  let [src, setSrc] = useState(defaultIcon)
  
  useAsyncEffect(async abort => {
    if(iconRef) {
      const downloadUrl = await storage.ref(iconRef[0]).getDownloadURL()
      if(!abort.current) setSrc(downloadUrl)
    }
  }, [iconRef])

  return <img src={src} />
}