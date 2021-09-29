import React from 'react'
import SVGButtons from '../SVGButtons'
// import { kinds } from '../../util'
// import { newView, playfulViews } from '../playfulReducer'

import { useParams } from "react-router-dom";

import { ReactComponent as artHouse } from './images/ArtHouse.svg'
// import { ReactComponent as mainMap } from './images/MainMap.svg'
import mainMap from './images/MainMap/MainMap'
import { ReactComponent as palaceDoors } from './images/PalaceDoors.svg'
import { ReactComponent as schmoMap } from './images/SchmoMap.svg'
import { ReactComponent as blueHouse } from './images/BlueHouse.svg'
import { ReactComponent as readingTree } from './images/ReadingTree.svg'
import { ReactComponent as memoryWood } from './images/MemoryWood.svg'
// import { ReactComponent as superStage } from './images/SuperStage.svg'
import superStage from './images/SuperStage/SuperStage'
import { ReactComponent as familySchmuddle } from './images/FamilySchmuddle.svg'

let Home = props => <SVGButtons svg={mainMap} buttons={[
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
]}><mainMap /></SVGButtons>

let SuperStage = props => <SVGButtons svg={superStage} buttons={[
    {id:'Karaoke', linkTo:'/moduleSelector/karaoke'},
    {id:'Dance', linkTo:'/moduleSelector/dance'},
    {id:'Speed', linkTo:'/moduleSelector/speedyZoom'},
    {id:'Blooper', linkTo:'/moduleSelector/blooper'},
]}/>

let FamilySchmuddle = props => <SVGButtons svg={familySchmuddle} buttons={[
    {id:'FamilyDevotional', linkTo:'/moduleSelector/discussion'},
    {id:'LifeApplicationPage', linkTo:'/moduleSelector/mySchmo'},
    {id:'ActivityPrintOut', linkTo:'/moduleSelector/activity'},
    {id:'ColoringPrintOut', linkTo:'/moduleSelector/colorPrint'},
    {id:'BookMarkPrintOut', linkTo:'/moduleSelector/bookmark'},
    {id:'MemoryGameIdea', linkTo:'/moduleSelector/game'},
    {id:'Notebook', linkTo:'/moduleSelector/notebook'},
]} />

let SchmoHouses = props => <SVGButtons svg={schmoMap} buttons={[
    {id:'yellowHouse', linkTo:'/moduleSelector/kidRecite'},
    {id:'pinkHouse', linkTo:'/moduleSelector/intro'},
    {id:'blueHouse', linkTo:'/map/blueHouse'},
]}/>

let BlueHouse = props => <SVGButtons svg={blueHouse} buttons={[
    {id:'RoSchmo', linkTo:'/moduleSelector/roSchmo'},
    {id:'MySchmo', linkTo:'/moduleSelector/mySchmo'},
    {id:'JoSchmo', linkTo:'/moduleSelector/joSchmo'},
]} />

let MemoryWood = props => <SVGButtons svg={memoryWood} buttons={[
    {id:'ArtHouse', linkTo:'/map/artHouse'},
    {id:'SchplashPond', linkTo:'/moduleSelector/schmash'},
    {id:'EchoWell', linkTo:'/moduleSelector/echo'},
    {id:'LooptyLair', linkTo:'/moduleSelector/dragon'},
]} />

let ReadingTree = props => <SVGButtons svg={readingTree} buttons={[
    {id:'book', linkTo:'/moduleSelector/book'},
    {id:'princess', linkTo:'/moduleSelector/princess'},
    {id:'bookmarks', linkTo:'/moduleSelector/bookmark'},
]} />

let ArtHouse = props => <SVGButtons svg={artHouse} buttons={[
    {id:'coloring', linkTo:'/moduleSelector/color'},
    {id:'craft', linkTo:'/moduleSelector/activity'},
]}/>

let Palace = props => <SVGButtons svg={palaceDoors} buttons={[
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