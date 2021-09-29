import React, { useState } from "react"
import { Container, Row, Col } from "react-bootstrap"

import { scriptureFromKey, getKidKinds } from '../../util'
import './moduleSelector.scss'

import defaultIcon from './images/defaultIcon.png'
import lock from '../images/Lock.svg'

import { storage } from "../../firebase"
import { useAsyncEffect, useMemoryResources } from "../../common/hooks"
import { useDispatch, useSelector } from "react-redux"
// import { newView, playfulViews } from "../playfulReducer"
import { AbsoluteCentered } from "../../common/components"
import Thumbnail from "./Thumbnail"
import { useParams, useHistory} from "react-router-dom";

export default function ModuleSelctor(props) {
  // let dispatch = useDispatch()
  let resources = useMemoryResources()
  let { viewSelected } = useParams()
  let history = useHistory()

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
                onClick={()=>!locked && history.push(`/activity/${viewSelected}/${scriptures[book][chapter][verses].key}`)} >
                <Thumbnail module={scriptures[book][chapter][verses].key} kind={viewSelected} />
                {locked && <AbsoluteCentered><img src={lock} /></AbsoluteCentered>}
              </Col>
            })}
          </Row>
        </React.Fragment>)
      )}
    </Container>
  }

  return <div className={`moduleSelectorBackground ${viewSelected}`} >
    <div className='selectorContainer'>
      {content}
    </div>
    <div className='corner' />
  </div>
}
