import React from 'react'
import SVGButtons from '../SVGButtons'
import { kinds } from '../../util'
import { newView, playfulViews } from '../playfulReducer'

import artMap from './images/ArtMap.svg'
import mainMap from './images/MainMap.svg'
import palaceDoors from './images/palaceDoors.svg'
import schmoMap from './images/SchmoMap.svg'
import townSquareMap from './images/TownSquareMap.svg'

let Home = props => <div>
    <SVGButtons src={mainMap} buttons={[
        {id:'castle', dispatch: newView({view:playfulViews.map, viewSelected:'palace'})},
        {id:'City_Center', dispatch: newView({view:playfulViews.map, viewSelected:'townSquare'})},
        // {id:'Water_Well', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.echo})},
        {id:'Jo_Schmo_s_House', dispatch: newView({view:playfulViews.map, viewSelected:'schmoHouses'})},
        {id:'Gazeebo', dispatch: newView({view:playfulViews.map, viewSelected:'artGazebo'})},
        {id:'Dragon_s_Lair', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.speed})},
        {id:'Game_Factory', dispatch: newView({view:playfulViews.adventurePath, viewSelected:'James'})},
        {id:'Tree', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.book})},
    ]}/>
</div>

let TownSquare = props => <div>
    <SVGButtons src={townSquareMap} buttons={[
        {id:'crowd', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.dance})},
        {id:'mic', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.karaoke})},
        {id:'stage', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.watch})},
    ]}/>
</div>

let SchmoHouses = props => <div>
    <SVGButtons src={schmoMap} buttons={[
        {id:'yellowHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.discussion})},
        {id:'pinkHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.schmoment})},
        {id:'blueHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.joSchmo})},
    ]}/>
</div>

let ArtGazebo = props => <div>
    <SVGButtons src={artMap} buttons={[
        {id:'coloring', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.coloring})},
        {id:'craft', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.craft})},
    ]}/>
</div>

let Palace = props => <div>
    <SVGButtons src={palaceDoors} buttons={[
        {id:'Psalms_Proverbs', dispatch: newView({view:playfulViews.palace, viewSelected:'Psalm 1'})},
        {id:'Matthew', dispatch: newView({view:playfulViews.palace, viewSelected:'Matthew 5'})},
        {id:'James', dispatch: newView({view:playfulViews.palace, viewSelected:'James 1'})},
        {id:'Ephesians', dispatch: newView({view:playfulViews.palace, viewSelected:'Ephesians 6'})},
    ]}/>
</div>

export default {
    home:<Home />,
    palace:<Palace />,
    townSquare:<TownSquare />,
    artGazebo:<ArtGazebo />,
    schmoHouses:<SchmoHouses />,
}
