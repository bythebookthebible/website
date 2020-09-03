import React from 'react'
import ButtonMap from './buttonMap'
import { kinds } from '../util'
import { newView, playfulViews } from './playfulReducer'

import artMap from '../images/maps/ArtMap.svg'
import mainMap from '../images/maps/MainMap.svg'
import palaceDoors from '../images/maps/palaceDoors.svg'
import schmoMap from '../images/maps/SchmoMap.svg'
import townSquareMap from '../images/maps/TownSquareMap.svg'

let Home = props => <div>
    <ButtonMap src={mainMap} buttons={[
        {id:'castle', dispatch: newView({view:playfulViews.map, viewSelected:'palace'})},
        {id:'City_Center', dispatch: newView({view:playfulViews.map, viewSelected:'townSquare'})},
        // {id:'Water_Well', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.echo})},
        {id:'Jo_Schmo_s_House', dispatch: newView({view:playfulViews.map, viewSelected:'schmoHouses'})},
        {id:'Gazeebo', dispatch: newView({view:playfulViews.map, viewSelected:'artGazebo'})},
        {id:'Dragon_s_Lair', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.speed})},
        // {id:'Game_Factory', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.game})},
        {id:'Tree', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.book})},
    ]}/>
</div>

let TownSquare = props => <div>
    <ButtonMap src={townSquareMap} buttons={[
        {id:'crowd', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.dance})},
        {id:'mic', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.karaoke})},
        {id:'stage', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.watch})},
    ]}/>
</div>

let SchmoHouses = props => <div>
    <ButtonMap src={schmoMap} buttons={[
        {id:'yellowHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.discussion})},
        {id:'pinkHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.schmoment})},
        {id:'blueHouse', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.joSchmo})},
    ]}/>
</div>

let ArtGazebo = props => <div>
    <ButtonMap src={artMap} buttons={[
        {id:'coloring', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.coloring})},
        {id:'craft', dispatch: newView({view:playfulViews.moduleSelector, viewSelected:kinds.craft})},
    ]}/>
</div>

let Palace = props => <div>
    <ButtonMap src={palaceDoors} buttons={[
        {id:'Psalms_Proverbs', dispatch: newView({view:playfulViews.palace, viewSelected:'Psalm'})},
        {id:'Matthew', dispatch: newView({view:playfulViews.palace, viewSelected:'Proverbs'})},
        {id:'James', dispatch: newView({view:playfulViews.palace, viewSelected:'James'})},
        {id:'Ephesians', dispatch: newView({view:playfulViews.palace, viewSelected:'Ephesians'})},
    ]}/>
</div>

export default {
    home:<Home />,
    palace:<Palace />,
    townSquare:<TownSquare />,
    artGazebo:<ArtGazebo />,
    schmoHouses:<SchmoHouses />,
}
