import React from 'react'
import SVGButtons from '../SVGButtons'
// import { kinds } from '../../util'
// import { newView, playfulViews } from '../playfulReducer'

import { useParams } from "react-router-dom";

import { ReactComponent as mainMapButtons } from './images/MainMapButtons.svg'
import { ReactComponent as superStageButtons } from './images/SuperStageButtons.svg'
import { ReactComponent as familySchmuddleButtons } from './images/FamilySchmuddleButtons.svg'
import { ReactComponent as memoryWoodButtons } from './images/MemoryWoodButtons.svg'

import { ReactComponent as artHouseButtons } from './images/ArtHouseButtons.svg'
import { ReactComponent as palaceDoorsButtons } from './images/PalaceDoorsButtons.svg'
import { ReactComponent as schmoMapButtons } from './images/SchmoMapButtons.svg'
import { ReactComponent as blueHouseButtons } from './images/BlueHouseButtons.svg'
import { ReactComponent as readingTreeButtons } from './images/ReadingTreeButtons.svg'

import mainMapImage from './images/MainMap.svg'
import superStage from './images/SuperStage.svg'
import familySchmuddle from './images/FamilySchmuddle.svg'
import memoryWood from './images/MemoryWood.svg'

import artHouse from './images/ArtHouse.svg'
import palaceDoors from './images/PalaceDoors.svg'
import schmoMap from './images/SchmoMap.svg'
import blueHouse from './images/BlueHouse.svg'
import readingTree from './images/ReadingTree.svg'

let Home = props => <SVGButtons svg={mainMapButtons} image={mainMapImage} buttons={[
    {id:'MemoryPalace', linkTo:'/map/palace'},
    {id:'MemoryMission', linkTo:'/adventurePath/James'},
    {id:'SchmideoCenter', linkTo:'/moduleSelector/watch'},

    {id:'SchmoTown', linkTo:'/map/schmoHouses'},
    {id:'SuperStage', linkTo:'/map/superStage'},
    {id:'ReadingTree', linkTo:'/map/readingTree'},
    {id:'MemoryWood', linkTo:'/map/memoryWood'},
    {id:'FamilySchmuddle', linkTo:'/map/familySchmuddle'},

    {id:'Button1', linkTo:'/moduleSelector/watch'},
    {id:'Button2', linkTo:'/moduleSelector/joSchmo'},
    {id:'Button3', linkTo:'/moduleSelector/discussion'},
    {id:'Button4', linkTo:'/moduleSelector/schmash'},
    {id:'Button5', linkTo:'/moduleSelector/dragon'},

    {id:'Help', onClick: ()=>window.location = 'http://bythebookthebible.com/get-started-1'},
]}/>

let SuperStage = props => <SVGButtons svg={superStageButtons} image={superStage} buttons={[
    {id:'Karaoke', linkTo:'/moduleSelector/karaoke'},
    {id:'Dance', linkTo:'/moduleSelector/dance'},
    {id:'Speed', linkTo:'/moduleSelector/speedyZoom'},
    {id:'Blooper', linkTo:'/moduleSelector/blooper'},
]}/>

let FamilySchmuddle = props => <SVGButtons svg={familySchmuddleButtons} image={familySchmuddle} buttons={[
    {id:'FamilyDevotional', linkTo:'/moduleSelector/discussion'},
    {id:'LifeApplicationPage', linkTo:'/moduleSelector/mySchmo'},
    {id:'ActivityPrintOut', linkTo:'/moduleSelector/activity'},
    {id:'ColoringPrintOut', linkTo:'/moduleSelector/colorPrint'},
    {id:'BookMarkPrintOut', linkTo:'/moduleSelector/bookmark'},
    {id:'MemoryGameIdea', linkTo:'/moduleSelector/game'},
    {id:'Notebook', linkTo:'/moduleSelector/notebook'},
]} />

let SchmoHouses = props => <SVGButtons svg={schmoMapButtons} image={schmoMap} buttons={[
    {id:'yellowHouse', linkTo:'/moduleSelector/kidRecite'},
    {id:'pinkHouse', linkTo:'/moduleSelector/intro'},
    {id:'blueHouse', linkTo:'/map/blueHouse'},
]}/>

let BlueHouse = props => <SVGButtons svg={blueHouseButtons} image={blueHouse} buttons={[
    {id:'RoSchmo', linkTo:'/moduleSelector/roSchmo'},
    {id:'MySchmo', linkTo:'/moduleSelector/mySchmo'},
    {id:'JoSchmo', linkTo:'/moduleSelector/joSchmo'},
]} />

let MemoryWood = props => <SVGButtons svg={memoryWoodButtons} image={memoryWoodButtons} image={memoryWood} buttons={[
    {id:'ArtHouse', linkTo:'/map/artHouse'},
    {id:'SchplashPond', linkTo:'/moduleSelector/schmash'},
    {id:'EchoWell', linkTo:'/moduleSelector/echo'},
    {id:'LooptyLair', linkTo:'/moduleSelector/dragon'},
]} />

let ReadingTree = props => <SVGButtons svg={readingTreeButtons} image={readingTree} buttons={[
    {id:'book', linkTo:'/moduleSelector/popupBook'},
    {id:'princess', linkTo:'/moduleSelector/princess'},
    {id:'bookmarks', linkTo:'/moduleSelector/bookmark'},
]} />

let ArtHouse = props => <SVGButtons svg={artHouseButtons} image={artHouse} buttons={[
    {id:'coloring', linkTo:'/moduleSelector/color'},
    {id:'craft', linkTo:'/moduleSelector/activity'},
]}/>

let Palace = props => <SVGButtons svg={palaceDoorsButtons} image={palaceDoors} buttons={[
    {id:'Psalm', linkTo:'/palace/Psalm-1'},
    {id:'Matthew', linkTo:'/palace/Matthew-5'},
    {id:'James', linkTo:'/palace/James-1'},
    {id:'Ephesians', linkTo:'/palace/Ephesians-6'},
]}/>

let maps = {
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

export function Map(props) {
    let {viewSelected } = useParams();
    
    if(props.default)
        return maps['home'];
    else 
        return maps[viewSelected];
}