import React, { useContext } from "react"
import { Container, Row, Col } from "react-bootstrap"

import { DispatchContext, StateContext, actionTypes, actionViews } from "./kidModeApp"
import { scriptureFromKey, getKinds, kinds, resoucesForKinds } from '../util'

import defaultIcon from '../images/kidsPageSidebar/diamond.png'

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
import colorVerseBar from '../images/maps/ColorVerseBar.svg'
import pinkHouseInside from '../images/maps/PinkHouseInside.svg'

function ModuleSelctor(props) {
  console.log("at least here")
  let dispatch = useContext(DispatchContext)
  let state = useContext(StateContext);

  let moduleFilter = key => resoucesForKinds[state.viewSelected].every(kind => getKinds(state.resources[key]).includes(kind))

  // Make scripture grouped by Book, Chapter
  let scriptures = Object.keys(state.resources).filter(moduleFilter).reduce((cum, key) => {
    let s = scriptureFromKey(key)
    cum[s.book] = cum[s.book] || {}
    cum[s.book][s.chapter] = cum[s.book][s.chapter] || {}
    cum[s.book][s.chapter][s.verses] = {...s, key:key}
    return cum
  }, {})

  console.log('scriptures', scriptures)

  if(Object.keys(scriptures).length == 0) return <div style={{...props.style['firstDiv'], paddingTop:'20%'}}>
    <div style={props.style['bookRow']}>
      <div style={props.style['bookCol']}>
        Comming Soon...
        <br/>
        <button className="btn btn-round btn-primary" 
          onClick={()=>dispatch({type:'newView', view:'map', viewSelected:'home'})}>
          Back to map!
        </button>
      </div>
    </div>
  </div>

  return <div style={props.style['firstDiv']}>
    <Container fluid style={props.style['container']}>

      <div style={props.style['secondDiv']}>
      
        <div style={props.style['thirdDiv']}>
          {/* <div style={{backgroundOrigin: 'content-box', backgroundImage: "url(" + props.chapterBackground + ")", backgroundRepeat: 'none', backgroundAttachment: 'local'}}> */}
            {Object.keys(scriptures).map(book =>
              Object.keys(scriptures[book]).map(chapter => <>
                <Row style={props.style['bookRow']}>
                  <Col style={props.style['bookCol']}>{`${book} ${chapter}`}</Col>
                </Row>
                <Row style={props.style['verseRow']}>
                  {Object.keys(scriptures[book][chapter]).map(verses =>
                    //content
                    <Col xs={props.verseDisplaySmall} sm={props.verseDisplaySmall} lg={props.verseDisplayLarge} style={props.style['verseCol']}
                      onClick={()=>dispatch({
                        type:actionTypes.newView, 
                        view:actionViews.activity, 
                        activity:{key:scriptures[book][chapter][verses].key, kind: state.viewSelected}
                      })}>
                      <img src={defaultIcon} style={{width: '60px', height: '60px'}} />
                      <br></br>{verses}
                    </Col>
                  )}
                </Row>
              </>)
            )}
        </div>
      </div>
    </Container>
    <div style={props.style['img']}><img src={props.cornerIcon} /></div>
  </div>

// return <div style={{minHeight:'90vh', position:'relative', backgroundColor:"#ffde1a4c"}}>

// <Container fluid style={{paddingLeft: '0', paddingRight: '0', backgroundColor:"#ffde1a4c" }}>

// {/* <div style={{backgroundOrigin: 'content-box', backgroundImage: "url(" + props.chapterBackground + ")", backgroundRepeat: 'none', backgroundAttachment: 'local'}}> */}
//   {Object.keys(scriptures).map(book =>
//     Object.keys(scriptures[book]).map(chapter => <>
//       <Row style={{backgroundOrigin: 'content-box', backgroundImage: "url(" + bookVerseBar + ")", backgroundRepeat: 'none', backgroundAttachment: 'local', backgroundSize: 'cover'}}>
//         <Col style={{ padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'white' }}>{`${book} ${chapter}`}</Col>
//       </Row>
//       <Row style={{ marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' }}>
//         {Object.keys(scriptures[book][chapter]).map(verses =>
//           //content
//           <Col sm={props.scale} style={{ }}><img src={defaultIcon} style={{width: '60px', height: '60px'}} /><br></br>{verses}</Col>
//         )}
//       </Row>
//     </>)
//   )}
// </Container>
// </div>
  // } 
  // else if (props.module == 'dragon') {
  //   return <div>

  //   <Container fluid style={{...props.style, paddingLeft: '0', paddingRight: '0'}}>
      
  //   <div style={{marginTop: '-55px', marginBottom: '-70px',backgroundSize: 'cover, contain', backgroundImage: "url(" + props.background + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local'}}>
  //     <div style={{padding: '70px', paddingBottom: '100px'}}>
  //     {Object.keys(scriptures).map(book =>
  //       Object.keys(scriptures[book]).map(chapter => <>
  //         <Row style={{position:'relative', backgroundImage: "url(" + props.chapterBackground + ")", backgroundRepeat: 'no-repeat', right: '-50%'}}>
  //           <Col style={{ padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'black' }}>{`${book} ${chapter}`}</Col>
  //         </Row>
  //         <Row style={{ marginLeft:'50%', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' }}>
  //           {Object.keys(scriptures[book][chapter]).map(verses =>
  //             //content
  //             <Col sm={4} style={{ }}>
  //               <div>
  //                 <img src={defaultIcon} style={{width: '60px', height: '60px'}} /><br></br>{verses}
  //               </div>
  //             </Col>
  //           )}

  //         </Row>
  //       </>)
  //     )}
  //     </div>
  //     </div>
  //   </Container>
  // </div>
  
  // }
}

let styles = {
  bookStyle: {
    firstDiv: {minHeight:'90vh', position:'relative', backgroundColor:"#ffde1a4c"},
    container: {paddingLeft: '0', paddingRight: '0', backgroundColor:"#ffde1a4c" },
    secondDiv: {},
    thirdDiv: {},
    bookRow: {backgroundOrigin: 'content-box', backgroundImage: "url(" + bookVerseBar + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', backgroundSize: 'cover'},
    bookCol: { fontFamily: 'Loopiejuice-Regular', padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'white' },
    verseRow: { marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' },
    verseCol: {},
    img: {position: 'absolute'}
  },
  // fix with actual dragon background
  // speedStyle: {
  //   firstDiv: {position:'relative', backgroundColor:"#ffde1a4c"},
  //   container: {paddingLeft: '0', paddingRight: '0', backgroundColor:"#ffde1a4c" },
  //   secondDiv: {backgroundSize: 'contain, cover', backgroundImage: "url(" + dragonBackground + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', backgroudSize: 'cover'},
  //   thirdDiv: {},
  //   bookRow: {backgroundImage: "url(" + dragonVerseBar + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', backgroundSize: 'cover', paddingTop: '100px'},
  //   bookCol: {  padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'white', textAlign: 'center' },
  //   verseRow: { marginBottom:'-100px', marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' },
  //   verseCol: {color: 'white'}
  // },

  speedStyle: {
    firstDiv: {position:'relative', backgroundColor:"#ffde1a4c"},
    container: {paddingLeft: '0', paddingRight: '0', backgroundColor:"#ffde1a4c" },
    secondDiv: {position: 'relative',width: '100vw', height: '120vh', backgroundSize: 'cover', backgroundImage: "url(" + dragonBackground + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local'},
    thirdDiv: {position: 'absolute', top: '40%', right: '20%', left: '5%', bottom:'5%', overflowX:'hidden'},
    bookRow: {backgroundImage: "url(" + dragonVerseBar + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', backgroundSize: 'cover'},
    bookCol: { fontFamily: 'Loopiejuice-Regular', fontSize: '1.4rem', fontWeight: 'bold', color: 'white', textAlign: 'center' },
    verseRow: { marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowY: 'hidden' },
    verseCol: {color: 'white', paddingBottom: '10px'},
    img: {position: 'absolute'}
  },

  coloringStyle: {
    firstDiv: {minHeight:'90vh', position:'relative'},
    container: {paddingLeft: '0', paddingRight: '0', backgroundColor:"white" },
    secondDiv: {backgroundSize: 'cover', backgroundImage: "url(" + colorBackground + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', backgroundPosition: 'center top'},
    thirdDiv: {paddingLeft: '30%', paddingRight: '27%', paddingTop: '23%', paddingBottom: '40%', overflowX: 'hidden'},
    bookRow: {backgroundOrigin: 'content-box', backgroundImage: "url(" + colorVerseBar + ")", backgroundRepeat: 'none', backgroundAttachment: 'local', backgroundSize: 'cover', backgroundPosition: 'center'},
    bookCol: {fontFamily: 'Loopiejuice-Regular', padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'black', textAlign: 'center'},
    verseRow: { marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowY: 'hidden' },
    verseCol: {},
    img: {position: 'absolute'}
  },

  craftStyle: {
    firstDiv: {minHeight:'90vh', position:'relative'},
    container: {paddingLeft: '0', paddingRight: '0', backgroundColor:"white" },
    secondDiv: {backgroundSize: 'cover', backgroundImage: "url(" + craftBackground + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', backgroundPosition: 'center top'},
    thirdDiv: {paddingLeft: '30%', paddingRight: '27%', paddingTop: '23%', paddingBottom: '40%', overflowX: 'hidden'},
    bookRow: {backgroundOrigin: 'content-box', backgroundImage: "url(" + colorVerseBar + ")", backgroundRepeat: 'none', backgroundAttachment: 'local', backgroundSize: 'cover', backgroundPosition: 'center'},
    bookCol: { fontFamily: 'Loopiejuice-Regular', padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'black', textAlign: 'center'},
    verseRow: { marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowY: 'hidden' },
    verseCol: {},
    img: {position: 'absolute'}
  },

  danceStyle: {
    firstDiv: {position:'relative'},
    container: {paddingLeft: '0', paddingRight: '0', backgroundColor:'white' },
    secondDiv: {height: '100vh', width: '100vw', backgroundSize: 'cover', backgroundImage: "url(" + danceBackground + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', backgroundPosition: 'center top'},
    thirdDiv: {position: 'absolute', top: '35%', left: '30%', right: '30%', bottom: '2%', overflowY: 'auto', overflowX: 'hidden'},
    bookRow: {backgroundOrigin: 'content-box', backgroundImage: "url(" + danceVerseBar + ")", backgroundRepeat: 'none', backgroundAttachment: 'local', backgroundSize: 'cover', backgroundPosition: 'center', paddingTop: '40px'},
    bookCol: { fontFamily: 'Loopiejuice-Regular', padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'black', textAlign: 'center'},
    verseRow: { marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' },
    verseCol: {},
    img: {position: 'absolute'}
  },

  karaokeStyle: {
    firstDiv: {},
    container: {paddingLeft: '0', paddingRight: '0', backgroundColor:"#ffde1a4c" },
    secondDiv: {marginTop:'-65px', marginBottom: '-70px', backgroundSize: 'cover', backgroundImage: "url(" + karaokeBackground + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', backgroundPosition: 'center top'},
    thirdDiv: {padding: '70px', paddingBottom: '100px'},
    bookRow: {position:'relative', backgroundImage: "url(" + karaokeVerseBar + ")", backgroundRepeat: 'no-repeat', right: '-50%'},
    bookCol: {fontFamily: 'Loopiejuice-Regular', padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'black' },
    verseRow: { marginLeft:'50%', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden' },
    verseCol: {},
    img: {position: 'absolute'}
  },

  watchStyle: {
    firstDiv: {position:'relative'},
    container: {paddingLeft: '0', paddingRight: '0', backgroundColor:"white" },
    secondDiv: {backgroundSize: 'cover', height: '100vh', width: '100vw', marginTop: '-10px', marginBottom:'-10px', backgroundImage: "url(" + stageBackground + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', backgroundPosition: 'center top'},
    thirdDiv: {position:'absolute', left: '30%', right: '27%', top: '10%', bottom: '2%', overflowY: 'auto', overflowX: 'hidden' },
    bookRow: {backgroundOrigin: 'content-box', backgroundImage: "url(" + danceVerseBar + ")", backgroundRepeat: 'none', backgroundAttachment: 'local', backgroundSize: 'cover', backgroundPosition: 'center', paddingTop: '60px'},
    bookCol: {fontFamily: 'Loopiejuice-Regular', padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'black', textAlign: 'center'},
    verseRow: { marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden' },
    verseCol: {},
    img: {position: 'absolute'}
  },

  echoStyle: {
    firstDiv: {position:'relative'},
    container: {paddingLeft: '0', paddingRight: '0', backgroundColor:"white" },
    secondDiv: {marginBottom:'-5px', height: '100vh', width:'100vw', backgroundSize: 'cover', backgroundImage: "url(" + echoBackground + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local', backgroundPosition: 'center top'},
    thirdDiv: {position: 'absolute', left: '20%', right: '50%', top: '5%', bottom: '5%', overflowY: 'auto', overflowX: 'hidden'},
    bookRow: { backgroundOrigin: 'content-box', backgroundImage: "url(" + echoVerseBar + ")", backgroundRepeat: 'none', backgroundAttachment: 'local', backgroundSize: 'cover', backgroundPosition: 'center'},
    bookCol: {fontFamily: 'Loopiejuice-Regular', padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'black', textAlign: 'center'},
    verseRow: { marginBottom: '10px', marginTop: '4px', flexWrap: 'nowrap', overflowX: 'auto', overflowY: 'hidden', justifyContent:'flex-start' },
    verseCol: {color: 'white'},
    img: {position: 'absolute'}
  },

  joSchmoStyle: {
    firstDiv: {minHeight:'90vh',height: '150vh', width:'100vw', position:'relative', backgroundColor:"#ffde1a4c"},
    container: {height: '150vh', zIndex:'1', overflowX: 'hidden', overflowY:'auto', paddingLeft: '0', paddingRight: '0', backgroundColor:"#ffde1a4c" },
    secondDiv: {width: '100vw', height: '100vh', },
    thirdDiv: {},
    bookRow: {backgroundOrigin: 'content-box', backgroundImage: "url(" + bookVerseBar + ")", backgroundRepeat: 'none', backgroundAttachment: 'scroll', backgroundSize: 'cover'},
    bookCol: {fontFamily: 'Loopiejuice-Regular', padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'white' },
    verseRow: { marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' },
    verseCol: {},
    img: {position: 'fixed', right: '10px', bottom: '10px', zIndex: '2', width: '15%'}
  },

  schmomentStyle: {
    firstDiv: {minHeight:'90vh',height: '150vh', width:'100vw', position:'relative', backgroundColor:"#ffde1a4c"},
    container: {height: '150vh', zIndex:'1', overflowX: 'hidden', overflowY:'auto', paddingLeft: '0', paddingRight: '0', backgroundColor:"#ffde1a4c" },
    secondDiv: {width: '100vw', height: '100vh', },
    thirdDiv: {},
    bookRow: {backgroundOrigin: 'content-box', backgroundImage: "url(" + bookVerseBar + ")", backgroundRepeat: 'none', backgroundAttachment: 'scroll', backgroundSize: 'cover'},
    bookCol: {fontFamily: 'Loopiejuice-Regular', padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'white' },
    verseRow: { marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' },
    verseCol: {},
    img: {position: 'fixed', right: '10px', bottom: '10px', zIndex: '2', width: '25%'}
  },

  discussionStyle: {
    firstDiv: {minHeight:'90vh',height: '150vh', width:'100vw', position:'relative', backgroundColor:"#ffde1a4c"},
    container: {height: '150vh', zIndex:'1', overflowX: 'hidden', overflowY:'auto', paddingLeft: '0', paddingRight: '0', backgroundColor:"#ffde1a4c" },
    secondDiv: {width: '100vw', height: '100vh', },
    thirdDiv: {},
    bookRow: {backgroundOrigin: 'content-box', backgroundImage: "url(" + bookVerseBar + ")", backgroundRepeat: 'none', backgroundAttachment: 'scroll', backgroundSize: 'cover'},
    bookCol: {fontFamily: 'Loopiejuice-Regular', padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'white' },
    verseRow: { marginLeft: '30px', marginRight: '30px', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' },
    verseCol: {},
    img: {position: 'fixed', right: '10px', bottom: '10px', zIndex: '2', width: '25%'}
  }

  


  //   return <div>

  //   <Container fluid style={{...props.style, paddingLeft: '0', paddingRight: '0'}}>
      
  //   <div style={{marginTop: '-55px', marginBottom: '-70px',backgroundSize: 'cover, contain', backgroundImage: "url(" + props.background + ")", backgroundRepeat: 'no-repeat', backgroundAttachment: 'local'}}>
  //     <div style={{padding: '70px', paddingBottom: '100px'}}>
  //     {Object.keys(scriptures).map(book =>
  //       Object.keys(scriptures[book]).map(chapter => <>
  //         <Row style={{position:'relative', backgroundImage: "url(" + props.chapterBackground + ")", backgroundRepeat: 'no-repeat', right: '-50%'}}>
  //           <Col style={{ padding: '5%', fontSize: '1.4rem', fontWeight: 'bold', color: 'black' }}>{`${book} ${chapter}`}</Col>
  //         </Row>
  //         <Row style={{ marginLeft:'50%', justifyContent: 'flex-start', flexWrap: 'nowrap', overflowX: 'auto' }}>
  //           {Object.keys(scriptures[book][chapter]).map(verses =>
  //             //content
  //             <Col sm={4} style={{ }}>
  //               <div>
  //                 <img src={defaultIcon} style={{width: '60px', height: '60px'}} /><br></br>{verses}
  //               </div>
  //             </Col>
    
  

  
}


export default {
  book: <ModuleSelctor verseDisplaySmall={2} verseDisplayLarge={2} style={styles['bookStyle']} />,
  // games: <ModuleSelctor background={gamesBackground} chapterBackground={gamesVerseBar} module='games' />,
  speed: <ModuleSelctor verseDisplaySmall={3} verseDisplayLarge={2} style={styles['speedStyle']} />,
  coloring: <ModuleSelctor verseDisplaySmall={6} verseDisplayLarge={4} style={styles['coloringStyle']} />,
  craft: <ModuleSelctor verseDisplaySmall={6} verseDisplayLarge={4} style={styles['craftStyle']} />,
  dance: <ModuleSelctor verseDisplaySmall={6} verseDisplayLarge={4} style={styles['danceStyle']} />,
  karaoke: <ModuleSelctor verseDisplaySmall={6} verseDisplayLarge={3} style={styles['karaokeStyle']} />,
  watch: <ModuleSelctor verseDisplaySmall={6} verseDisplayLarge={3} style={styles['watchStyle']} />,
  echo: <ModuleSelctor verseDisplaySmall={5} verseDisplayLarge={2} style={styles['echoStyle']} />,
  joSchmo: <ModuleSelctor verseDisplaySmall={2} verseDisplayLarge={2} style={styles['joSchmoStyle']}  cornerIcon={blueHouseInside} />,
  schmoment: <ModuleSelctor verseDisplaySmall={2} verseDisplayLarge={2} style={styles['schmomentStyle']} cornerIcon={pinkHouseInside} />,
  discussion: <ModuleSelctor verseDisplaySmall={2} verseDisplayLarge={2} style={styles['discussionStyle']} cornerIcon={yelllowHouseInside} />,
}
