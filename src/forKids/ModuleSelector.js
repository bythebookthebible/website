import React, { useContext } from "react"
import { Container, Row, Col } from "react-bootstrap"

import { DispatchContext, StateContext } from "./kidModeApp"
import { scriptureFromKey } from '../util'

import karaokeBg from '../images/maps/KaraokeBackground.svg'
import karaokeBar from '../images/maps/KaraokeVerseBar.svg'
import bookBar from '../images/maps/BookVerseBar.svg'

function ModuleSelctor(props) {
  let dispatch = useContext(DispatchContext)
  let state = useContext(StateContext);

  let moduleFilter = props.moduleFilter || (key=>Object.keys(state.resources[key]).includes('Music Video'))

  // Make scripture grouped by Book, Chapter
  let scriptures = Object.keys(state.resources).filter(moduleFilter).reduce((cum, key) => {
    let s = scriptureFromKey(key)
    cum[s.book] = cum[s.book] || {}
    cum[s.book][s.chapter] = cum[s.book][s.chapter] || {}
    cum[s.book][s.chapter][s.verses] = s
    return cum
  }, {})

  return <div style={{height:'90vh', position:'relative', backgroundImage: "url(" + props.background + ")", ...props.style}}>
    <Container fluid style={{...props.style}}>
      {Object.keys(scriptures).map(book =>
        Object.keys(scriptures[book]).map(chapter => <>
          <Row style={{backgroundImage: "url(" + props.chapterBackground + ")"}}>
            <Col>{`${book} ${chapter}`}</Col>
          </Row>
          <Row>
            {Object.keys(scriptures[book][chapter]).map(verses =>
              <Col>{verses}</Col>
            )}
          </Row>
        </>)
      )}
    </Container>
  </div>
}

export default {
  dragon: <ModuleSelctor background={karaokeBg} chapterBackground={karaokeBar} />,
  book: <ModuleSelctor style={{backgroundColor:"#dd08"}} chapterBackground={bookBar} />,
}