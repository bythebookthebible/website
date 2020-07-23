import React, { Component, useState, useEffect, useRef, useReducer} from 'react'
import ButtonMap from './buttonMap'
import { kinds } from '../util'
import { actionTypes, actionViews } from './kidModeApp'

import artMap from '../images/maps/ArtMap.svg'
import mainMap from '../images/maps/MainMap.svg'
import palaceDoors from '../images/maps/palaceDoors.svg'
import schmoMap from '../images/maps/SchmoMap.svg'
import testMap from '../images/maps/TestMap.svg'
import townSquareMap from '../images/maps/TownSquareMap.svg'

let Test = props => <div>
    <h1>Test</h1>
    <ButtonMap src={testMap} buttons={[
        {id:'Palace', dispatch: {type:actionTypes.newView, view:actionViews.map, viewSelected:'home'}},
        {id:'Branch1', dispatch: {type:actionTypes.newView, view:actionViews.activity, activity:{key:'39-007-001-010', kind: kinds.watch}}},
        {id:'Branch2', dispatch: {type:actionTypes.newView, view:actionViews.activity, activity:{key:'39-007-007-011', kind: kinds.watch}}},
        {id:'Branch3', dispatch: {type:actionTypes.newView, view:actionViews.activity, activity:{key:'39-007-012-014', kind: kinds.watch}}},
        {id:'Branch4', dispatch: {type:actionTypes.newView, view:actionViews.activity, activity:{key:'39-007-015-020', kind: kinds.watch}}},
        {id:'Branch5', dispatch: {type:actionTypes.newView, view:actionViews.activity, activity:{key:'39-007-021-023', kind: kinds.watch}}},
        {id:'Branch6', dispatch: {type:actionTypes.newView, view:actionViews.activity, activity:{key:'39-007-024-029', kind: kinds.watch}}},
    ]}/>
</div>

let Map = props => <div>
    <ButtonMap src={mainMap} buttons={[
        {id:'Memory_Palace',  dispatch: {type:actionTypes.newView, view:actionViews.map, viewSelected:'palace'}},
        {id:'City_Center',    dispatch: {type:actionTypes.newView, view:actionViews.map, viewSelected:'townSquare'}},
        // {id:'Water_Well',     dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.echo}},
        {id:'Jo_Schmo_House', dispatch: {type:actionTypes.newView, view:actionViews.map, viewSelected:'schmoHouses'}},
        {id:'Art_Gazebo',     dispatch: {type:actionTypes.newView, view:actionViews.map, viewSelected:'artGazebo'}},
        {id:'Dragon',         dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.speed}},
        {id:'Game_Factory',   dispatch: {type:actionTypes.newView, view:actionViews.map, viewSelected:'test'}},
        {id:'Book_Tree',      dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.book}},
    ]}/>
</div>

let TownSquare = props => <div>
    <ButtonMap src={townSquareMap} buttons={[
        {id:'DancerButton', dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.dance}},
        {id:'MicButton',     dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.karaoke}},
        {id:'StageButton',   dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.watch}},
    ]}/>
</div>

let SchmoHouses = props => <div>
    <ButtonMap src={schmoMap} buttons={[
        {id:'YellowHouse', dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.discussion}},
        {id:'PinkHouse',     dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.schmoment}},
        {id:'BlueHouse',   dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.joSchmo}},
    ]}/>
</div>

let ArtGazebo = props => <div>
    <ButtonMap src={artMap} buttons={[
        {id:'Color', dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.coloring}},
        {id:'Craft',   dispatch: {type:actionTypes.newView, view:actionViews.moduleSelector, viewSelected:kinds.craft}},
    ]}/>
</div>

let Palace = props => <div>
    <ButtonMap src={palaceDoors} buttons={[
        {id:'Psalms_Proverbs', dispatch: {type:actionTypes.newView, view:actionViews.palace}},
        {id:'Matthew', dispatch: {type:actionTypes.newView, view:actionViews.palace}},
        {id:'James', dispatch: {type:actionTypes.newView, view:actionViews.palace}},
        {id:'Ephesians', dispatch: {type:actionTypes.newView, view:actionViews.palace}},
    ]}/>
</div>

export default {
    home:<Map />,
    test:<Test />,
    palace:<Palace />,
    townSquare:<TownSquare />,
    artGazebo:<ArtGazebo />,
    schmoHouses:<SchmoHouses />,
}
