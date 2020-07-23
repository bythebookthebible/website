import React, { useContext } from "react"
import { Container, Row, Col } from "react-bootstrap"

import { DispatchContext, StateContext } from "./kidModeApp"
import { scriptureFromKey, getKinds, kinds } from '../util'

import defaultIcon from '../images/kidsPageSidebar/tree.png'

import testTree from '../images/maps/TestTree.svg'

import artVerseBar from '../images/maps/ArtVerseBar.svg'
import blueHouseInside from '../images/maps/BlueHouseInside.svg'
import bookVerseBar from '../images/maps/BookVerseBar.svg'
import colorBackground from '../images/maps/ColorBackground.svg'
import craftBackground from '../images/maps/CraftBackground.svg'
import danceBackground from '../images/maps/DanceBackground.svg'
import danceVerseBar from '../images/maps/DanceVerseBar.svg'
import dragonBackground from '../images/maps/DragonBackground.svg'
import dragonVerseBar from '../images/maps/DragonVerseBar.svg'
import echoBackground from '../images/maps/EchoBackground.svg'
import echoVerseBar from '../images/maps/EchoVerseBar.svg'
import stageBackground from '../images/maps/StageBackground.svg'
import stageVerseBar from '../images/maps/StageVerseBar.svg'
import karaokeBackground from '../images/maps/KaraokeBackground.svg'
import karaokeVerseBar from '../images/maps/KaraokeVerseBar.svg'
import yelllowHouseInside from '../images/maps/YelllowHouseInside.svg'

// // to import later
let pinkHouseInside = yelllowHouseInside


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
              <Col sm={2} style={{ }}><img src={defaultIcon} style={{width: '60px', height: '60px'}} /><br></br>{verses}</Col>
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
                  <img src={defaultIcon} style={{width: '60px', height: '60px'}} /><br></br>{verses}
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
  book: <ModuleSelctor style={{backgroundColor:"#ffde1a4c"}} chapterBackground={bookVerseBar} module='book' />,
  // games: <ModuleSelctor background={gamesBackground} chapterBackground={gamesVerseBar} module='games' />,
  speed: <ModuleSelctor background={dragonBackground} chapterBackground={dragonVerseBar} module='speed' />,
  coloring: <ModuleSelctor background={colorBackground} chapterBackground={artVerseBar} module='coloring' />,
  craft: <ModuleSelctor background={craftBackground} chapterBackground={artVerseBar} module='craft' />,
  dance: <ModuleSelctor background={danceBackground} chapterBackground={danceVerseBar} module='dance' />,
  karaoke: <ModuleSelctor background={karaokeBackground} chapterBackground={karaokeVerseBar} module='karaoke' />,
  watch: <ModuleSelctor background={stageBackground} chapterBackground={stageVerseBar} module='watch' />,
  echo: <ModuleSelctor background={echoBackground} chapterBackground={echoVerseBar} module='echo' />,
  joSchmo: <ModuleSelctor style={{backgroundColor:"#ffde1a4c"}} chapterBackground={bookVerseBar} cornerIcon={blueHouseInside} module='joSchmo' />,
  schmoment: <ModuleSelctor style={{backgroundColor:"#ffde1a4c"}} chapterBackground={bookVerseBar} cornerIcon={pinkHouseInside} module='schmoment' />,
  discussion: <ModuleSelctor style={{backgroundColor:"#ffde1a4c"}} chapterBackground={bookVerseBar} cornerIcon={yelllowHouseInside} module='discussion' />,
}
