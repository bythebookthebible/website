import React, { Component, useState, useEffect, useRef, useReducer} from 'react'
import mainMap from '../images/maps/MainMap.svg'
import palaceMap from '../images/maps/palaceDoors.svg'
import readingTree from '../images/maps/TestTree.svg'
import townSquare from '../images/maps/TownSquareMap.svg'
import ButtonMap from './buttonMap'
import { kinds } from '../util'

let Tree = props => <div>
    <h1>Tree</h1>
    <ButtonMap src={readingTree} buttons={[
        {id:'Palace', dispatch: {type:'newView', view:'map', viewSelected:'home'}},
        {id:'Branch1', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-001-010', kind: kinds.watch}}},
        {id:'Branch2', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-007-011', kind: kinds.watch}}},
        {id:'Branch3', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-012-014', kind: kinds.watch}}},
        {id:'Branch4', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-015-020', kind: kinds.watch}}},
        {id:'Branch5', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-021-023', kind: kinds.watch}}},
        {id:'Branch6', dispatch: {type:'newView', view:'activity', activity:{key:'39-007-024-029', kind: kinds.watch}}},
    ]}/>
</div>

let Map = props => <div>
    <ButtonMap src={mainMap} buttons={[
        {id:'Memory_Palace',  dispatch: {type:'newView', view:'map', viewSelected:'palace'}},
        {id:'City_Center',    dispatch: {type:'newView', view:'map', viewSelected:'townSquare'}},
        {id:'Water_Well',     dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'Jo_Schmo_House', dispatch: {type:'newView', view:'map', viewSelected:'tree'}},
        {id:'Art_Gazebo',     dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'Dragon',         dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'Game_Factory',   dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'Book_Tree',      dispatch: {type:'newView', view:'moduleSelector', viewSelected:'book'}},
    ]}/>
</div>

let TownSquare = props => <div>
    <ButtonMap src={townSquare} buttons={[
        {id:'Dancer_Button', dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'MicButton',     dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
        {id:'StageButton',   dispatch: {type:'newView', view:'moduleSelector', viewSelected:'dragon'}},
    ]}/>
</div>

let Palace = props => <div>
    <ButtonMap src={palaceMap} buttons={[
        {id:'Psalms_Proverbs', dispatch: {type:'newView', view:'palace'}},
        {id:'Matthew', dispatch: {type:'newView', view:'palace'}},
        {id:'James', dispatch: {type:'newView', view:'palace'}},
        {id:'Ephesians', dispatch: {type:'newView', view:'palace'}},
    ]}/>
</div>

export default {
    home:<Map />,
    tree:<Tree />,
    palace:<Palace />,
    townSquare:<TownSquare />,
}
