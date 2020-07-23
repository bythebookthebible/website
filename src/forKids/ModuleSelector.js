import React, { useContext } from "react"
import { Container, Row, Col } from "react-bootstrap"

import { DispatchContext, StateContext } from "./kidModeApp"
import { scriptureFromKey, getKinds, kinds } from '../util'

import karaokeBg from '../images/maps/KaraokeBackground.svg'
import karaokeBar from '../images/maps/KaraokeVerseBar.svg'
import bookBar from '../images/maps/BookVerseBar.svg'

import tree from '../images/kidsPageSidebar/tree.png'

function ModuleSelctor(props) {
  let dispatch = useContext(DispatchContext)
  let state = useContext(StateContext);

  let moduleFilter = props.moduleFilter || (key=>getKinds(state.resources[key]).includes(kinds.watch))

  // Make scripture grouped by Book, Chapter
  let scriptures = Object.keys(state.resources).filter(moduleFilter).reduce((cum, key) => {
    let s = scriptureFromKey(key)
    cum[s.book] = cum[s.book] || {}
    cum[s.book][s.chapter] = cum[s.book][s.chapter] || {}
    cum[s.book][s.chapter][s.verses] = s
    return cum
  }, {})

  if (props.module == 'book') {
    return <div style={{minHeight:'90vh', position:'relative', backgroundImage: "url(" + props.background + ")", ...props.style}}>
    <Container fluid style={{...props.style, paddingLeft: '0', paddingRight: '0'}}>
    {/* <div style={{backgroundOrigin: 'content-box', backgroundImage: "url(" + props.chapterBackground + ")", backgroundRepeat: 'none', backgroundAttachment: 'local'}}> */}
      {Object.keys(scriptures).map(book =>
        Object.keys(scriptures[book]).map(chapter => <>
          <Row style={{backgroundOrigin: 'content-box', backgroundImage: "url(" + props.chapterBackground + ")", backgroundRepeat: 'none', backgroundAttachment: 'local', backgroundSize: 'cover'}}>
            <Col style={{ padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'white' }}>{`${book} ${chapter}`}</Col>
          </Row>
          <Row style={{ marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' }}>
            {Object.keys(scriptures[book][chapter]).map(verses =>
              //content
              <div>
                <Col sm={2} style={{ }}><img src={tree} style={{width: '60px', height: '60px'}} /><br></br>{verses}</Col>
              </div>
            )}
          </Row>
        </>)
      )}
    </Container>
  </div>
  } else if (props.module == 'dragon') {
    return <div>
    <Container fluid style={{...props.style, paddingLeft: '0', paddingRight: '0'}}>
    <div style={{marginTop: '-55px', marginBottom: '-70px',backgroundSize: 'cover, contain', backgroundImage: "url(" + props.background + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local'}}>
      <div style={{padding: '70px', paddingBottom: '100px'}}>
      {Object.keys(scriptures).map(book =>
        Object.keys(scriptures[book]).map(chapter => <>
          <Row style={{position:'relative', backgroundImage: "url(" + props.chapterBackground + ")", backgroundRepeat: 'no-repeat', right: '-50%'}}>
            <Col style={{ padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'black' }}>{`${book} ${chapter}`}</Col>
          </Row>
          <Row style={{ marginLeft:'50%', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' }}>
            {Object.keys(scriptures[book][chapter]).map(verses =>
              //content
              <Col sm={4} style={{ }}>
                <div>
                  <img src={tree} style={{width: '60px', height: '60px'}} /><br></br>{verses}
                </div>
              </Col>
            )}

          </Row>
        </>)
      )}
      </div>
      </div>
    </Container>
  </div>
  }

}

export default {
  dragon: <ModuleSelctor background={karaokeBg} chapterBackground={karaokeBar} module='dragon' />,
  book: <ModuleSelctor style={{backgroundColor:"#dd08", minHeight: '100vh'}} chapterBackground={bookBar} module='book' />,
}
