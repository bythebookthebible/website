import React from 'react'
import SVGButtons from '../SVGButtons'
import { kinds } from '../../util'
import { newView, playfulViews } from '../playfulReducer'

import { ReactComponent as artHouse } from './images/ArtHouse.svg'
// import { ReactComponent as mainMap } from './images/MainMap.svg'
import mainMap from './images/MainMap/MainMap'
import { ReactComponent as palaceDoors } from './images/PalaceDoors.svg'
import { ReactComponent as schmoMap } from './images/SchmoMap.svg'
import { ReactComponent as blueHouse } from './images/BlueHouse.svg'
import { ReactComponent as readingTree } from './images/ReadingTree.svg'
import { ReactComponent as memoryWood } from './images/MemoryWood.svg'
import { ReactComponent as superStage } from './images/SuperStage.svg'
import { ReactComponent as familySchmuddle } from './images/FamilySchmuddle.svg'

let Home = props => <SVGButtons svg={mainMap} buttons={[
    {id:'MemoryPalace', dispatch: newView({view:playfulViews.map, viewSelected:'palace'})},
    {id:'MemoryMission', dispatch: newView({ view: playfulViews.adventurePath, viewSelected: 'James' })},
    {id:'SchmideoCenter', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.watch })},
    {id:'SchmoTown', dispatch: newView({view:playfulViews.map, viewSelected:'schmoHouses'})},
    {id:'SuperStage', dispatch: newView({ view: playfulViews.map, viewSelected: 'superStage' })},
    {id:'ReadingTree', dispatch: newView({view:playfulViews.map, viewSelected:'readingTree'})},
    {id:'MemoryWood', dispatch: newView({ view: playfulViews.map, viewSelected: 'memoryWood' })},
    {id:'FamilySchmuddle', dispatch: newView({ view: playfulViews.map, viewSelected: 'familySchmuddle' })},
    {id:'Button1', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.watch })},
    {id:'Button2', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.joSchmo })},
    {id:'Button3', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.discussion })},
    {id:'Button4', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.schmash })},
    {id:'Button5', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.dragon })},
    {id:'Help', onClick: ()=>window.location.href = 'bythebookthebible.com/get-started-1'},
]}><mainMap /></SVGButtons>

let SuperStage = props => <SVGButtons svg={superStage} buttons={[
    {id:'Karaoke', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.karaoke})},
    {id:'Dance', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.dance }) },
    {id:'SpeedyZoom', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.speedyZoom})},
    {id:'Blooper', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.blooper }) },
]}/>

let FamilySchmuddle = props => <SVGButtons svg={familySchmuddle} buttons={[
    { id: 'FamilyDevotional', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.discussion }) },
    { id: 'LifeApplicationPage', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.mySchmo }) },
    { id: 'ActivityPrintOut', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.activity }) },
    { id: 'ColoringPrintOut', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.colorPrint }) },
    { id: 'BookMarkPrintOut', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.bookmark }) },
    { id: 'MemoryGameIdea', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.game }) },
    { id: 'Notebook', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.notebook }) },
]} />

let SchmoHouses = props => <SVGButtons svg={schmoMap} buttons={[
    {id:'yellowHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.kidRecite})},
    {id:'pinkHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.intro})},
    {id:'blueHouse', dispatch: newView({ view: playfulViews.map, viewSelected: 'blueHouse'}) },
]}/>

let BlueHouse = props => <SVGButtons svg={blueHouse} buttons={[
    { id: 'RoSchmo', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.roSchmo}) },
    { id: 'MySchmo', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.mySchmo }) },
    { id: 'JoSchmo', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.joSchmo }) },
]} />

let MemoryWood = props => <SVGButtons svg={memoryWood} buttons={[
    { id: 'ArtHouse', dispatch: newView({ view: playfulViews.map, viewSelected: 'artHouse'}) },
    { id: 'SchplashPond', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.schmash }) },
    { id: 'EchoWell', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.echo }) },
    { id: 'LooptyLair', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.dragon }) },
]} />

let ReadingTree = props => <SVGButtons svg={readingTree} buttons={[
    { id: 'book', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.book }) },
    { id: 'princess', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.princess }) },
    { id: 'bookmarks', dispatch: newView({ view: playfulViews.moduleSelector, viewSelected: kinds.bookmark }) },
]} />

let ArtHouse = props => <SVGButtons svg={artHouse} buttons={[
    {id:'coloring', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.color})},
    {id:'craft', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.activity})},
]}/>

let Palace = props => <SVGButtons svg={palaceDoors} buttons={[
    {id:'Psalm', dispatch: newView({view:playfulViews.palace, viewSelected:'Psalm 1'})},
    {id:'Matthew', dispatch: newView({view:playfulViews.palace, viewSelected:'Matthew 5'})},
    {id:'James', dispatch: newView({view:playfulViews.palace, viewSelected:'James 1'})},
    {id:'Ephesians', dispatch: newView({view:playfulViews.palace, viewSelected:'Ephesians 6'})},
]}/>

export default {
    home:<Home />,
    palace:<Palace />,
    schmoHouses:<SchmoHouses />,
    blueHouse: <BlueHouse />,
    readingTree: <ReadingTree />,
    memoryWood: <MemoryWood />,
    superStage: <SuperStage />,
    familySchmuddle: <FamilySchmuddle />,
    artHouse: <ArtHouse />,
}
