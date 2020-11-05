import React from 'react'
import SVGButtons from '../SVGButtons'
import { kinds } from '../../util'
import { newView, playfulViews } from '../playfulReducer'

import { ReactComponent as artMap } from './images/ArtMap.svg'
import { ReactComponent as mainMap } from './images/MainMap.svg'
import { ReactComponent as palaceDoors } from './images/PalaceDoors.svg'
import { ReactComponent as schmoMap } from './images/SchmoMap.svg'
import { ReactComponent as centerStage } from './images/CenterStage.svg'

let Home = props => <SVGButtons svg={mainMap} buttons={[
    {id:'Memory_Palace', dispatch: newView({view:playfulViews.map, viewSelected:'palace'})},
    {id:'Memorize', dispatch: newView({view:playfulViews.map, viewSelected:'centerStage'})},
    {id:'Echo_Well', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.echo})},
    {id:'Schmoment_Town', dispatch: newView({view:playfulViews.map, viewSelected:'schmoHouses'})},
    {id:'Color', dispatch: newView({view:playfulViews.map, viewSelected:'artGazebo'})},
    {id:'Dragon', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.speed})},
    {id:'Play', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.watch})},
    {id:'Memory_Mission', dispatch: newView({view:playfulViews.adventurePath, viewSelected:'James'})},
    {id:'Reading_Tree', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.book})},
]}><mainMap /></SVGButtons>

let CenterStage = props => <SVGButtons svg={centerStage} buttons={[
    {id:'Dance', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.dance})},
    {id:'Karaoke', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.karaoke})},
    {id:'Watch', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.watch})},
]}/>

let SchmoHouses = props => <SVGButtons svg={schmoMap} buttons={[
    {id:'yellowHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.discussion})},
    {id:'pinkHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.schmoment})},
    {id:'blueHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.joSchmo})},
]}/>

let ArtGazebo = props => <SVGButtons svg={artMap} buttons={[
    {id:'coloring', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.coloring})},
    {id:'craft', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.craft})},
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
    centerStage:<CenterStage />,
    artGazebo:<ArtGazebo />,
    schmoHouses:<SchmoHouses />,
}
